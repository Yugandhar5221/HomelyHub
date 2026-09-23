import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import "../css/ConfirmationModal.css";

// Generic "are you sure?" modal used for Cancel Booking and
// Delete Accommodation. Two buttons, the destructive one styled
// so it's visually distinguishable, as required.
const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
  variant, // "danger" (delete/cancel) | "default"
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.92, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" }
    );

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-backdrop"
      onMouseDown={(e) => {
        // click outside the card closes it, same as the existing
        // image gallery Modal - but not while a request is in flight
        if (e.target === e.currentTarget && !loading) onCancel();
      }}
    >
      <div className="confirm-modal-card" ref={cardRef}>
        <div
          className={`confirm-modal-icon ${
            variant === "danger" ? "confirm-modal-icon-danger" : ""
          }`}
        >
          <span className="material-symbols-outlined">warning</span>
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn ${
              variant === "danger"
                ? "confirm-modal-btn-danger"
                : "confirm-modal-btn-primary"
            }`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="confirm-modal-spinner" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(["danger", "default"]),
};

ConfirmationModal.defaultProps = {
  confirmLabel: "Yes",
  cancelLabel: "No",
  loading: false,
  variant: "danger",
};

// Single-button alert, used for "There are no changes!" on the
// Modify Accommodation page - not a yes/no decision, just an FYI.
export const AlertModal = ({ isOpen, title, message, buttonLabel, onClose }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    gsap.fromTo(
      cardRef.current,
      { opacity: 0, scale: 0.92, y: 10 },
      { opacity: 1, scale: 1, y: 0, duration: 0.28, ease: "power3.out" }
    );

    return () => {
      document.body.style.overflow = "visible";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="confirm-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="confirm-modal-card" ref={cardRef}>
        <div className="confirm-modal-icon confirm-modal-icon-info">
          <span className="material-symbols-outlined">info</span>
        </div>

        <h3 className="confirm-modal-title">{title}</h3>
        <p className="confirm-modal-message">{message}</p>

        <div className="confirm-modal-actions confirm-modal-actions-single">
          <button
            type="button"
            className="confirm-modal-btn confirm-modal-btn-primary"
            onClick={onClose}
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

AlertModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  buttonLabel: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

AlertModal.defaultProps = {
  buttonLabel: "OK",
};

export default ConfirmationModal;
