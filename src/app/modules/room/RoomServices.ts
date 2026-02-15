import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";



const createRoom = async (roomNumbers: number[], roomTypeId: number) => {
  const createdRooms = [];



  for (let number of roomNumbers) {
    const existing = await prisma.room.findUnique({
      where: { roomNumber: number },
    });

    if (existing) {
      continue;
    }

    const room = await prisma.room.create({
      data: {
        roomNumber: number,
        roomTypeId,
      },
    });

    createdRooms.push(room);
  }

  return createdRooms;
};


const getAllRooms = async () => {
  return await prisma.room.findMany({
    include: { roomType: true, bookings: true },
  });
};

const getRoomById = async (id: number) => {
  const room = await prisma.room.findUnique({
    where: { id },
    include: { roomType: true, bookings: true },
  });
  if (!room) {
    throw new ApiError(404, "Room not found");
  }
  return room;
};


const updateRoom = async (id: number, data: { roomNumber?: number; roomTypeId?: number }) => {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new ApiError(404, "Room not found");

 
  if (data.roomNumber) {
    const conflict = await prisma.room.findUnique({ where: { roomNumber: data.roomNumber } });
    if (conflict && conflict.id !== id) {
      throw new ApiError(400, `Room number ${data.roomNumber} already exists`);
    }
  }

  const updated = await prisma.room.update({
    where: { id },
    data,
  });

  return updated;
};


const deleteRoom = async (id: number) => {
  const room = await prisma.room.findUnique({ where: { id } });
  if (!room) throw new ApiError(404, "Room not found");

  const deleted = await prisma.room.delete({ where: { id } });
  return deleted;
};

export const RoomServices = {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
};
