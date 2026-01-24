import express from "express";
import { DoctorController } from "./doctor.controller";

const router = express.Router();


router.post("/suggestion", DoctorController.getAISuggestions);


export const DoctorRoutes = router;