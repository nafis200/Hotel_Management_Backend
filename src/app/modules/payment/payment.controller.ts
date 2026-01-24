import { Request, Response } from "express";

import { PaymentService } from "./payment.service";

import { stripe } from "../../helper/stripe";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import config from "../../config";

const handleStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {

    

    const sig = req.headers["stripe-signature"] as string;
    const webhookSecret = config.webhooksecret as string

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
        console.error("⚠️ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    const result = await PaymentService.handleStripeWebhookEvent(event);

    
    sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: 'Webhooks req successfully',
    data: result,
  });
});

export const PaymentController = {
    handleStripeWebhookEvent
}