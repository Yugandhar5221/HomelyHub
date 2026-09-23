import React, { useEffect, useMemo, useState } from "react";
import "../../css/MyBookings.css";
import ProgressSteps from "../ProgressSteps";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../ConfirmationModal";
import toast from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookingDetails,
  fetchUserBookings,
  cancelBooking,
} from "../../store/Booking/booking-action";

const TABS = [
  { key: "upcoming", label: "Bookings" },
  { key: "past", label: "Past Bookings" },
  { key: "cancelled", label: "Cancelled Bookings" },
];

// Same rule the backend applies (category is sent by the API), kept
// here only as a safety-net fallback in case an older cached
// booking object doesn't have `category` on it yet.
const getCategory = (booking) => {
  if (booking.category) return booking.category;
  if (booking.status === "cancelled") return "cancelled";
  if (new Date(booking.toDate) < new Date()) return "past";
  return "upcoming";
};

const EmptyState = ({ icon, message }) => (
  <div className="bookings-empty-state">
    <span className="material-symbols-outlined bookings-empty-icon">
      {icon}
    </span>
    <h4>{message}</h4>
  </div>
);

const BookingCard = ({ booking, onCardClick, onCancelClick }) => {
  const category = getCategory(booking);

  return (
    <div className="main-container" key={booking._id}>
      <div className="mybookings-container row">
        <div
          className="image-container col-lg-3 col-md-3"
          onClick={() => onCardClick(booking._id)}
        >
          <img
            className="booking-img"
            src={
              booking.property?.images && booking.property.images.length > 0
                ? booking.property.images[0].url
                : undefined
            }
            alt="bookings"
          />
        </div>
        <div
          className="booking-information col-lg-9 col-md-9"
          onClick={() => onCardClick(booking._id)}
        >
          <div className="booking-info-top">
            <h6 className="hotel-name">{booking.property?.propertyName}</h6>
            <span className={`status-badge status-badge-${category}`}>
              {category === "upcoming" && "Upcoming"}
              {category === "past" && "Completed"}
              {category === "cancelled" && "Cancelled"}
            </span>
          </div>

          {booking.property?.address?.city && (
            <p className="booking-location">
              <span className="material-symbols-outlined icon">
                location_on
              </span>
              {booking.property.address.city}
            </p>
          )}

          <div className="stay-information">
            <span className="info">
              <span className="material-symbols-outlined icon">
                bedtime
              </span>
              {booking.numberOfnights || 0} nights
            </span>
            <span className="info">
              <span className="material-symbols-outlined icon">
                calendar_month
              </span>
              {new Date(booking.fromDate).toLocaleDateString()}
            </span>
            <span className="material-symbols-outlined icon">
              arrow_forward
            </span>
            <span className="info">
              <span className="material-symbols-outlined icon">
                calendar_month
              </span>
              {new Date(booking.toDate).toLocaleDateString()}
            </span>
          </div>

          {category === "cancelled" && booking.cancelledAt && (
            <p className="booking-cancelled-at">
              Cancelled on {new Date(booking.cancelledAt).toLocaleString()}
            </p>
          )}

          <div className="booking-bottom-row">
            <h5 className="booking-price">
              <span className="material-symbols-outlined">payments</span>{" "}
              Total Price :&#8377; {booking.price}
            </h5>

            {category === "upcoming" && (
              <button
                type="button"
                className="cancel-booking-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancelClick(booking);
                }}
              >
                <span className="material-symbols-outlined">cancel</span>
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector((state) => state.booking);

  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);

  const categorizedBookings = useMemo(() => {
    const buckets = { upcoming: [], past: [], cancelled: [] };
    bookings.forEach((booking) => {
      buckets[getCategory(booking)].push(booking);
    });
    return buckets;
  }, [bookings]);

  const handleBookingClick = (bookingId) => {
    dispatch(fetchBookingDetails(bookingId));
    navigate(`/user/myBookings/${bookingId}`);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await dispatch(cancelBooking(bookingToCancel._id));
      toast.success("Booking cancelled successfully");
      setBookingToCancel(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to cancel the booking. Please try again."
      );
    } finally {
      setCancelling(false);
    }
  };

  const activeList = categorizedBookings[activeTab];

  const emptyStateFor = {
    upcoming: { icon: "luggage", message: "Nothing booked yet" },
    past: { icon: "history", message: "There are no past bookings!" },
    cancelled: {
      icon: "event_busy",
      message: "There are no canceled bookings!",
    },
  }[activeTab];

  return (
    <>
      <ProgressSteps />

      <div className="bookings-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`bookings-tab ${
              activeTab === tab.key ? "bookings-tab-active" : ""
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
            <span className="bookings-tab-count">
              {categorizedBookings[tab.key].length}
            </span>
          </button>
        ))}
      </div>

      <div className="wow">
        {loading && <LoadingSpinner />}

        {!loading && activeList.length === 0 && (
          <EmptyState icon={emptyStateFor.icon} message={emptyStateFor.message} />
        )}

        {!loading &&
          activeList.length > 0 &&
          activeList.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onCardClick={handleBookingClick}
              onCancelClick={setBookingToCancel}
            />
          ))}
      </div>

      <ConfirmationModal
        isOpen={!!bookingToCancel}
        title="Cancel Booking?"
        message="Are you sure you want to cancel this booking?"
        confirmLabel="Yes, Cancel"
        cancelLabel="No, Keep Booking"
        variant="danger"
        loading={cancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setBookingToCancel(null)}
      />
    </>
  );
};

export default MyBookings;
