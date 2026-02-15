import { Router } from "express";
import { RoomControllers } from "./RoomControllers";


const router = Router();


router.post("/", RoomControllers.createRoom);


router.get("/", RoomControllers.getAllRooms);


router.get("/:id", RoomControllers.getRoomById);


router.patch("/:id", RoomControllers.updateRoom);


router.delete("/:id", RoomControllers.deleteRoom);

export const RoomRoutes = router;
