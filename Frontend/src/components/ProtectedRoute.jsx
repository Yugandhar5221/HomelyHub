import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingSpinner from "./LoadingSpinner";

// Wrap any route that requires login with this instead of the old
// `user ? <Page/> : <Navigate to="/login"/>` pattern.
//
// Why: on a hard refresh, Redux resets and `user` is null for a
// moment while App.jsx's currentUser() request is still in flight.
// The old pattern read `user` immediately and redirected before the
// session cookie had even been checked, which is what was kicking
// people back to the login page (and, via Login's own "already
// logged in -> go home" effect, all the way back to the homepage).
//
// This component waits for `authChecked` to become true first, and
// only then decides - so a logged-in user refreshing a protected
// page simply stays on it.
const ProtectedRoute = ({ children }) => {
  const { user, authChecked } = useSelector((state) => state.user);

  if (!authChecked) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "60vh" }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
