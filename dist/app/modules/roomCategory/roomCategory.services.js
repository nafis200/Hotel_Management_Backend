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
exports.RoomTypeServices = void 0;
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createRoomType = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, price, images, facilities } = data;
    const roomType = yield prisma_1.default.roomType.create({
        data: { name, description, price, images, facilities },
    });
    return roomType;
});
const getAllRoomTypes = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield prisma_1.default.roomType.findMany({
        include: { rooms: true },
    });
});
const getRoomTypeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield prisma_1.default.roomType.findUnique({
        where: { id },
        include: { rooms: true },
    });
    if (!roomType) {
        throw new ApiError_1.default(404, "RoomType not found");
    }
    return roomType;
});
const updateRoomType = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield prisma_1.default.roomType.findUnique({
        where: { id },
    });
    if (!roomType) {
        throw new ApiError_1.default(404, "RoomType not found");
    }
    const updated = yield prisma_1.default.roomType.update({
        where: { id },
        data: data,
    });
    return updated;
});
const deleteRoomType = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield prisma_1.default.roomType.findUnique({
        where: { id },
    });
    if (!roomType) {
        throw new ApiError_1.default(404, "RoomType not found");
    }
    const deleted = yield prisma_1.default.roomType.delete({
        where: { id },
    });
    return deleted;
});
exports.RoomTypeServices = {
    createRoomType,
    getAllRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType,
};
