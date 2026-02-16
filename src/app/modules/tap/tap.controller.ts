import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { TapService } from "./tap.services";


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

    console.log("hellow i am charge Id")

    // Tap redirect এ সাধারণত charge id query param এ পাঠায়
    const tap_id = req.query.tap_id as string;

    console.log(req.query)


    if (!tap_id) {
      return res.status(400).send("Charge ID not found in query params");
    }

    
    const result = await TapService.retrieveCharge(tap_id);

    console.log(result)

  
    const status = result?.data?.status;
    if (status === "CAPTURED") {
      console.log("Payment SUCCESS");
    } else if (status === "DECLINED") {
      console.log("Payment FAILED");
    } else {
      console.log("Payment Pending / In Progress");
    }

    // Optional: User কে frontend এ redirect করা
    res.redirect(`http://localhost:3000/payment-result?status=${status}&tap_id=${tap_id}`);

  } catch (error) {
    console.error("Error in callback:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const TapController = {
  createCharge,
  retrieveCharge,
  updateCharge,
  listCharges,
};
