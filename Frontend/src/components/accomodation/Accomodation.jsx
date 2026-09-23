import React, { useEffect, useState } from "react";
import "../../css/Accomodation.css";
import ProgressSteps from "../ProgressSteps";
import MyAccomodation from "./MyAccomodation";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllAccomodation,
  deleteAccomodation,
} from "../../store/Accomodation/Accomodation-action";
import LoadingSpinner from "../LoadingSpinner";
import ConfirmationModal from "../ConfirmationModal";
import toast from "react-hot-toast";

const Accomodation = () => {
  const dispatch = useDispatch();

  const { accomodation, loading } = useSelector((state) => state.accomodation);

  const [accomodationToDelete, setAccomodationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    dispatch(getAllAccomodation());
  }, [dispatch]);

  const handleConfirmDelete = async () => {
    if (!accomodationToDelete) return;
    setDeleting(true);
    try {
      await dispatch(deleteAccomodation(accomodationToDelete._id));
      toast.success("Accommodation deleted successfully");
      setAccomodationToDelete(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to delete the accommodation. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <ProgressSteps accomodation />
      <div className="accom-container">
        <Link to="/accomodationform">
          <button className="add-new-place">+ Add new place</button>
        </Link>
        {loading && <LoadingSpinner />}
        {accomodation.length === 0 && !loading && (
          <div className="accom-empty-state">
            <span className="material-symbols-outlined accom-empty-icon">
              home_work
            </span>
            <h4>You haven&apos;t listed any accommodation yet</h4>
          </div>
        )}
        {accomodation.length > 0 && !loading && (
          <MyAccomodation
            accomodation={accomodation}
            loading={loading}
            onDeleteClick={setAccomodationToDelete}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={!!accomodationToDelete}
        title="Delete Accommodation?"
        message="Are you sure you want to delete this accommodation?"
        confirmLabel="Yes, Delete"
        cancelLabel="No, Keep Accommodation"
        variant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setAccomodationToDelete(null)}
      />
    </>
  );
};

export default Accomodation;
