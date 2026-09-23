import { axiosInstance } from "../../utils/axios";
import { setBookingDetails, setBookings, updateBookingInState } from "./booking-slice";

//fetch booking details
export const fetchBookingDetails = (bookingId) => async(dispatch) => {
    try{
        const response = await axiosInstance.get(`/v1/rent/user/booking/${bookingId}`)
        dispatch(setBookingDetails(response.data.data));
    }catch(error){
        console.error("Error fetching booking details", error)
    }
}

//fetch user bookings
export const fetchUserBookings = () => async(dispatch) => {
    try{
        const response = await axiosInstance.get("/v1/rent/user/booking")
        dispatch(setBookings(response.data.data.bookings));
    }catch(error){
        console.error("Error fetching bookings", error)
    }
}

// cancel a booking (does not delete it - backend flips status to
// "cancelled" so it can still show up under Canceled Bookings)
export const cancelBooking = (bookingId) => async(dispatch) => {
    try{
        const response = await axiosInstance.patch(`/v1/rent/user/booking/${bookingId}/cancel`);
        dispatch(updateBookingInState(response.data.data.booking));
        return response.data;
    }catch(error){
        console.error("Error cancelling booking", error)
        throw error;
    }
}