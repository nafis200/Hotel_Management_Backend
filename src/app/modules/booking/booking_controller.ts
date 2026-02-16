import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookingServices } from "./booking_services";
import { bookMultipleRoomsWithPayment } from "./book_services";



const getAllBookingsController = catchAsync(async (req: Request, res: Response) => {
  
  const { page, limit, searchTerm } = req.query;
  const options = {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    searchTerm: searchTerm ? String(searchTerm) : undefined,
  };


  const result = await BookingServices.getAllBookingsWithUserService(options);


  sendResponse(res, {
    status: httpStatus.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const bookMultipleRoomsController = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const booking = await BookingServices.bookMultipleRooms(data);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Rooms booked successfully",
    data: booking,
  });
});


const OnlinebookMultipleRoomsController = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;

 

  const booking = await BookingServices.bookMultipleRoomsWithPayment(data);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Rooms booked successfully",
    data: booking,
  });
});



const getAvailableRoomsController = catchAsync(
  async (req: Request, res: Response) => {

 

    const { checkIn, checkOut } = req.query;


    if (!checkIn || !checkOut) {
      throw new Error("checkIn and checkOut are required");
    }

    const checkInDate = new Date(checkIn as string);
    const checkOutDate = new Date(checkOut as string);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      throw new Error("Invalid date format");
    }

    if (checkOutDate <= checkInDate) {
      throw new Error("checkOut must be greater than checkIn");
    }

    const rooms =
      await BookingServices.getAvailableRoomsService(
        checkInDate,
        checkOutDate
      );

    sendResponse(res, {
      status: 200,
      success: true,
      message: "Available rooms retrieved successfully",
      data: rooms,
    });
  }
);



const getSingleRoomTypeController = catchAsync(async (req: Request, res: Response) => {
  const roomTypeId = Number(req.params.id);
  const roomType = await BookingServices.getSingleRoomTypeService(roomTypeId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "RoomType details retrieved successfully",
    data: roomType,
  });
});




const getRoomsByDateController = catchAsync(async (req: Request, res: Response) => {


  const { checkIn, checkOut } = req.query;
  if (!checkIn || !checkOut) throw new Error("checkIn and checkOut are required");

  const rooms = await BookingServices.getRoomsByDateService(new Date(checkIn as string), new Date(checkOut as string));
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Rooms availability retrieved successfully",
    data: rooms,
  });
});


const deleteRoomTypeController = catchAsync(async (req: Request, res: Response) => {
  const roomTypeId = Number(req.params.id);
  const result = await BookingServices.deleteRoomTypeService(roomTypeId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: result.message,
  });
});


const cancelBookingController = catchAsync(async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  const cancelledBooking = await BookingServices.cancelBookingByIdService(bookingId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Booking cancelled successfully",
    data: cancelledBooking,
  });
});


const getSingleBookingController = catchAsync(async (req: Request, res: Response) => {
  const bookingId = Number(req.params.id);
  const booking = await BookingServices.getSingleBookingWithUserService(bookingId);
  sendResponse(res, {
    status: 200,
    success: true,
    message: "Booking details retrieved successfully",
    data: booking,
  });
});






export const BookingController = {

    getSingleBookingController,
    cancelBookingController,
    deleteRoomTypeController,
    getRoomsByDateController,
    getSingleRoomTypeController,
    getAvailableRoomsController,
    bookMultipleRoomsController,
    getAllBookingsController,
    OnlinebookMultipleRoomsController 
       
}