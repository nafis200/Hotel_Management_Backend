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
exports.bookMultipleRoomsWithPayment = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const config_1 = __importDefault(require("../../config"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const axios_1 = __importDefault(require("axios"));
const TAP_SECRET_KEY = config_1.default.tap.tap_secret_key;
const BASE_URL = config_1.default.tap.tap_services_url;
const headers = {
    Authorization: `Bearer ${TAP_SECRET_KEY}`,
    "Content-Type": "application/json",
};
// ===============================
// Payment Gateway Function
// ===============================
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
    let totalAmount = 0;
    const user = yield prisma_1.default.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, contactNumber: true },
    });
    if (!user)
        throw new ApiError_1.default(404, "User not found");
    const userName = user.name || "Test User";
    const roomTypeIds = roomRequests.map((r) => r.roomTypeId);
    const roomTypes = yield prisma_1.default.roomType.findMany({
        where: { id: { in: roomTypeIds } },
    });
    if (roomTypes.length !== roomRequests.length)
        throw new ApiError_1.default(404, "Some room types not found in the database");
    for (const request of roomRequests) {
        const { roomTypeId, quantity } = request;
        const roomType = roomTypes.find((r) => r.id === roomTypeId);
        const availableRooms = yield prisma_1.default.room.findMany({
            where: {
                roomTypeId,
                bookings: {
                    none: {
                        booking: {
                            checkIn: { lt: checkOutDate },
                            checkOut: { gt: checkInDate },
                        },
                    },
                },
            },
            take: quantity,
        });
        if (availableRooms.length < quantity) {
            throw new ApiError_1.default(404, `Not enough available rooms for roomTypeId ${roomTypeId}`);
        }
        const days = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
        totalAmount += days * roomType.price * quantity;
    }
    const paymentResponse = yield createCharge({
        amount: totalAmount,
        currency: "SAR",
        name: userName,
        email: user.email || "test@example.com",
        phone: user.contactNumber || "500000000",
        countryCode: "966",
        description: `Booking for user ${userId}`,
        metadata: {
            userId: String(userId),
            checkIn: checkInDate.toISOString(),
            checkOut: checkOutDate.toISOString(),
            adults,
            children,
            roomRequests: JSON.stringify(roomRequests),
            date: new Date().toISOString(),
        },
    });
    return paymentResponse;
});
exports.bookMultipleRoomsWithPayment = bookMultipleRoomsWithPayment;
