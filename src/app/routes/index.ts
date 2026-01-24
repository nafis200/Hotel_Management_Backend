import express from "express";

import { DoctorRoutes } from "../modules/doctor/doctor.routes";
import { AppointmentRoutes } from "../modules/appointment/appointment.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/doctor",
    route: DoctorRoutes,
  },
  {
    path: "/appointment",
    route: AppointmentRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
