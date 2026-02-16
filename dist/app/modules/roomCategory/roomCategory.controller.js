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
exports.RoomTypeControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const roomCategory_services_1 = require("./roomCategory.services");
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const createRoomType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomType = yield roomCategory_services_1.RoomTypeServices.createRoomType(req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.CREATED,
        success: true,
        message: "RoomType created successfully",
        data: roomType,
    });
}));
const getAllRoomTypes = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const roomTypes = yield roomCategory_services_1.RoomTypeServices.getAllRoomTypes();
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "RoomTypes fetched successfully",
        data: roomTypes,
    });
}));
const getRoomTypeById = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const roomType = yield roomCategory_services_1.RoomTypeServices.getRoomTypeById(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "RoomType fetched successfully",
        data: roomType,
    });
}));
const updateRoomType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const updated = yield roomCategory_services_1.RoomTypeServices.updateRoomType(id, req.body);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "RoomType updated successfully",
        data: updated,
    });
}));
const deleteRoomType = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const deleted = yield roomCategory_services_1.RoomTypeServices.deleteRoomType(id);
    (0, sendResponse_1.default)(res, {
        status: http_status_1.default.OK,
        success: true,
        message: "RoomType deleted successfully",
        data: deleted,
    });
}));
exports.RoomTypeControllers = {
    createRoomType,
    getAllRoomTypes,
    getRoomTypeById,
    updateRoomType,
    deleteRoomType
};
