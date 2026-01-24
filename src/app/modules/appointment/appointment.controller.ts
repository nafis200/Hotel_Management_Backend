import { Request, Response } from "express";

import { AppointmentService } from "./appointment.service";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";


const createAppointment = catchAsync(async (req: Request , res: Response) => {
    
    const result = await AppointmentService.createAppointment();

    sendResponse<typeof result>(res, {
    success: true,
    status: 200,
    message: 'Appointment create successfully',
    data: result,
  });
});



export const AppointmentController = {
    createAppointment
}