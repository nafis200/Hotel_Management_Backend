"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingServices = exports.bookMultipleRoomsWithPayment = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const config_1 = __importDefault(require("../../config"));
const axios_1 = __importDefault(require("axios"));
const TAP_SECRET_KEY = config_1.default.tap.tap_secret_key;
const BASE_URL = config_1.default.tap.tap_services_url;
const headers = {
    Authorization: `Bearer ${TAP_SECRET_KEY}`,
    "Content-Type": "application/json",
};
const createCharge = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const body = {
        amount: payload.amount,
        currency: payload.currency || "SAR",
        customer: {
            name: payload.name || "Test User",
            email: payload.email || "test@example.com",
            phone: {
                country_code: payload.countryCode || "966",
                number: payload.phone || "500000000",
            },
        },
        source: { id: "src_all" },
        description: payload.description || "Hotel Booking Payment",
        redirect: { url: payload.redirectUrl || config_1.default.tap.tap_callback_url },
        metadata: payload.metadata || {},
    };
    const response = yield axios_1.default.post(BASE_URL, body, { headers });
    return response.data;
});
const bookMultipleRoomsWithPayment = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, roomRequests, checkIn, checkOut, adults, children } = input;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, contactNumber: true },
    });
    if (!user)
        throw new ApiError_1.default(404, "User not found");
    const userName = user.name || "Test User";
    // Validate room availability and calculate total
    const allocatedRooms = [];
    let totalAmount = 0;
    for (const request of roomRequests) {
        const { roomTypeId, quantity } = request;
        const roomsToAllocate = yield prisma_1.default.room.findMany({
            where: {
                roomTypeId,
                bookings: {
                    none: {
                        booking: {
                            checkIn: { lt: checkOutDate },
                            checkOut: { gt: checkInDate },
                            status: { not: "CANCELLED" },
                        },
                    },
                },
            },
            take: quantity,
        });
        if (roomsToAllocate.length < quantity) {
            throw new ApiError_1.default(404, `Not enough available rooms for room type ID ${roomTypeId}`);
        }
        const roomType = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
        });
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        totalAmount += days * ((roomType === null || roomType === void 0 ? void 0 : roomType.price) || 0) * quantity;
        roomsToAllocate.forEach((room) => allocatedRooms.push({ roomId: room.id, roomTypeId }));
    }
    // Create Booking with PENDING_PAYMENT status
    const booking = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        return tx.booking.create({
            data: {
                userId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                adults,
                children,
                totalAmount,
                status: "PENDING_PAYMENT",
                rooms: {
                    create: allocatedRooms.map((r) => ({ roomId: r.roomId })),
                },
            },
        });
    }));
    // Initiate Payment with bookingId in metadata
    const paymentResponse = yield createCharge({
        amount: totalAmount,
        currency: "SAR",
        name: userName,
        email: user.email || "test@example.com",
        phone: user.contactNumber || "500000000",
        countryCode: "966",
        description: `Booking for user ${userId} - Booking ID: ${booking.id}`,
        metadata: {
            bookingId: String(booking.id),
            userId: String(userId),
        },
    });
    // Update booking with payment reference (Charge ID)
    yield prisma_1.default.booking.update({
        where: { id: booking.id },
        data: { paymentId: paymentResponse.id },
    });
    return { url: paymentResponse.transaction.url };
});
exports.bookMultipleRoomsWithPayment = bookMultipleRoomsWithPayment;
const bookMultipleRooms = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, roomRequests, checkIn, checkOut, adults, children } = input;
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const allocatedRooms = [];
    let totalAmount = 0;
    for (const request of roomRequests) {
        const { roomTypeId, quantity } = request;
        const roomsToAllocate = yield prisma_1.default.room.findMany({
            where: {
                roomTypeId,
                bookings: {
                    none: {
                        booking: {
                            checkIn: { lt: checkOutDate },
                            checkOut: { gt: checkInDate },
                            status: { not: "CANCELLED" },
                        },
                    },
                },
            },
            take: quantity,
        });
        if (roomsToAllocate.length < quantity) {
            throw new ApiError_1.default(404, `Not enough rooms available for roomTypeId ${roomTypeId}`);
        }
        const roomType = yield prisma_1.default.roomType.findUnique({
            where: { id: roomTypeId },
        });
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        const amountPerRoom = days * ((roomType === null || roomType === void 0 ? void 0 : roomType.price) || 0);
        totalAmount += amountPerRoom * roomsToAllocate.length;
        roomsToAllocate.forEach((room) => allocatedRooms.push({ roomId: room.id, roomTypeId }));
    }
    const booking = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        return tx.booking.create({
            data: {
                userId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                adults,
                children,
                totalAmount,
                status: "CONFIRMED",
                rooms: {
                    create: allocatedRooms.map((r) => ({ roomId: r.roomId })),
                },
            },
            include: {
                rooms: { include: { room: true } },
            },
        });
    }));
    return booking;
});
const getAvailableRoomsService = (checkIn, checkOut) => __awaiter(void 0, void 0, void 0, function* () {
    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
        throw new Error("Invalid date format");
    }
    if (checkOut <= checkIn) {
        throw new Error("checkOut must be greater than checkIn");
    }
    // Adding check to prevent queries for past dates if necessary, although for simple view, a past query is mostly harmless for reading. 
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const roomTypes = yield prisma_1.default.roomType.findMany({
        include: {
            rooms: {
                where: {
                    bookings: {
                        none: {
                            booking: {
                                checkIn: { lt: checkOut },
                                checkOut: { gt: checkIn },
                                status: { not: "CANCELLED" },
                            },
                        },
                    },
                },
            },
        },
    });
    return roomTypes.map((rt) => ({
        roomTypeId: rt.id,
        name: rt.name,
        price: rt.price,
        description: rt.description,
        facilities: rt.facilities,
        images: rt.images,
        totalRooms: rt.rooms.length,
        availableRooms: rt.rooms.length,
    }));
});
const getSingleRoomTypeService = (roomTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield prisma_1.default.roomType.findUnique({
        where: { id: roomTypeId },
        include: { rooms: true },
    });
    if (!roomType) {
        throw new Error("RoomType not found");
    }
    return {
        roomTypeId: roomType.id,
        name: roomType.name,
        description: roomType.description,
        price: roomType.price,
        facilities: roomType.facilities,
        images: roomType.images,
        totalRooms: roomType.rooms.length,
        rooms: roomType.rooms.map((r) => ({
            roomId: r.id,
            roomNumber: r.roomNumber,
        })),
    };
});
const getRoomsByDateService = (checkIn, checkOut) => __awaiter(void 0, void 0, void 0, function* () {
    // console.log("helppppppppppp")
    if (!checkIn || !checkOut)
        throw new Error("checkIn and checkOut are required");
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    const rooms = yield prisma_1.default.room.findMany({
        include: {
            bookings: {
                include: { booking: true },
            },
        },
    });
    const availableRooms = [];
    const bookedRooms = [];
    rooms.forEach((room) => {
        const isBooked = room.bookings.some((br) => {
            const bookingCheckIn = new Date(br.booking.checkIn);
            const bookingCheckOut = new Date(br.booking.checkOut);
            return (checkIn < bookingCheckOut &&
                checkOut > bookingCheckIn &&
                br.booking.status !== "CANCELLED");
        });
        if (isBooked) {
            bookedRooms.push({ roomId: room.id, roomNumber: room.roomNumber });
        }
        else {
            availableRooms.push({ roomId: room.id, roomNumber: room.roomNumber });
        }
    });
    return { available: availableRooms, booked: bookedRooms };
});
const deleteRoomTypeService = (roomTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield prisma_1.default.roomType.findUnique({
        where: { id: roomTypeId },
        include: { rooms: true },
    });
    if (!roomType) {
        throw new ApiError_1.default(404, "RoomType not found");
    }
    yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        const roomIds = roomType.rooms.map((r) => r.id);
        if (roomIds.length > 0) {
            yield tx.bookingRoom.deleteMany({
                where: { roomId: { in: roomIds } },
            });
            yield tx.room.deleteMany({
                where: { id: { in: roomIds } },
            });
        }
        yield tx.roomType.delete({
            where: { id: roomTypeId },
        });
    }));
    return {
        message: "RoomType and all related rooms/bookings deleted successfully",
    };
});
const cancelBookingByIdService = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
    });
    if (!booking) {
        throw new ApiError_1.default(404, "Booking not found");
    }
    const cancelledBooking = yield prisma_1.default.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
    });
    return cancelledBooking;
});
const getSingleBookingWithUserService = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma_1.default.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
            rooms: {
                include: {
                    room: {
                        include: {
                            roomType: true,
                        },
                    },
                },
            },
        },
    });
    if (!booking) {
        throw new ApiError_1.default(404, "Booking not found");
    }
    return {
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        status: booking.status,
        user: {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            contactNumber: booking.user.contactNumber,
            profilePhoto: booking.user.profilePhoto,
        },
        rooms: booking.rooms,
    };
});
const getAllBookingsWithUserService = (options) => __awaiter(void 0, void 0, void 0, function* () {
    const page = options.page && options.page > 0 ? options.page : 1;
    const limit = options.limit && options.limit > 0 ? options.limit : 10;
    const skip = (page - 1) * limit;
    const whereConditions = { AND: [] };
    if (options.searchTerm) {
        whereConditions.AND.push({
            OR: [
                { id: isNaN(Number(options.searchTerm)) ? undefined : Number(options.searchTerm) },
                { userId: isNaN(Number(options.searchTerm)) ? undefined : Number(options.searchTerm) },
            ].filter(Boolean)
        });
    }
    if (options.name) {
        whereConditions.AND.push({
            user: {
                name: { contains: options.name, mode: 'insensitive' }
            }
        });
    }
    if (options.email) {
        whereConditions.AND.push({
            user: {
                email: { contains: options.email, mode: 'insensitive' }
            }
        });
    }
    if (options.date) {
        const searchDate = new Date(options.date);
        if (!isNaN(searchDate.getTime())) {
            whereConditions.AND.push({
                checkIn: { lte: searchDate },
                checkOut: { gte: searchDate }
            });
        }
    }
    if (options.checkIn) {
        const searchCheckIn = new Date(options.checkIn);
        if (!isNaN(searchCheckIn.getTime())) {
            whereConditions.AND.push({
                checkIn: { gte: searchCheckIn }
            });
        }
    }
    if (options.checkOut) {
        const searchCheckOut = new Date(options.checkOut);
        if (!isNaN(searchCheckOut.getTime())) {
            whereConditions.AND.push({
                checkOut: { lte: searchCheckOut }
            });
        }
    }
    // Remove empty AND if no conditions
    if (whereConditions.AND.length === 0) {
        delete whereConditions.AND;
    }
    const total = yield prisma_1.default.booking.count({ where: whereConditions });
    const bookings = (yield prisma_1.default.booking.findMany({
        where: whereConditions,
        include: {
            user: true,
            rooms: {
                include: {
                    room: {
                        include: {
                            roomType: true,
                        },
                    },
                },
            },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
    }));
    const data = bookings.map((booking) => ({
        id: booking.id,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        adults: booking.adults,
        children: booking.children,
        totalAmount: booking.totalAmount,
        status: booking.status,
        user: {
            id: booking.user.id,
            name: booking.user.name,
            email: booking.user.email,
            contactNumber: booking.user.contactNumber,
            profilePhoto: booking.user.profilePhoto,
        },
        rooms: booking.rooms,
    }));
    return {
        meta: { page, limit, total },
        data,
    };
});
exports.BookingServices = {
    bookMultipleRooms,
    getAvailableRoomsService,
    getSingleRoomTypeService,
    getRoomsByDateService,
    deleteRoomTypeService,
    cancelBookingByIdService,
    getSingleBookingWithUserService,
    getAllBookingsWithUserService,
    bookMultipleRoomsWithPayment: exports.bookMultipleRoomsWithPayment,
};
// // {
//   "userId": 10,
//   "roomRequests": [
//     { "roomTypeId": 1, "quantity": 2 },
//     { "roomTypeId": 2, "quantity": 1 }
//   ],
//   "checkIn": "2026-02-20T14:00:00.000Z",
//   "checkOut": "2026-02-23T12:00:00.000Z",
//   "adults": 3,
//   "children": 1
// }
// GET http://localhost:5000/api/booking/available?checkIn=2026-02-20&checkOut=2026-02-23
// GET http://localhost:5000/api/booking/rooms-by-date?checkIn=2026-02-20&checkOut=2026-02-23
