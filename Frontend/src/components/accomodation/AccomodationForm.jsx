import React, { useState } from "react";
import ImagesUploading from "./ImagesUploading";
import { getAiDescription } from "../../ai/aiDescription";
import { useForm } from "@tanstack/react-form";
import { AddressField } from "./AddressField";
import AmenitiesField from "./AmenitiesField";
import {
  createAccomodation,
  getAllAccomodation,
  updateAccomodation,
} from "../../store/Accomodation/Accomodation-action";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AlertModal } from "../ConfirmationModal";
import {
  haveAccomodationValuesChanged,
  propertyToFormValues,
} from "../../utils/compareAccomodation";

const Section = ({ icon, title, hint, children }) => (
  <section className="accf-card">
    <div className="accf-sec">
      <span className="material-symbols-outlined">{icon}</span>
      <h2>{title}</h2>
      {hint && <span className="accf-hint">{hint}</span>}
    </div>
    {children}
  </section>
);

const blankDefaultValues = {
  name: "",
  description: "",
  propertyType: undefined,
  roomType: undefined,
  extraInfo: undefined,
  images: [],
  amenities: [],
  address: {
    area: "",
    city: "",
    state: "",
    pincode: "",
  },
  checkIn: undefined,
  checkOut: undefined,
  maximumGuest: 0,
  price: "",
};

// mode: "create" (default, unchanged behaviour) | "edit"
// initialProperty: only used in edit mode - the accommodation
// fetched from the backend to pre-fill the form with.
const AccomodationForm = ({ mode = "create", initialProperty = null }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.accomodation);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showNoChangesAlert, setShowNoChangesAlert] = useState(false);

  const isEdit = mode === "edit" && !!initialProperty;

  // Captured once - the snapshot Update compares the live form
  // values against to decide if anything actually changed.
  const [originalValues] = useState(() =>
    isEdit ? propertyToFormValues(initialProperty) : null
  );

  const form = useForm({
    defaultValues: isEdit ? originalValues : blankDefaultValues,
    onSubmit: async ({ value }) => {
      if (isEdit) {
        const changed = haveAccomodationValuesChanged(originalValues, value);

        if (!changed) {
          setShowNoChangesAlert(true);
          return;
        }

        setSubmitting(true);
        try {
          await dispatch(
            updateAccomodation(initialProperty._id, {
              propertyName: value.name,
              description: value.description,
              propertyType: value.propertyType,
              roomType: value.roomType,
              extraInfo: value.extraInfo,
              images: value.images,
              address: value.address,
              amenities: value.amenities,
              checkInTime: value.checkIn,
              checkOutTime: value.checkOut,
              maximumGuest: value.maximumGuest,
              price: value.price,
            })
          );

          toast.success("Accommodation updated successfully");
          navigate("/accomodation");
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "Unable to update the accommodation. Please try again."
          );
        } finally {
          setSubmitting(false);
        }
        return;
      }

      // ---- create mode (unchanged) ----
      try {
        await dispatch(
          createAccomodation({
            propertyName: value.name,
            description: value.description,
            propertyType: value.propertyType,
            roomType: value.roomType,
            extraInfo: value.extraInfo,
            images: value.images,
            address: value.address,
            amenities: value.amenities,
            checkInTime: value.checkIn,
            checkOutTime: value.checkOut,
            maximumGuest: value.maximumGuest,
            price: value.price,
          })
        );

        await dispatch(getAllAccomodation());

        toast.success("New Property Created Successfully");

        navigate("/accomodation");
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
        console.error(error);
      }
    },
  });

  const handleAiDescription = async (field) => {
    const values = form.state.values;

    if (!values.name) {
      toast.error("Please add a title first");
      return;
    }

    setAiLoading(true);
    try {
      const description = await getAiDescription(values);
      field.handleChange(description);
      toast.success("Description added");
    } catch (error) {
      toast.error("Could not generate a description");
      console.error(error);
    }
    setAiLoading(false);
  };

  const handleCancelClick = () => {
    // Per requirement: whether or not anything was edited, Cancel
    // just discards and goes back - no API call either way.
    navigate("/accomodation");
  };

  const isBusy = isEdit ? submitting : loading;

  return (
    <div className="accf-page">
      <header className="accf-hero">
        <h1>
          <span className="material-symbols-outlined">home_work</span>
          {isEdit ? "Modify your place" : "List your place"}
        </h1>
        <p>{isEdit ? "Update the details below" : "Fill in the details below"}</p>
      </header>

      <form
        className="accf-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <Section icon="title" title="Title" hint="Short and catchy">
          <form.Field name="name">
            {(field) => (
              <input
                className="accf-input"
                type="text"
                placeholder="Sunny cottage near the beach"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </Section>

        <Section icon="location_on" title="Address">
          <AddressField form={form} />
        </Section>

        <Section icon="photo_library" title="Photos" hint="At least 6">
          <form.Field name="images">
            {(field) => <ImagesUploading field={field} />}
          </form.Field>
        </Section>

        <Section icon="home" title="Property">
          <div className="accf-grid-2">
            <div className="accf-field">
              <label>Property type</label>
              <form.Field name="propertyType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="House">House</option>
                    <option value="Flat">Flat</option>
                    <option value="Guest House">Guest House</option>
                    <option value="Hotel">Hotel</option>
                  </select>
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Room type</label>
              <form.Field name="roomType">
                {(field) => (
                  <select
                    className="accf-input"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    <option value="Anytype">Anytype</option>
                    <option value="Entire Home">Entire Home</option>
                    <option value="Room">Room</option>
                  </select>
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        <Section icon="checklist" title="Amenities" hint="Pick what you offer">
          <AmenitiesField form={form} />
        </Section>

        <Section icon="gavel" title="House rules" hint="Optional">
          <form.Field name="extraInfo">
            {(field) => (
              <textarea
                className="accf-input accf-textarea"
                rows="3"
                placeholder="Check-in after 1pm, no smoking indoors..."
                value={field.state.value || ""}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>
        </Section>

        <Section icon="description" title="Description">
          <form.Field name="description">
            {(field) => (
              <>
                <div className="accf-desc-row">
                  <span className="accf-hint">
                    Tell guests what makes your place special
                  </span>

                  <button
                    type="button"
                    className="accf-ai"
                    disabled={aiLoading}
                    onClick={() => handleAiDescription(field)}
                  >
                    <span className="material-symbols-outlined">
                      auto_awesome
                    </span>
                    {aiLoading ? "Writing..." : "Write with AI"}
                  </button>
                </div>
                <textarea
                  className="accf-input accf-textarea"
                  rows="5"
                  placeholder="Write a few lines, or let AI do it for you"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </>
            )}
          </form.Field>
        </Section>

        <Section icon="event" title="Stay details" hint="24 hour format">
          <div className="accf-grid-4">
            <div className="accf-field">
              <label>Check-in</label>
              <form.Field name="checkIn">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Check-out</label>
              <form.Field name="checkOut">
                {(field) => (
                  <input
                    className="accf-input"
                    type="time"
                    value={field.state.value || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Guests</label>
              <form.Field name="maximumGuest">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    placeholder="2"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <div className="accf-field">
              <label>Price / night</label>
              <form.Field name="price">
                {(field) => (
                  <input
                    className="accf-input"
                    type="number"
                    placeholder="2000"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                )}
              </form.Field>
            </div>
          </div>
        </Section>

        <div className={isEdit ? "accf-button-row" : ""}>
          {isEdit && (
            <button
              type="button"
              className="accf-cancel"
              disabled={isBusy}
              onClick={handleCancelClick}
            >
              Cancel
            </button>
          )}
          <button className="accf-save" type="submit" disabled={isBusy}>
            {isEdit
              ? isBusy
                ? "Updating..."
                : "Update"
              : isBusy
              ? "Saving..."
              : "Publish listing"}
          </button>
        </div>
      </form>

      <AlertModal
        isOpen={showNoChangesAlert}
        title="There are no changes!"
        message="You haven't changed anything on this accommodation yet."
        buttonLabel="OK"
        onClose={() => setShowNoChangesAlert(false)}
      />
    </div>
  );
};

export default AccomodationForm;
