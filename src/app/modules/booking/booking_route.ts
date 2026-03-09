import express from "express";
import { BookingController } from "./booking_controller";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();


router.post(
  "/book",
  auth(UserRole.USER, UserRole.ADMIN),
  BookingController.bookMultipleRoomsController
);

router.post("/online-book",
  auth(UserRole.USER, UserRole.ADMIN),
  BookingController.OnlinebookMultipleRoomsController
);

router.get(
  "/",
  auth(UserRole.ADMIN),
  BookingController.getAllBookingsController
);

router.patch(
  "/cancel/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  BookingController.cancelBookingController
);

router.get(
  "/available-rooms",
  BookingController.getAvailableRoomsController
);

router.get(
  "/roomsDate",
  BookingController.getRoomsByDateController
);


router.get(
  "/room-type/:id",
  BookingController.getSingleRoomTypeController
);


router.get(
  "/:id",
  auth(UserRole.USER, UserRole.ADMIN),
  BookingController.getSingleBookingController
);


router.delete(
  "/room-type/:id",
  auth(UserRole.ADMIN),
  BookingController.deleteRoomTypeController
);

export const BookingRoutes = router;


// http://localhost:5000/api/book?page=1&limit=10&searchTerm=john


// http://localhost:5000/api/book/book

//  {
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


// http://localhost:5000/api/book/available-rooms?checkIn=2026-02-20&checkOut=2026-02-22


// http://localhost:5000/api/book/rooms-by-date?checkIn=2026-02-20&checkOut=2026-02-22


