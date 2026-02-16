"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = require("../modules/Auth/auth.route");
const roomcategory_route_1 = require("../modules/roomCategory/roomcategory.route");
const RoomControllers_route_1 = require("../modules/room/RoomControllers.route");
const booking_route_1 = require("../modules/booking/booking_route");
const tap_route_1 = require("../modules/tap/tap.route");
const router = express_1.default.Router();
const moduleRoutes = [
    {
        path: "/auth",
        route: auth_route_1.AuthRoutes,
    },
    {
        path: "/roomCategory",
        route: roomcategory_route_1.RoomCategoryRoutes
    },
    {
        path: "/room",
        route: RoomControllers_route_1.RoomRoutes
    },
    {
        path: "/book",
        route: booking_route_1.BookingRoutes,
    },
    {
        path: "/tap",
        route: tap_route_1.TapRoutes
    }
];
moduleRoutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
