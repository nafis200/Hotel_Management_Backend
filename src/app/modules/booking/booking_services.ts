
import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";

interface RoomRequest {
  roomTypeId: number;
  quantity: number;
}

interface MultiRoomBookingInput {
  userId: number;
  roomRequests: RoomRequest[];
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
}

const bookMultipleRooms = async (input: MultiRoomBookingInput) => {
  const { userId, roomRequests, checkIn, checkOut, adults, children } = input;

  const allocatedRooms: { roomId: number; roomTypeId: number }[] = [];
  let totalAmount = 0;

  for (const request of roomRequests) {
    const { roomTypeId, quantity } = request;

    const roomsOfType = await prisma.room.findMany({
      where: { roomTypeId },
      include: { bookings: { include: { booking: true } } }
    });

    const availableRooms = roomsOfType.filter(room =>
      !room.bookings.some(br => checkIn < br.booking.checkOut && checkOut > br.booking.checkIn)
    );

    if (availableRooms.length < quantity) {
      throw new ApiError(404,
        `Not enough rooms available for roomTypeId ${roomTypeId}. Requested ${quantity}, available ${availableRooms.length}`
      );
    }

  
    const roomsToAllocate = availableRooms.slice(0, quantity);

    const roomType = await prisma.roomType.findUnique({ where: { id: roomTypeId } });
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const amountPerRoom = days * (roomType?.price || 0);
    totalAmount += amountPerRoom * roomsToAllocate.length;

    roomsToAllocate.forEach(room => allocatedRooms.push({ roomId: room.id, roomTypeId }));
  }

  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        userId,
        checkIn,
        checkOut,
        adults,
        children,
        totalAmount,
        status: "CONFIRMED",
        rooms: {
          create: allocatedRooms.map(r => ({ roomId: r.roomId }))
        }
      },
      include: {
        rooms: { include: { room: true } }
      }
    });

    return newBooking;
  });

  return booking;
};

export default bookMultipleRooms;



// {
//   "userId": 10,
//   "roomRequests": [
//     { "roomTypeId": 1, "quantity": 2 }, 
//     { "roomTypeId": 2, "quantity": 1 }
//   ],
//   "checkIn": "2026-02-20T14:00:00.000Z",
//   "checkOut": "2026-02-23T12:00:00.000Z",
//   "adults": 3,
//   "children": 1
// }
