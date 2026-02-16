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
exports.RoomServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createRoom = (roomNumbers, roomTypeId) => __awaiter(void 0, void 0, void 0, function* () {
    const createdRooms = [];
    for (let number of roomNumbers) {
        const existing = yield prisma_1.default.room.findUnique({
            where: { roomNumber: number },
        });
        if (existing) {
            continue;
        }
        const room = yield prisma_1.default.room.create({
            data: {
                roomNumber: number,
                roomTypeId,
            },
        });
        createdRooms.push(room);
    }
    return createdRooms;
});
const getAllRooms = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.room.findMany({
        include: { roomType: true, bookings: true },
    });
});
const getRoomById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield prisma_1.default.room.findUnique({
        where: { id },
        include: { roomType: true, bookings: true },
    });
    if (!room) {
        throw new ApiError_1.default(404, "Room not found");
    }
    return room;
});
const updateRoom = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield prisma_1.default.room.findUnique({ where: { id } });
    if (!room)
        throw new ApiError_1.default(404, "Room not found");
    if (data.roomNumber) {
        const conflict = yield prisma_1.default.room.findUnique({ where: { roomNumber: data.roomNumber } });
        if (conflict && conflict.id !== id) {
            throw new ApiError_1.default(400, `Room number ${data.roomNumber} already exists`);
        }
    }
    const updated = yield prisma_1.default.room.update({
        where: { id },
        data,
    });
    return updated;
});
const deleteRoom = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield prisma_1.default.room.findUnique({ where: { id } });
    if (!room)
        throw new ApiError_1.default(404, "Room not found");
    const deleted = yield prisma_1.default.room.delete({ where: { id } });
    return deleted;
});
exports.RoomServices = {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
};
