import React from "react";
import { Navigate } from "react-router-dom";
import { isAuth } from "./helpers";

const AdminRoute = ({ children }) => {
  if (!isAuth()) {
    return <Navigate to="/signin" />;
  }
  if (isAuth() && isAuth().role === "admin") return children;
};

export default AdminRoute;
