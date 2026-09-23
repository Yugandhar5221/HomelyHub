import React, { useEffect, useState } from "react";
import "../../css/BookingDetails.css";
import PropertyImg from "../propertyListing/PropertyImg";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../ConfirmationModal";
import toast from "react-hot-toast";

import { cancelBooking, fetchBookingDetails } from "../../store/Booking/booking-action";
import { useDispatch, useSelector } from "react-redux";

const getCategory = (booking) => {
  if (!booking) return "upcoming";
  if (booking.category) return booking.category;
  if (booking.status === "cancelled") return "cancelled";
  if (new Date(booking.toDate) < new Date()) return "past";
  return "upcoming";
};

const BookingDetails = () => {
  const { bookingId } = useParams();
  const dispatch = useDispatch();

  const { bookingDetails } = useSelector((state) => state.booking);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchBookingDetails(bookingId));
  }, [dispatch, bookingId]);

  if (!bookingDetails || !bookingDetails.property) {
    return (
      <div className="row justify-content-around mt-5">
        <LoadingSpinner />
      </div>
    );
  }

  const category = getCategory(bookingDetails);

  const handleConfirmCancel = async () => {
    setCancelling(true);
    try {
      await dispatch(cancelBooking(bookingDetails._id));
      toast.success("Booking cancelled successfully");
      setShowCancelModal(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to cancel the booking. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="details-container">
      <div className="details-header-row">
        <p className="details-header">{bookingDetails.property.propertyName}</p>
        <span className={`status-badge status-badge-${category}`}>
          {category === "upcoming" && "Upcoming"}
          {category === "past" && "Completed"}
          {category === "cancelled" && "Cancelled"}
        </span>
      </div>
      <h6 className="details-location">
        <span className="material-symbols-outlined">location_on</span>
        <span className="location">
          {bookingDetails.property.address.area},{" "}
          {bookingDetails.property.address.city},{" "}
          {bookingDetails.property.address.pincode},{" "}
          {bookingDetails.property.address.state}
        </span>
      </h6>
      <div className="details-information-container ">
        <div className="details-information ">
          <h5 className>Booking Information</h5>
          <section className="booking-stay-information">
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                bedtime
              </span>
              {bookingDetails.numberOfnights || 0} nights
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {new Date(bookingDetails.fromDate).toLocaleDateString()}
            </span>
            <span className="material-symbols-outlined  stay-icon">
              arrow_forward
            </span>
            <span className="details">
              <span className="material-symbols-outlined stay-icon">
                calendar_month
              </span>
              {new Date(bookingDetails.toDate).toLocaleDateString()}
            </span>
          </section>

          {category === "cancelled" && bookingDetails.cancelledAt && (
            <p className="booking-cancelled-at">
              Cancelled on {new Date(bookingDetails.cancelledAt).toLocaleString()}
            </p>
          )}
        </div>

        <div className="details-total-price-container details-actions-row">
          {category === "upcoming" && (
            <button
              type="button"
              className="cancel-booking-btn details-cancel-btn"
              onClick={() => setShowCancelModal(true)}
            >
              <span className="material-symbols-outlined">cancel</span>
              Cancel Booking
            </button>
          )}

          <div className="details-total-price">
            <p className="price-header">Total Price</p>
            <span className="price-in-number">
              {" "}
              &#8377; {bookingDetails.price}
            </span>
          </div>
        </div>
      </div>
      <PropertyImg images={bookingDetails.property.images} />

      <ConfirmationModal
        isOpen={showCancelModal}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking?"
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep Booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </div>
  );
};

export default BookingDetails;
