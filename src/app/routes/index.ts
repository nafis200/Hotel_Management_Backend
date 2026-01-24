import express from "express";

import { DoctorRoutes } from "../modules/doctor/doctor.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/doctor",
    route: DoctorRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
