import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Signup from "./auth/Signup";
import Signin from "./auth/Signin";
import Activate from "./auth/Activate";
import Private from "./core/Private";
import PrivateRoute from "./auth/PrivateRoute";
import Admin from "./core/Admin";
import AdminRoute from "./auth/AdminRoute";
import Forgot from "./auth/ForgotPwd";
import Reset from "./auth/ResetPwd";

const MyRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" exact Component={App} />
        <Route path="/signup" exact element={<Signup />} />
        <Route path="/signin" exact element={<Signin />} />
        <Route path="/auth/activate/:token" exact element={<Activate />} />
        {/* <Route path="/auth/activate/:token" exact Component={Activate} /> */}
        <Route
          path="/private"
          element={
            <PrivateRoute>
              <Private />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        <Route path="/auth/password/forgot" exact element={<Forgot />} />
        <Route path="/auth/password/reset/:token" exact element={<Reset />} />
      </Routes>
    </BrowserRouter>
  );
};
export default MyRoutes;
