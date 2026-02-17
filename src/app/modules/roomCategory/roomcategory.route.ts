import { Router } from "express";
import { RoomTypeControllers } from "./roomCategory.controller";
import { fileUploader } from "../../helper/fileUploader";


const router = Router();


router.post(
  "/",
  fileUploader.upload.array("images"), 
  RoomTypeControllers.createRoomType
);

router.get("/", RoomTypeControllers.getAllRoomTypes);


router.get("/:id", RoomTypeControllers.getRoomTypeById);


router.patch("/:id", RoomTypeControllers.updateRoomType);


router.delete("/:id", RoomTypeControllers.deleteRoomType);


export const RoomCategoryRoutes = router;
