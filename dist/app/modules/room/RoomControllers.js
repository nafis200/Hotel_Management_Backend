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
exports.RoomControllers = exports.deleteRoom = exports.updateRoom = exports.getRoomById = exports.getAllRooms = exports.createRoom = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const RoomServices_1 = require("./RoomServices");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
exports.createRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomNumbers, roomTypeId } = req.body;
    const room = yield RoomServices_1.RoomServices.createRoom(roomNumbers, roomTypeId);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.CREATED,
        success: true,
        message: "Room created successfully",
        data: room,
    });
}));
exports.getAllRooms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rooms = yield RoomServices_1.RoomServices.getAllRooms();
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Rooms fetched successfully",
        data: rooms,
    });
}));
exports.getRoomById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const room = yield RoomServices_1.RoomServices.getRoomById(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Room fetched successfully",
        data: room,
    });
}));
exports.updateRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const updated = yield RoomServices_1.RoomServices.updateRoom(id, req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Room updated successfully",
        data: updated,
    });
}));
exports.deleteRoom = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const deleted = yield RoomServices_1.RoomServices.deleteRoom(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "Room deleted successfully",
        data: deleted,
    });
}));
exports.RoomControllers = {
    createRoom: exports.createRoom,
    getAllRooms: exports.getAllRooms,
    getRoomById: exports.getRoomById,
    updateRoom: exports.updateRoom,
    deleteRoom: exports.deleteRoom
};
