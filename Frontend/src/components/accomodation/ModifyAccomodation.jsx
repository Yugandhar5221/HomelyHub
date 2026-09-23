import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import LoadingSpinner from "../LoadingSpinner";
import AccomodationForm from "./AccomodationForm";
import { getPropertyDetails } from "../../store/PropertyDetails/propertyDetails-action";
import { propertyDetailsAction } from "../../store/PropertyDetails/propertyDetails-slice";

const ModifyAccomodation = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { propertydetails, loading } = useSelector(
    (state) => state.propertydetails
  );
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getPropertyDetails(id));

    // Don't let a stale property from a previous visit to this
    // page (or from browsing the public listing page) leak into
    // this form for a split second.
    return () => {
      dispatch(propertyDetailsAction.getPropertyDetails(null));
    };
  }, [dispatch, id]);

  // The property this route is for hasn't finished loading yet,
  // or belongs to someone else - either way, don't render the form.
  const isLoaded = propertydetails && propertydetails._id === id;

  useEffect(() => {
    if (isLoaded && user && propertydetails.userId && propertydetails.userId !== user._id) {
      toast.error("You are not allowed to modify this accommodation");
      navigate("/accomodation");
    }
  }, [isLoaded, propertydetails, user, navigate]);

  if (!isLoaded || loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AccomodationForm
      key={propertydetails._id}
      mode="edit"
      initialProperty={propertydetails}
    />
  );
};

export default ModifyAccomodation;
