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
exports.TapService = exports.createCharge = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../../config"));
const TAP_SECRET_KEY = config_1.default.tap.tap_secret_key;
const BASE_URL = config_1.default.tap.tap_services_url;
const headers = {
    Authorization: `Bearer ${TAP_SECRET_KEY}`,
    "Content-Type": "application/json",
};
const createCharge = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const body = {
        amount: payload.amount,
        currency: payload.currency || "SAR",
        customer: {
            first_name: payload.firstName || "Test",
            last_name: payload.lastName || "User",
            email: payload.email || "test@example.com",
            phone: {
                country_code: payload.countryCode || "966",
                number: payload.phone || "500000000",
            },
        },
        source: { id: "src_all" },
        description: payload.description || "Hotel Booking Test Payment",
        redirect: { url: config_1.default.tap.tap_callback_url },
        metadata: payload.metadata || { userId: "user_123", date: "2026-02-16" },
    };
    const response = yield axios_1.default.post(BASE_URL, body, { headers });
    return response.data;
});
exports.createCharge = createCharge;
const retrieveCharge = (chargeId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(`${BASE_URL}/${chargeId}`, { headers });
    return response.data;
});
const updateCharge = (chargeId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.put(`${BASE_URL}/${chargeId}`, data, { headers });
    return response.data;
});
const listCharges = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.post(`${BASE_URL}/list`, filters, { headers });
    return response.data;
});
exports.TapService = {
    createCharge: exports.createCharge,
    retrieveCharge,
    updateCharge,
    listCharges,
};
