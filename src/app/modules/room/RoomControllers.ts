import { Request, Response } from "express";

import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { RoomServices } from "./RoomServices";
import sendResponse from "../../../shared/sendResponse";


export const createRoom = catchAsync(async (req: Request, res: Response) => {

   

  const { roomNumbers, roomTypeId } = req.body;

  const room = await RoomServices.createRoom(roomNumbers, roomTypeId);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "Room created successfully",
    data: room,
  });
});


export const getAllRooms = catchAsync(async (req: Request, res: Response) => {
  const rooms = await RoomServices.getAllRooms();
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Rooms fetched successfully",
    data: rooms,
  });
});


export const getRoomById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const room = await RoomServices.getRoomById(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Room fetched successfully",
    data: room,
  });
});


export const updateRoom = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await RoomServices.updateRoom(id, req.body);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Room updated successfully",
    data: updated,
  });
});


export const deleteRoom = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await RoomServices.deleteRoom(id);
  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Room deleted successfully",
    data: deleted,
  });
});

export const RoomControllers = {
    createRoom, 
    getAllRooms,
    getRoomById,
    updateRoom, 
    deleteRoom 
}
