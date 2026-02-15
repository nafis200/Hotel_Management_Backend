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
  const {
    userId,
    roomRequests,
    checkIn,
    checkOut,
    adults,
    children,
  } = input;


  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const allocatedRooms: { roomId: number; roomTypeId: number }[] = [];
  let totalAmount = 0;

  for (const request of roomRequests) {
    const { roomTypeId, quantity } = request;

    const roomsToAllocate = await prisma.room.findMany({
      where: {
        roomTypeId,
        bookings: {
          none: {
            booking: {
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
          },
        },
      },
      take: quantity,
    });

    if (roomsToAllocate.length < quantity) {
      throw new ApiError(
        404,
        `Not enough rooms available for roomTypeId ${roomTypeId}`
      );
    }

    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
    });

    const days =
      Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    const amountPerRoom = days * (roomType?.price || 0);
    totalAmount += amountPerRoom * roomsToAllocate.length;

    roomsToAllocate.forEach((room) =>
      allocatedRooms.push({ roomId: room.id, roomTypeId })
    );
  }

  const booking = await prisma.$transaction(async (tx) => {
    return tx.booking.create({
      data: {
        userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        adults,
        children,
        totalAmount,
        status: "CONFIRMED",
        rooms: {
          create: allocatedRooms.map((r) => ({ roomId: r.roomId })),
        },
      },
      include: {
        rooms: { include: { room: true } },
      },
    });
  });

  return booking;
};


interface AvailableRoomType {
  roomTypeId: number;
  name: string;
  price: number;
  description: string;
  facilities: string[];
  images: string[];
  totalRooms: number;
  availableRooms: number;
}

const getAvailableRoomsService = async (
  checkIn: Date,
  checkOut: Date,
): Promise<AvailableRoomType[]> => {

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    throw new Error("Invalid date format");
  }

  if (checkOut <= checkIn) {
    throw new Error("checkOut must be greater than checkIn");
  }

  checkIn.setHours(0, 0, 0, 0);
  checkOut.setHours(0, 0, 0, 0);

  const roomTypes = await prisma.roomType.findMany({
    include: {
      rooms: {
        where: {
          bookings: {
            none: {
              booking: {
                checkIn: { lt: checkOut },
                checkOut: { gt: checkIn },
              },
            },
          },
        },
      },
    },
  });

 
  return roomTypes.map((rt) => ({
    roomTypeId: rt.id,
    name: rt.name,
    price: rt.price,
    description: rt.description,
    facilities: rt.facilities,
    images: rt.images,
    totalRooms: rt.rooms.length,         
    availableRooms: rt.rooms.length,
  }));
};


interface RoomDetails {
  roomTypeId: number;
  name: string;
  description: string;
  price: number;
  facilities: string[];
  images: string[];
  totalRooms: number;
  rooms: { roomId: number; roomNumber: number }[];
}

const getSingleRoomTypeService = async (
  roomTypeId: number,
): Promise<RoomDetails> => {
  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { rooms: true },
  });

  if (!roomType) {
    throw new Error("RoomType not found");
  }

  return {
    roomTypeId: roomType.id,
    name: roomType.name,
    description: roomType.description,
    price: roomType.price,
    facilities: roomType.facilities,
    images: roomType.images,
    totalRooms: roomType.rooms.length,
    rooms: roomType.rooms.map((r) => ({
      roomId: r.id,
      roomNumber: r.roomNumber,
    })),
  };
};

 const getRoomsByDateService = async (
  checkIn: Date,
  checkOut: Date
): Promise<any> => {
  if (!checkIn || !checkOut) throw new Error("checkIn and checkOut are required");

  const rooms = await prisma.room.findMany({
    include: {
      bookings: {
        include: { booking: true } 
      }
    }
  });

  const availableRooms:any[] = [];
  const bookedRooms: any[] = [];

  rooms.forEach(room => {
    const isBooked = room.bookings.some(
      br => checkIn < br.booking.checkOut && checkOut > br.booking.checkIn
    );

    if (isBooked) {
      bookedRooms.push({ roomId: room.id, roomNumber: room.roomNumber });
    } else {
      availableRooms.push({ roomId: room.id, roomNumber: room.roomNumber });
    }
  });

  return { "available" : availableRooms, "booked" : bookedRooms };
};


const deleteRoomTypeService = async (roomTypeId: number) => {

  const roomType = await prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: { rooms: true }
  });

  if (!roomType) {
    throw new ApiError(404, "RoomType not found");
  }
  await prisma.$transaction(async (tx) => {
    const roomIds = roomType.rooms.map(r => r.id);

    if (roomIds.length > 0) {
      await tx.bookingRoom.deleteMany({
        where: { roomId: { in: roomIds } }
      });

      await tx.room.deleteMany({
        where: { id: { in: roomIds } }
      });
    }

    await tx.roomType.delete({
      where: { id: roomTypeId }
    });
  });

  return { message: "RoomType and all related rooms/bookings deleted successfully" };
};

const cancelBookingByIdService = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }


  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" }
  });

  return cancelledBooking;
};


interface BookingWithUser {
  bookingId: number;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalAmount: number;
  status: string;
  user: {
    id: number;
    name?: string | null;
    email: string;
    contactNumber?: string | null;
    profilePhoto?: string | null;
  };
}

const getSingleBookingWithUserService = async (bookingId: number): Promise<BookingWithUser> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true
    }
  });

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  return {
    bookingId: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    totalAmount: booking.totalAmount,
    status: booking.status,
    user: {
      id: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
      contactNumber: booking.user.contactNumber,
      profilePhoto: booking.user.profilePhoto
    }
  };
};




interface BookingPaginationOptions {
  page?: number;
  limit?: number;
  searchTerm?: string; 
}

const getAllBookingsWithUserService = async (
  options: BookingPaginationOptions
): Promise<{ meta: { page: number; limit: number; total: number }; data: BookingWithUser[] }> => {
  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const skip = (page - 1) * limit;

 
  const whereConditions: any = {};
  if (options.searchTerm) {
    whereConditions.user = {
      email: { contains: options.searchTerm, mode: "insensitive" },
    };
  }


  const total = await prisma.booking.count({ where: whereConditions });

  const bookings = await prisma.booking.findMany({
    where: whereConditions,
    include: { user: true },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const data: BookingWithUser[] = bookings.map((booking) => ({
    bookingId: booking.id,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    adults: booking.adults,
    children: booking.children,
    totalAmount: booking.totalAmount,
    status: booking.status,
    user: {
      id: booking.user.id,
      name: booking.user.name,
      email: booking.user.email,
      contactNumber: booking.user.contactNumber,
      profilePhoto: booking.user.profilePhoto,
    },
  }));

  return {
    meta: { page, limit, total },
    data,
  };
};





export const BookingServices = {
  bookMultipleRooms,
  getAvailableRoomsService,
  getSingleRoomTypeService,
  getRoomsByDateService,
  deleteRoomTypeService,
  cancelBookingByIdService,
  getSingleBookingWithUserService,
  getAllBookingsWithUserService,  
};


// // {
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


// GET http://localhost:5000/api/booking/available?checkIn=2026-02-20&checkOut=2026-02-23


// GET http://localhost:5000/api/booking/rooms-by-date?checkIn=2026-02-20&checkOut=2026-02-23
