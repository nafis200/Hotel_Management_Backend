"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking_controller");
const router = express_1.default.Router();
router.post("/book", booking_controller_1.BookingController.bookMultipleRoomsController);
router.post("/online-book", booking_controller_1.BookingController.OnlinebookMultipleRoomsController);
router.get("/", booking_controller_1.BookingController.getAllBookingsController);
router.patch("/cancel/:id", booking_controller_1.BookingController.cancelBookingController);
router.get("/available-rooms", booking_controller_1.BookingController.getAvailableRoomsController);
router.get("/roomsDate", booking_controller_1.BookingController.getRoomsByDateController);
router.get("/room-type/:id", booking_controller_1.BookingController.getSingleRoomTypeController);
router.get("/:id", booking_controller_1.BookingController.getSingleBookingController);
router.delete("/room-type/:id", booking_controller_1.BookingController.deleteRoomTypeController);
exports.BookingRoutes = router;
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
