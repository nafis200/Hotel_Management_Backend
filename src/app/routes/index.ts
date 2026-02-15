import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.route";
import { RoomCategoryRoutes } from "../modules/roomCategory/roomcategory.route";

const router = express.Router();

const moduleRoutes = [
  
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path:"/roomCategory",
    route:RoomCategoryRoutes 
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
