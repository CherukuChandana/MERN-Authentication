import React from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Google = ({ informParent = (f) => f }) => {
  const responseGoogle = (response) => {
    console.log(response.credential);
    axios({
      method: "POST",
      url: `${process.env.REACT_APP_API}/google-login`,
      data: { idToken: response.credential },
    })
      .then((response) => {
        console.log("GOOGLE SIGN-IN SUCCESS", response);
        informParent(response);
      })
      .catch((error) => {
        console.log("GOOGLE SIGN-IN ERROR", response);
      });
  };
  return (
    <div className="pb-3">
      <GoogleOAuthProvider
        clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}
      >
        <GoogleLogin
          clientId={`${process.env.REACT_APP_GOOGLE_CLIENT_ID}`}
          buttonText="Login"
          onSuccess={responseGoogle}
          onFailure={responseGoogle}
          render={({ onClick, logout }) => (
            <button
              onClick={onClick()}
              onLogoutClick={logout()}
              className="btn btn-primary btn-lg btn-block"
            >
              Login with Google
            </button>
          )}
        />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Google;
