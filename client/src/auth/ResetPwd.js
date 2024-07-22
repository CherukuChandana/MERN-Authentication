import React, { useState, useEffect } from "react";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Reset = () => {
  const { token } = useParams();
  const [values, setValues] = useState({
    name: "",
    token: "",
    newPassword: "",
    buttonText: "Reset Password",
  });

  const { name, newPassword, buttonText } = values;

  const handleChange = (event) => {
    setValues({ ...values, newPassword: event.target.value });
  };

  useEffect(() => {
    let { name } = jwtDecode(token);
    if (token) {
      setValues({ ...values, name, token });
    }
  }, [token, values]);

  const clickSubmit = (event) => {
    console.log(event.target);
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "PUT",
      url: `${process.env.REACT_APP_API}/reset-password`,
      data: { newPassword, resetPasswordLink: token },
    })
      .then((response) => {
        console.log("RESET-PASSWORD SUCCESS", response);
        toast.success(response.data.message);
        setValues({ ...values, buttonText: "Done" });
      })
      .catch((error) => {
        console.log("RESET-PASSWORD ERROR", error.response.data);
        setValues({ ...values, buttonText: "Reset Password" });
        toast.error(error.response.data.error);
      });
  };

  const resetPasswordForm = () => (
    <form>
      <div className="form-group">
        {/* <label className="text-muted">Email</label> */}
        <input
          onChange={handleChange}
          value={newPassword}
          type="password"
          className="form-control"
          placeholder="Type new password"
          required
        />
      </div>

      <br></br>
      <div>
        <button onClick={clickSubmit} className="btn btn-primary">
          {buttonText}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />

        <h1 className="p-5 text-center">Hey {name}, Type your new password</h1>
        {resetPasswordForm()}
      </div>
    </Layout>
  );
};

export default Reset;
