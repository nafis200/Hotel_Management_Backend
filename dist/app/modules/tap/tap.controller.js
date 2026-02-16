"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TapController = exports.tapCallback = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
const tap_services_1 = require("./tap.services");
const prisma_1 = __importDefault(require("../../../shared/prisma"));
const createCharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tap_services_1.TapService.createCharge(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: 200,
        message: "Charge created successfully",
        data: result,
    });
}));
const retrieveCharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tap_id = req.params.id;
    const result = yield tap_services_1.TapService.retrieveCharge(tap_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: 200,
        message: "Charge retrieved successfully",
        data: result,
    });
}));
const updateCharge = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const tap_id = req.params.id;
    const result = yield tap_services_1.TapService.updateCharge(tap_id, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: 200,
        message: "Charge updated successfully",
        data: result,
    });
}));
const listCharges = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield tap_services_1.TapService.listCharges(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        status: 200,
        message: "Charges list fetched successfully",
        data: result,
    });
}));
const tapCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        console.log("hellow i am charge Id");
        // Tap redirect এ সাধারণত charge id query param এ পাঠায়
        const tap_id = req.query.tap_id;
        console.log(req.query);
        if (!tap_id) {
            return res.status(400).send("Charge ID not found in query params");
        }
        const result = yield tap_services_1.TapService.retrieveCharge(tap_id);
        const extractedData = {
            id: result.id,
            status: result.status,
            amount: result.amount,
            currency: result.currency,
            metadata: result.metadata,
            reference: result.reference,
            customer: result.customer,
        };
        const isSuccess = result.status === "CAPTURED";
        const booking = yield prisma_1.default.booking.create({
            data: {
                userId: Number(result.metadata.userId),
                checkIn: new Date(result.metadata.checkIn),
                checkOut: new Date(result.metadata.checkOut),
                paymentId: result.id,
                adults: Number(result.metadata.adults),
                children: Number(result.metadata.children),
                currency: result.currency,
                totalAmount: result.amount,
                status: isSuccess ? "CONFIRMED" : "PENDING_PAYMENT",
            },
        });
        console.log(booking);
        const status = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.status;
        console.log(status);
        if (status === "CAPTURED") {
            console.log("Payment SUCCESS");
        }
        else if (status === "DECLINED") {
            console.log("Payment FAILED");
        }
        else {
            console.log("Payment Pending / In Progress");
        }
        // Optional: User কে frontend এ redirect করা
        res.redirect(`http://localhost:3000/payment-result?status=${status}&tap_id=${tap_id}`);
    }
    catch (error) {
        console.error("Error in callback:", error);
        res.status(500).send("Internal Server Error");
    }
});
exports.tapCallback = tapCallback;
exports.TapController = {
    createCharge,
    retrieveCharge,
    updateCharge,
    listCharges,
};
