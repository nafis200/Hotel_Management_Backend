import { Request, Response } from "express";

import httpStatus from "http-status";
import { RoomTypeServices } from "./roomCategory.services";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { fileUploader } from "../../helper/fileUploader";

const createRoomType = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  const bodyData = JSON.parse(req.body.body);

  const images = await Promise.all(
    files.map(async (file) => {
      const result = await fileUploader.uploadToCloudinary(file);
      return result?.secure_url;
    }),
  );

  
  const roomType = await RoomTypeServices.createRoomType(bodyData,images);

  sendResponse(res, {
    status: httpStatus.CREATED,
    success: true,
    message: "RoomType created successfully",
    data: roomType
   
  });
});

const getAllRoomTypes = catchAsync(async (req: Request, res: Response) => {
  const roomTypes = await RoomTypeServices.getAllRoomTypes();

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "RoomTypes fetched successfully",
    data: roomTypes,
  });
});

const getRoomTypeById = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const roomType = await RoomTypeServices.getRoomTypeById(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "RoomType fetched successfully",
    data: roomType,
  });
});

const updateRoomType = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = await RoomTypeServices.updateRoomType(id, req.body);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "RoomType updated successfully",
    data: updated,
  });
});

const deleteRoomType = catchAsync(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const deleted = await RoomTypeServices.deleteRoomType(id);

  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "RoomType deleted successfully",
    data: deleted,
  });
});

export const RoomTypeControllers = {
  createRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
};
