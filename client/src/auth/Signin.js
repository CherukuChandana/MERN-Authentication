import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { authenticate, isAuth } from "./helpers";
import Google from "./LoginWithGoogle";

const Signin = () => {
  const [values, setValues] = useState({
    email: "chandanachandana4646@gmail.com",
    password: "chandu123",
    buttonText: "Submit",
  });

  const { email, password, buttonText } = values;

  // const history = useHistory();
  const navigate = useNavigate();
  const redirectToHome = () => {
    // history.push('/');
    navigate("/");
  };
  const redirectToAdmin = () => {
    navigate("/admin");
  };
  const redirectToPrivate = () => {
    navigate("/private");
  };

  const handleChange = (name) => (event) => {
    setValues({ ...values, [name]: event.target.value });
  };

  const informParent = (response) => {
    authenticate(response, () => {
      // toast.success(`Hey ${response.data.user.name}, Welcome back!`);
      isAuth() && isAuth().role === "admin"
        ? redirectToAdmin()
        : redirectToPrivate();
    });
  };

  const clickSubmit = (event) => {
    console.log(event.target);
    event.preventDefault();
    setValues({ ...values, buttonText: "Submitting" });
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/signin`,
      data: { email, password },
    })
      .then((response) => {
        console.log("SIGNIN SUCCESS", response);
        // save the response in localStorage/cookie
        authenticate(response, () => {
          // toast.success(`Hey ${response.data.user.name}, Welcome back!`);
          isAuth() && isAuth().role === "admin"
            ? redirectToAdmin()
            : redirectToPrivate();
        });
      })
      .catch((error) => {
        console.log("SIGNIN ERROR", error.response.data);
        setValues({ ...values, buttonText: "Submit" });
        toast.error(error.response.data.error);
      });
  };

  const signinForm = () => (
    <form>
      <div className="form-group">
        <label className="text-muted">Email</label>
        <input
          onChange={handleChange("email")}
          value={email}
          type="email"
          className="form-control"
        />
      </div>

      <div className="form-group">
        <label className="text-muted">Password</label>
        <input
          onChange={handleChange("password")}
          value={password}
          type="password"
          className="form-control"
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
      {/* {JSON.stringify(isAuth())}  */}
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        {isAuth() ? redirectToHome() : null}

        {/* {JSON.stringify({name, email, password})} */}
        <h1 className="p-5 text-center">Signin</h1>
        <Google informParent={informParent} />
        {signinForm()}
        <br />
        <Link
          to={"/auth/password/forgot"}
          className="btn btn-sm btn-outline-danger"
        >
          Forgot Password
        </Link>
      </div>
    </Layout>
  );
};

export default Signin;
