import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../core/Layout";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
import { jwtDecode } from "jwt-decode";
const Activate = () => {
  const { token } = useParams();

  const [values, setValues] = useState({
    name: "",
    // token: '',
    show: true,
  });

  useEffect(() => {
    console.log("use effect invoked");
    // console.log(token);
    // let token = match.params.token;
    console.log(token);
    let { name } = jwtDecode(token);
    if (token) {
      setValues({ ...values, name, token });
    }
  }, [token, values]);

  const clickSubmit = (event) => {
    console.log(event.target);
    event.preventDefault();
    setValues({ ...values });
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/account-activation`,
      data: { token },
    })
      .then((response) => {
        console.log("ACCOUNT ACTIVATION SUCCESS", response);
        setValues({ ...values, show: false });
        toast.success(response.data.message);
      })
      .catch((error) => {
        console.log("ACCOUNT ACTIVATION ERROR", error.response.data.error);
        toast.error(error.response.data.error);
      });
  };

  // const {name} = values;
  const { name } = values;

  const activationLink = () => (
    <div className="text-center">
      <h1 className="p-5 ">Hey {name}, Ready to activate your account?</h1>
      <button className="btn  btn-outline-primary" onClick={clickSubmit}>
        Activate Account
      </button>
    </div>
  );
  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <ToastContainer />
        {activationLink()}
      </div>
    </Layout>
  );
};

export default Activate;
