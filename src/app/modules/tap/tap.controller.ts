import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TapService } from "./tap.services";
import prisma from "../../../shared/prisma";
import config from "../../config";

const createCharge = catchAsync(async (req: Request, res: Response) => {
  const result = await TapService.createCharge(req.body);

  sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: "Charge created successfully",
    data: result,
  });
});

const retrieveCharge = catchAsync(async (req: Request, res: Response) => {
  const tap_id = req.params.id as string;
  const result = await TapService.retrieveCharge(tap_id);

  sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: "Charge retrieved successfully",
    data: result,
  });
});

const updateCharge = catchAsync(async (req: Request, res: Response) => {
  const tap_id = req.params.id as string;
  const result = await TapService.updateCharge(tap_id, req.body);

  sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: "Charge updated successfully",
    data: result,
  });
});

const listCharges = catchAsync(async (req: Request, res: Response) => {
  const result = await TapService.listCharges(req.body);

  sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: "Charges list fetched successfully",
    data: result,
  });
});

export const tapCallback = async (req: Request, res: Response) => {
  try {
    const tap_id = req.query.tap_id as string;

    if (!tap_id) {
      return res.status(400).send("Charge ID not found in query params");
    }

    const result = await TapService.retrieveCharge(tap_id);
    const bookingId = result.metadata?.bookingId;

    if (!bookingId) {
      console.error("Booking ID not found in charge metadata");
      return res.redirect(`${config.frontend_url}/payment-results?status=error&message=MissingMetadata`);
    }

    const isSuccess = result.status === "CAPTURED";

    // Update the existing booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: Number(bookingId) },
      data: {
        status: isSuccess ? "CONFIRMED" : "PENDING_PAYMENT",
      },
    });

    console.log(`Booking ${bookingId} updated to ${updatedBooking.status}`);

    // Redirect to frontend application
    res.redirect(
      `${config.frontend_url}/payment-results?status=${result.status}&bookingId=${bookingId}`,
    );
  } catch (error) {
    console.error("Error in callback:", error);
    res.redirect(`${config.frontend_url}/payment-results?status=error`);
  }
};

export const TapController = {
  createCharge,
  retrieveCharge,
  updateCharge,
  listCharges,
};
