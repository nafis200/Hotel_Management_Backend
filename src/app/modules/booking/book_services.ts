import prisma from "../../../shared/prisma";
import config from "../../config";
import ApiError from "../../errors/ApiError";
import axios from "axios";

const TAP_SECRET_KEY = config.tap.tap_secret_key as string;
const BASE_URL = config.tap.tap_services_url as string;
const headers = {
  Authorization: `Bearer ${TAP_SECRET_KEY}`,
  "Content-Type": "application/json",
};

// ===============================
// Payment Gateway Function
// ===============================
const createCharge = async (payload: {
  amount: number;
  currency?: string;
  name?: string;
  email?: string;
  phone?: string;
  countryCode?: string;
  redirectUrl?: string;
  description?: string;
  metadata?: Record<string, any>;
}) => {
  const body = {
    amount: payload.amount,
    currency: payload.currency || "SAR",
    customer: {
      name: payload.name || "Test User",
      email: payload.email || "test@example.com",
      phone: {
        country_code: payload.countryCode || "966",
        number: payload.phone || "500000000",
      },
    },
    source: { id: "src_all" },
    description: payload.description || "Hotel Booking Payment",
    redirect: { url: payload.redirectUrl || config.tap.tap_callback_url },
    metadata: payload.metadata || {},
  };

  const response = await axios.post(BASE_URL, body, { headers });
  return response.data;
};


export const bookMultipleRoomsWithPayment = async (input: {
  userId: number;
  roomRequests: { Id: number; quantity: number }[];
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
}) => {
  const { userId, roomRequests, checkIn, checkOut, adults, children } = input;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  let totalAmount = 0;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, contactNumber: true },
  });
  if (!user) throw new ApiError(404, "User not found");

  const userName = user.name || "Test User";

  const Ids = roomRequests.map((r) => r.Id);
  const s = await prisma..findMany({
    where: { id: { in: Ids } },
  });

  if (s.length !== roomRequests.length)
    throw new ApiError(404, "Some room types not found in the database");


  for (const request of roomRequests) {
    const { Id, quantity } = request;
    const  = s.find((r) => r.id === Id)!;

    const availableRooms = await prisma.room.findMany({
      where: {
        Id,
        bookings: {
          none: {
            booking: {
              checkIn: { lt: checkOutDate },
              checkOut: { gt: checkInDate },
            },
          },
        },
      },
      take: quantity,
    });

    if (availableRooms.length < quantity) {
      throw new ApiError(
        404,
        `Not enough available rooms for Id ${Id}`,
      );
    }

    const days = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    totalAmount += days * .price * quantity;
  }


  const paymentResponse = await createCharge({
    amount: totalAmount,
    currency: "SAR",
    name: userName,
    email: user.email || "test@example.com",
    phone: user.contactNumber || "500000000",
    countryCode: "966",
    description: `Booking for user ${userId}`,
    metadata: {
      userId: String(userId),
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      adults,
      children,
      roomRequests: JSON.stringify(roomRequests),
      date: new Date().toISOString(),
    },
  });

  return paymentResponse;
};
