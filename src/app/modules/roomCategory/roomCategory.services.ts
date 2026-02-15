import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";


const createRoomType = async (data: any) => {
  const { name, description, price, images, facilities } = data;
  const roomType = await prisma.roomType.create({
    data: { name, description, price, images, facilities },
  });
  return roomType;
};


const getAllRoomTypes = async () => {
  return await prisma.roomType.findMany({
    include: { rooms: true },
  });
};


const getRoomTypeById = async (id: number) => {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
    include: { rooms: true },
  });
  if (!roomType) {
    throw new ApiError(404, "RoomType not found");
  }
  return roomType;
};

const updateRoomType = async (id: number, data: any) => {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
  });
  if (!roomType) {
    throw new ApiError(404, "RoomType not found");
  }

  const updated = await prisma.roomType.update({
    where: { id },
    data: data, 
  });
  return updated;
};


const deleteRoomType = async (id: number) => {
  const roomType = await prisma.roomType.findUnique({
    where: { id },
  });
  if (!roomType) {
    throw new ApiError(404, "RoomType not found");
  }

  const deleted = await prisma.roomType.delete({
    where: { id },
  });
  return deleted;
};


export const RoomTypeServices = {
  createRoomType,
  getAllRoomTypes,
  getRoomTypeById,
  updateRoomType,
  deleteRoomType,
};
