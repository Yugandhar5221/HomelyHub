import express from "express";
const bookingRouter = express.Router();

import { getBookingDetails, getUserBookings, createOrder, verifyPayment, cancelBooking } from "../controllers/bookingController.js"

import { protect } from "../controllers/authController.js"

bookingRouter.get("/",protect,getUserBookings);
bookingRouter.patch("/:bookingId/cancel",protect,cancelBooking);
bookingRouter.get("/:bookingId",protect,getBookingDetails);
bookingRouter.post("/create-order",protect,createOrder);
bookingRouter.post("/verify-payment",protect,verifyPayment);

export{ bookingRouter };