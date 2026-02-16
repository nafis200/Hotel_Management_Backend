import axios from "axios";
import config from "../../config";

const TAP_SECRET_KEY = config.tap.tap_secret_key as string;
const BASE_URL = config.tap.tap_services_url as string;

const headers = {
  Authorization: `Bearer ${TAP_SECRET_KEY}`,
  "Content-Type": "application/json",
};

export const createCharge = async (payload: {
  amount: number;
  currency?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  redirectUrl?: string;
  description?: string;
  metadata?: { userId?: string; date?: string };
}) => {

   

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
     redirect: { url:config.tap.tap_callback_url as string },
    metadata: payload.metadata || { userId: "user_123", date: "2026-02-16" },
  };

  const response = await axios.post(BASE_URL, body, { headers });
  return response.data;
};


const retrieveCharge = async (chargeId: string) => {
  const response = await axios.get(`${BASE_URL}/${chargeId}`, { headers });
  return response.data;
};

const updateCharge = async (chargeId: string, data: { description?: string; metadata?: object }) => {
  const response = await axios.put(`${BASE_URL}/${chargeId}`, data, { headers });
  return response.data;
};

const listCharges = async (filters: object) => {
  const response = await axios.post(`${BASE_URL}/list`, filters, { headers });
  return response.data;
};

export const TapService = {
  createCharge,
  retrieveCharge,
  updateCharge,
  listCharges,
};
