import { Router } from "express";
import { RoomTypeControllers } from "./roomCategory.controller";


const router = Router();


router.post("/", RoomTypeControllers.createRoomType);


router.get("/", RoomTypeControllers.getAllRoomTypes);


router.get("/:id", RoomTypeControllers.getRoomTypeById);


router.patch("/:id", RoomTypeControllers.updateRoomType);


router.delete("/:id", RoomTypeControllers.deleteRoomType);


export const RoomCategoryRoutes = router;
