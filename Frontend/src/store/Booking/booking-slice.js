// managing booking

// store all bookings
// store individual booking details
// track the API loading status
// Add new bookings when a booking is created
// updating the booking data when we receive it from the backend


import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    bookings: [],
    bookingDetails: {},
    loading: false
}

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setBookingRequest(state){
            state.loading = true;
        },
        // stores the bookings received from the api
        setBookings(state, action){
            state.bookings = action.payload;
            state.loading = false
        },
        addBooking: (state, action) => {
            state.bookings.push(action.payload);
        },
        setBookingDetails: (state, action) => {
            state.bookingDetails = action.payload.bookings
        },
        // After a successful cancel, patch just that one booking in
        // place instead of forcing a full refetch of the whole list.
        updateBookingInState: (state, action) => {
            const updatedBooking = action.payload;
            state.bookings = state.bookings.map((booking) =>
                booking._id === updatedBooking._id ? updatedBooking : booking
            );
            if (state.bookingDetails && state.bookingDetails._id === updatedBooking._id) {
                state.bookingDetails = updatedBooking;
            }
        }
    }
})

export const { setBookings, addBooking, setBookingDetails, updateBookingInState } = bookingSlice.actions;
export default bookingSlice;