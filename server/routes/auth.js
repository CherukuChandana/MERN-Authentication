const express = require("express");

const router = express.Router();

// ************************************
// no need when controllers are used
// router.get('/signup', (req, res) => {
//     res.json({
//         data: 'You hit signup endpoint..!'
//     });
// });
// ************************************

// import controller
const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
  googleLogin,
} = require("../controllers/auth");

// import validators
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require("../validators/auth");
const { runValidation } = require("../validators");

// router.get('/signup', signup);
router.post("/signup", userSignupValidator, runValidation, signup);
router.post("/account-activation", accountActivation);
router.post("/signin", userSigninValidator, runValidation, signin);
router.put(
  "/forgot-password",
  forgotPasswordValidator,
  runValidation,
  forgotPassword
);
router.put(
  "/reset-password",
  resetPasswordValidator,
  runValidation,
  resetPassword
);
router.post("/google-login", googleLogin);

module.exports = router; //{}
