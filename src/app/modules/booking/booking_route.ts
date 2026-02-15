import express from "express";
import { BookingController } from "./booking_controller";

const router = express.Router();


router.get(
  "/",
  BookingController.getAllBookingsController
);


router.get(
  "/:id",
  BookingController.getSingleBookingController
);

router.post(
  "/book",
  BookingController.bookMultipleRoomsController
);

router.patch(
  "/cancel/:id",
  BookingController.cancelBookingController
);

router.get(
  "/available-rooms",
  BookingController.getAvailableRoomsController
);

router.get(
  "/rooms-by-date",
  BookingController.getRoomsByDateController
);


router.get(
  "/room-type/:id",
  BookingController.getSingleRoomTypeController
);


router.delete(
  "/room-type/:id",
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


