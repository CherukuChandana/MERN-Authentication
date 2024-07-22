import React, { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAuth, signout } from "../auth/helpers";
const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // const match = useMatch('')

  const isActive = (path) => {
    // console.log(path)
    if (location.pathname === path) {
      return {
        color: "black",
      };
    } else {
      return {
        color: "white",
      };
    }
  };

  // INSTEAD OF BELOW TWO FUNCTIONS, "TO" ATTRIBUTE CAN BE USED IN <LINK> INORDER TO REDIRECT
  // const redirectToAdmin = () => {
  //   navigate("/admin");
  // };
  // const redirectToPrivate = () => {
  //   navigate("/private");
  // };

  const nav = () => {
    return (
      <ul className="nav nav-tabs bg-primary fs-6 fw-bold">
        <li className="nav-item">
          <Link to="/" className="nav-link" style={isActive("/")}>
            Home
          </Link>
        </li>
        {!isAuth() && (
          <Fragment>
            <li className="nav-item">
              <Link
                to="/signin"
                className="nav-link"
                style={isActive("/signin")}
              >
                Signin
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/signup"
                className="nav-link"
                style={isActive("/signup")}
              >
                Signup
              </Link>
            </li>
          </Fragment>
        )}
        {/* {JSON.stringify(location)}  */}
        {/* {"pathname":"/","search":"","hash":"","state":null,"key":"rcog41bw"} */}
        {/* {JSON.stringify(match)} */}

        {isAuth() && isAuth().role === "admin" && (
          <li className="nav-item">
            <Link
              className="nav-link"
              style={isActive("/admin")}
              // onClick={redirectToAdmin()}
              to="/admin"
            >
              {isAuth().name}
            </Link>
          </li>
        )}

        {isAuth() && isAuth().role === "subscriber" && (
          <li className="nav-item">
            <Link
              className="nav-link"
              style={isActive("/private")}
              // onClick={redirectToPrivate()}
              to="/private"
            >
              {isAuth().name}
            </Link>
          </li>
        )}

        {isAuth() && (
          <li className="nav-item">
            <span
              className="nav-link"
              onClick={() => {
                signout(() => {
                  navigate("/");
                });
              }}
              style={{ cursor: "pointer", color: "white" }}
            >
              Signout
            </span>
          </li>
        )}
      </ul>
    );
  };
  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
};

export default Layout;
