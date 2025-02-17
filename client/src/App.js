import React from "react";
import Layout from "./core/Layout";
const App = () => {
  return (
    <Layout>
      <div className="col-md-6 offset-md-3 text-center">
        <h1 className="p-5">MERN STACK</h1>
        <h2>Mongodb Express React Node</h2>
        <hr />
        <p className="lead">
          MERN stack login - register system with account activation,
          forgot-password, reset-password, login with google as well as private
          and protected routes for authenticated user and users with the role of
          admin.
        </p>
      </div>
    </Layout>
  );
};

export default App;
