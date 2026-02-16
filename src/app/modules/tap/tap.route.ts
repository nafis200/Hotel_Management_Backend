import express from "express";
import { tapCallback, TapController } from "./tap.controller";

const router = express.Router();

router.post("/create", TapController.createCharge);
router.get("/retrieve/:id", TapController.retrieveCharge);
router.put("/update/:id", TapController.updateCharge);
router.post("/list", TapController.listCharges);

router.get("/callback", tapCallback);

export const TapRoutes = router;


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


