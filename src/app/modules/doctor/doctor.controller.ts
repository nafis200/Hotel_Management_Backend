import { Request, Response } from "express";


import { DoctorService } from "./doctor.service";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";




const getAISuggestions = catchAsync(async (req: Request, res: Response) => {
  const result = await DoctorService.getAISuggestions(req.body);

  sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: 'AI suggestions fetched successfully',
    data: result,
  });
});

export const DoctorController = {
    getAISuggestions
}