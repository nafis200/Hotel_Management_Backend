import { stripe } from "../../helper/stripe";

import { v4 as uuidv4 } from "uuid";

const createAppointment = async () => {
  const transactionId = uuidv4();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    customer_email: "abrarmahmudnabil12@gmail.com",

    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with Nafis Ahamed`,
          },
          unit_amount: 1000 * 100,
        },
        quantity: 1,
      },
    ],

    success_url: "https://www.programming-hero.com/",
    cancel_url: "https://next.programming-hero.com/",
  });

  return {
    paymentUrl: session.url,
    transactionId,
  };
};

export const AppointmentService = {
  createAppointment,
};
