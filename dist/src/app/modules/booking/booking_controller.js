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
exports.BookingController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const booking_services_1 = require("./booking_services");
const getAllBookingsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit, searchTerm } = req.query;
    const options = {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        searchTerm: searchTerm ? String(searchTerm) : undefined,
    };
    const result = yield booking_services_1.BookingServices.getAllBookingsWithUserService(options);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Bookings retrieved successfully",
        data: result,
    });
}));
const bookMultipleRoomsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const booking = yield booking_services_1.BookingServices.bookMultipleRooms(data);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Rooms booked successfully",
        data: booking,
    });
}));
const OnlinebookMultipleRoomsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const booking = yield booking_services_1.BookingServices.bookMultipleRoomsWithPayment(data);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Rooms booked successfully",
        data: booking,
    });
}));
const getAvailableRoomsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
        throw new Error("checkIn and checkOut are required");
    }
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
        throw new Error("Invalid date format");
    }
    if (checkOutDate <= checkInDate) {
        throw new Error("checkOut must be greater than checkIn");
    }
    const rooms = yield booking_services_1.BookingServices.getAvailableRoomsService(checkInDate, checkOutDate);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Available rooms retrieved successfully",
        data: rooms,
    });
}));
const getSingleRoomTypeController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomTypeId = Number(req.params.id);
    const roomType = yield booking_services_1.BookingServices.getSingleRoomTypeService(roomTypeId);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "RoomType details retrieved successfully",
        data: roomType,
    });
}));
const getRoomsByDateController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut)
        throw new Error("checkIn and checkOut are required");
    const rooms = yield booking_services_1.BookingServices.getRoomsByDateService(new Date(checkIn), new Date(checkOut));
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Rooms availability retrieved successfully",
        data: rooms,
    });
}));
const deleteRoomTypeController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomTypeId = Number(req.params.id);
    const result = yield booking_services_1.BookingServices.deleteRoomTypeService(roomTypeId);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: result.message,
    });
}));
const cancelBookingController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = Number(req.params.id);
    const cancelledBooking = yield booking_services_1.BookingServices.cancelBookingByIdService(bookingId);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Booking cancelled successfully",
        data: cancelledBooking,
    });
}));
const getSingleBookingController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookingId = Number(req.params.id);
    const booking = yield booking_services_1.BookingServices.getSingleBookingWithUserService(bookingId);
    (0, sendResponse_1.default)(res, {
        status: 200,
        success: true,
        message: "Booking details retrieved successfully",
        data: booking,
    });
}));
exports.BookingController = {
    getSingleBookingController,
    cancelBookingController,
    deleteRoomTypeController,
    getRoomsByDateController,
    getSingleRoomTypeController,
    getAvailableRoomsController,
    bookMultipleRoomsController,
    getAllBookingsController,
    OnlinebookMultipleRoomsController
};
