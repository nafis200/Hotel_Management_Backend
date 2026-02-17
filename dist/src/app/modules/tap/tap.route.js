"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TapRoutes = void 0;
const express_1 = __importDefault(require("express"));
const tap_controller_1 = require("./tap.controller");
const router = express_1.default.Router();
router.post("/create", tap_controller_1.TapController.createCharge);
router.get("/retrieve/:id", tap_controller_1.TapController.retrieveCharge);
router.put("/update/:id", tap_controller_1.TapController.updateCharge);
router.post("/list", tap_controller_1.TapController.listCharges);
router.get("/callback", tap_controller_1.tapCallback);
exports.TapRoutes = router;
// ৫️⃣ Postman থেকে কল করার উদাহরণ
// ১. Create Charge
// POST http://localhost:3000/api/tap/create
// Body (JSON):
// {
//   "amount": 100,
//   "currency": "SAR",
//   "firstName": "Nafis",
//   "lastName": "Iqbal",
//   "email": "test@example.com",
//   "phone": "500000000",
//   "countryCode": "966",
//   "redirectUrl": "https://example.com",
//   "description": "Hotel Booking Payment",
//   "metadata": {
//     "userId": "user_123",
//     "date": "2026-02-16"
//   }
// }
// ২. Retrieve Charge
// GET http://localhost:3000/api/tap/retrieve/<charge_id>
// ৩. Update Charge
// PUT http://localhost:3000/api/tap/update/<charge_id>
// Body (JSON):
// {
//   "description": "Updated description",
//   "metadata": {
//     "room": "101"
//   }
// }
// ৪. List Charges
// POST http://localhost:3000/api/tap/list
// Body (JSON):
// {
//   "limit": 25,
//   "order": "reverse_chronological"
// }
