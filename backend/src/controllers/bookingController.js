import { Property } from "../Models/propertyModel.js";
import { Booking } from "../Models/bookingModel.js";

// createorder : we are booking the property
const createOrder = async(req, res) => {
    const {amount, propertyId, fromDate, toDate, guests} = req.body;

    //orderId
    const orderId = "order_" + Date.now();
    res.json({
     success: true,
     message: "Order created Successfully",
     orderId,
     amount,
     propertyId,
     fromDate,
     toDate,
     guests
    })


}

//verifyPayment
//25, 26
//1. save the bookings
//2. Block these dates

const verifyPayment = async(req, res) => {
    const {orderId, bookingDetails, forceStatus} = req.body;

    if(forceStatus === "success"){
        const paymentId = "pay_" + Date.now();

        // Save booking
        const newBooking = await Booking.create({
           user: req.user._id,
           property: bookingDetails.propertyId,
           price: bookingDetails.price,
           fromDate: bookingDetails.fromDate,
           toDate: bookingDetails.toDate,
           guests: bookingDetails.guests,
           numberOfnights: bookingDetails.nights,
           paid: true,
           status: "confirmed"
        });

        // tell property those days are taken


        const updateProperty = await Property.findByIdAndUpdate(
            bookingDetails.property,{
                $push:{
                    currentBookings:{
                        bookingId: newBooking._id,
                        fromDate: bookingDetails.fromDate,
                        toDate: bookingDetails.toDate,
                        userId: req.user._id
                    }
                }
            },
            { new: true }
        );

        res.json({
            success: true,
            message: "Payment successful, your booking conformed!!",
            paymentId,
            orderId,
            booking: newBooking
        })
    }else{
        res.status(400).json({
            success: false,
            message: "Payment failed!",
            orderId
        })
    }
}

// Works out which of the 3 buckets a booking belongs to:
// "cancelled" beats "past" beats "upcoming" (see requirement #4/#5).
// Kept in the backend on purpose - the frontend should not have to
// re-derive this from raw dates, it should just read `category`.
const getBookingCategory = (booking) => {
    if (booking.status === "cancelled") return "cancelled";
    if (new Date(booking.toDate) < new Date()) return "past";
    return "upcoming";
}

const attachCategory = (booking) => {
    const bookingObj = booking.toObject ? booking.toObject() : booking;
    bookingObj.category = getBookingCategory(bookingObj);
    return bookingObj;
}

//get my bookngs
const getUserBookings = async(req, res) => {
    try{
         const bookings = await Booking.find({user:req.user._id}).sort({fromDate: -1});

         const bookingsWithCategory = bookings.map(attachCategory);

         res.status(200).json({
            status: "Success",
            data: {
                bookings: bookingsWithCategory
            }
         })
    }catch(error){
          res.status(401).json({
            status: "fail",
            message: error.message
          })
    }
}

//get one booking details
// /:id
const getBookingDetails = async(req, res) => {
    try{
         const booking = await Booking.findById(req.params.bookingId);

         if(!booking){
            return res.status(404).json({
                status: "fail",
                message: "Booking not found"
            })
         }

         res.status(200).json({
            status: "Success",
            data: {
                bookings: attachCategory(booking)
            }
         })

    }catch(error){
          res.status(401).json({
            status: "fail",
            message: error.message
          })
    }
}

// PATCH /api/v1/rent/user/booking/:bookingId/cancel
// Cancels a booking WITHOUT deleting it, so it can still show up
// under "Canceled Bookings" (requirement #1 / #16).
const cancelBooking = async(req, res) => {
    try{
        const booking = await Booking.findById(req.params.bookingId);

        if(!booking){
            return res.status(404).json({
                status: "fail",
                message: "Booking not found"
            })
        }

        // Ownership check - a user can only cancel their OWN booking.
        // booking.user is populated (see the pre-find hook on the
        // model), so it may be a full user doc or just an id.
        const bookingOwnerId = booking.user && booking.user._id
            ? booking.user._id.toString()
            : booking.user.toString();

        if(bookingOwnerId !== req.user._id.toString()){
            return res.status(403).json({
                status: "fail",
                message: "You are not allowed to cancel this booking"
            })
        }

        if(booking.status === "cancelled"){
            return res.status(400).json({
                status: "fail",
                message: "This booking is already cancelled"
            })
        }

        // Can't cancel something that has already happened.
        if(new Date(booking.toDate) < new Date()){
            return res.status(400).json({
                status: "fail",
                message: "Past bookings cannot be cancelled"
            })
        }

        booking.status = "cancelled";
        booking.cancelledAt = new Date();
        await booking.save();

        // Free up those dates on the property so someone else can
        // book them again.
        const propertyId = booking.property && booking.property._id
            ? booking.property._id
            : booking.property;

        await Property.findByIdAndUpdate(propertyId, {
            $pull: { currentBookings: { bookingId: booking._id } }
        });

        res.status(200).json({
            status: "Success",
            message: "Booking cancelled successfully",
            data: {
                booking: attachCategory(booking)
            }
        })
    }catch(error){
        res.status(500).json({
            status: "fail",
            message: error.message || "Unable to cancel the booking. Please try again."
        })
    }
}

export { getBookingDetails, getUserBookings, createOrder, verifyPayment, cancelBooking }