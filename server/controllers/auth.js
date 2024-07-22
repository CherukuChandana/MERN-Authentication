// ***********************************
// exports.signup = (req, res) => {
//     console.log('REQ BODY ON SIGNUP', req.body);
//     res.json({
//         data: 'You hit signup endpoint..!'
//     });
// };
// ***********************************

//  *************WITHOUT SENDING EMAIL**********************
// const User = require('../models/user');

// exports.signup = async (req, res) => {
//     const { name, email, password } = req.body;
//     // User.findOne({email}).exec((err, user) => {
//     //     if(user){
//     //         return res.status(400).json({
//     //             error: 'Email is taken'
//     //         })
//     //     }
//     // })
//     try {
//         const user = await User.findOne({ email })
//         if (user) {
//             return res.status(400).json({
//                 error: 'Email is taken'
//             })
//         }

//         let newUser = new User({ name, email, password })
//         // newUser.save((err, success) => {
//         //     if(err){
//         //         console.log('SIGNUP ERROR', err);
//         //         return res.status(400).json({
//         //             error: err
//         //         })
//         //     }
//         //     res.json({
//         //         message: 'Signup success! Please signin'
//         //     });
//         // });
//         // try {
//         const savedUser = await newUser.save();
//         // if (success) {
//         res.json({
//             message: 'Signup success! Please signin',
//             user: savedUser
//         });
//         // }
//     } catch (err) {
//         console.log('SIGNUP ERROR', err);
//         return res.status(400).json({
//             error: err
//         })
//     }
// };
// ***********************************

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const elasticEmail = require("@elasticemail/elasticemail-client");
const { expressjwt } = require("express-jwt");
const _ = require("lodash");
const { OAuth2Client } = require("google-auth-library");

exports.signup = (req, res) => {
  const { name, email, password } = req.body;
  User.findOne({ email })
    .exec()
    .then((user) => {
      if (user) {
        return res.status(400).json({
          error: "Email is taken",
        });
      }
      const token = jwt.sign(
        { name, email, password },
        process.env.JWT_ACCOUNT_ACTIVATION,
        { expiresIn: "10m" }
      );

      const client = elasticEmail.ApiClient.instance;
      const apikey = client.authentications["apikey"];
      apikey.apiKey = process.env.ELASTICMAIL_API_KEY;

      let api = new elasticEmail.EmailsApi();

      const emailData = {
        // from: process.env.EMAIL_FROM,
        // to: email,
        // subject: `Account activation link`,
        // html: `
        //     <h1>Please use the following link to activate your account</h1>
        //     <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        //     <hr>
        //     <p>This email may contain sensitive information</p>
        //     <p>${process.env.CLIENT_URL}</p>
        // `
        Recipients: {
          To: [email],
        },
        Content: {
          Body: [
            {
              ContentType: "HTML",
              Charset: "utf-8",
              Content: `
                        <h1>Please use the following link to activate your account</h1>
                        <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                    `,
            },
            {
              ContentType: "plainText",
              Charset: "utf-8",
              Content: "Activate your Account",
            },
          ],
          From: process.env.EMAIL_FROM,
          subject: "Account Activation Link",
        },
      };
      const callback = (err, data, response) => {
        if (err) {
          console.error(`err: ${err}`);
          res.status(200).json({
            failed: "ERROR IN CALLBACK",
            message: err.message,
          });
        } else {
          console.log("API called successfully");
          console.log("Email sent");
          console.log(req.body);
          res.status(200).json({
            success: "done",
            message: `Email is successfully sent to ${email}! Follow the instruction to activate your account.`,
          });
        }
      };
      api.emailsTransactionalPost(emailData, callback);
    })
    .catch((err) => {
      console.log("SIGNUP ERROR ", err);
      return res.status(400).json({
        error: err,
      });
    });
};

exports.accountActivation = (req, res) => {
  const { token } = req.body;
  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          console.log("JWT VERIFY IN ACCOUNT ACTIVATION ERROR", err);
          return res.status(401).json({
            error: "Expired link. Signup again",
          });
        }
        const { name, email, password } = jwt.decode(token);
        const user = new User({ name, email, password });

        const savedUser = user
          .save()
          .then((user) => {
            res.json({
              message: "Signup success! Please signin",
              // user: user
            });
          })
          .catch((err) => {
            // console.log('SIGNUP ERROR', err);
            console.log("SAVE USER IN ACCOUNT ACTIVATION ERROR", err);
            return res.status(401).json({
              error: "Error saving user in database. Try signup again",
            });
          });
      }
    );
  } else {
    return res.json({
      message: "Something went wrong. Try again",
    });
  }
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  // check if user exist
  User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: `User with that email doesnot exist. Please signup`,
        });
      }

      // authenticate
      if (!user.authenticate(password)) {
        return res.status(400).json({
          error: "Email and password do not match",
        });
      }

      // generate a token and send to client
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      const { _id, name, email, role } = user;

      return res.json({
        token,
        user: { _id, name, email, role },
      });
    })
    .catch((err) => {
      return res.status(400).json({
        error: `User with that email doesnot exist. Please signup`,
      });
    });
};

exports.requireSignin = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
});

exports.adminMiddleware = (req, res, next) => {
  // console.log(req);
  User.findById({ _id: req.auth._id })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      if (user.role !== "admin") {
        return res.status(400).json({
          error: "Admin resource. Access denied",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      req.profile = user;
      next();
    })
    .catch((err) => {
      return res.status(400).json({
        error: "User not found",
      });
    });
};

exports.forgotPassword = (req, res) => {
  const { email } = req.body;

  User.findOne({ email })
    .exec()
    .then((user) => {
      if (!user) {
        console.log("FORGOT-PASSWORD ERROR ", err);
        return res.status(400).json({
          error: "User with that email does not exist",
        });
      }
      const token = jwt.sign(
        { _id: user._id, name: user.name },
        process.env.JWT_RESET_PASSWORD,
        { expiresIn: "10m" }
      );

      const client = elasticEmail.ApiClient.instance;
      const apikey = client.authentications["apikey"];
      apikey.apiKey = process.env.ELASTICMAIL_API_KEY;

      let api = new elasticEmail.EmailsApi();

      const emailData = {
        // from: process.env.EMAIL_FROM,
        // to: email,
        // subject: `Account activation link`,
        // html: `
        //     <h1>Please use the following link to activate your account</h1>
        //     <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
        //     <hr>
        //     <p>This email may contain sensitive information</p>
        //     <p>${process.env.CLIENT_URL}</p>
        // `
        Recipients: {
          To: [email],
        },
        Content: {
          Body: [
            {
              ContentType: "HTML",
              Charset: "utf-8",
              Content: `
                        <h1>Please use the following link to reset your password</h1>
                        <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
                    `,
            },
            {
              ContentType: "plainText",
              Charset: "utf-8",
              Content: "Activate your Account",
            },
          ],
          From: process.env.EMAIL_FROM,
          subject: "Password Reset Link",
        },
      };

      // const callback = (err, data, response) => {
      //   if (err) {
      //     console.error(`err: ${err}`);
      //     res.status(200).json({
      //       failed: "ERROR IN CALLBACK",
      //       message: err.message,
      //     });
      //   } else {
      //     console.log("API called successfully");
      //     console.log("Email sent");
      //     console.log(req.body);
      //     res.status(200).json({
      //       success: "done",
      //       message: `Email is successfully sent to ${email}! Follow the instruction to reset your password.`,
      //     });
      //   }
      // };
      // api.emailsTransactionalPost(emailData, callback);

      return user
        .updateOne({ resetPasswordLink: token })
        .then(() => {
          const callback = (err, data, response) => {
            if (err) {
              console.error(`err: ${err}`);
              res.status(200).json({
                failed: "ERROR IN CALLBACK",
                message: err.message,
              });
            } else {
              console.log("API called successfully");
              console.log("Email sent");
              console.log(req.body);
              res.status(200).json({
                success: "done",
                message: `Email is successfully sent to ${email}! Follow the instruction to reset your password.`,
              });
            }
          };
          api.emailsTransactionalPost(emailData, callback);
        })
        .catch((err) => {
          console.log("RESET-PASSWORD LINK ERROR", err);
          return res.status(400).json({
            error: "Database connection error on user password forgot request",
          });
        });
    })
    .catch((err) => {
      console.log("FORGOT-PASSWORD ERROR ", err);
      return res.status(400).json({
        error: "User with that email does not exist",
      });
    });
};

exports.resetPassword = (req, res) => {
  const { resetPasswordLink, newPassword } = req.body;
  if (resetPasswordLink) {
    jwt.verify(
      resetPasswordLink,
      process.env.JWT_RESET_PASSWORD,
      function (err, decoded) {
        if (err) {
          console.log("RESET-PASSWORD ERROR ", err);
          return res.status(400).json({
            error: "Expired link!. Try again",
          });
        }
        User.findOne({ resetPasswordLink })
          .exec()
          .then((user) => {
            if (!user) {
              console.log("RESET-PASSWORD ERROR ", err);
              return res.status(400).json({
                error: "Something went wrong. Try later",
              });
            }

            const updatedFields = {
              password: newPassword,
              resetPasswordLink: "",
            };

            user = _.extend(user, updatedFields);

            const savedUser = user
              .save()
              .then((user) => {
                res.json({
                  message:
                    "Reset Password success! Now you can login with your new password",
                });
              })
              .catch((err) => {
                return res.status(400).json({
                  error: "Error resetting user password",
                });
              });
          })
          .catch((err) => {
            console.log("RESET-PASSWORD ERROR ", err);
            return res.status(400).json({
              error: "Something went wrong. Try later",
            });
          });
      }
    );
  }
};

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
exports.googleLogin = (req, res) => {
  const { idToken } = req.body;
  client
    .verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })
    .then((response) => {
      console.log("GOOGLE LOGIN RESPONSE", response);
      const { email_verified, name, email } = response.payload;
      if (email_verified) {
        User.findOne({ email })
          .exec()
          .then((user) => {
            if (user) {
              const token = jwt.sign(
                { _id: user._id },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
              );
              const { _id, email, name, role } = user;
              return res.json({
                token,
                user: { _id, email, name, role },
              });
            } else {
              let password = email + process.env.JWT_SECRET;
              user = new User({ name, email, password });
              user
                .save()
                .then((data) => {
                  const token = jwt.sign(
                    { _id: data._id },
                    process.env.JWT_SECRET,
                    { expiresIn: "7d" }
                  );
                  const { _id, email, name, role } = user;
                  return res.json({
                    token,
                    user: { _id, email, name, role },
                  });
                })
                .catch((error) => {
                  return res.status(400).json({
                    error: "user signup failed with Google",
                  });
                });
            }
          })
          .catch((error) => {
            return res.status(400).json({
              error: "user signup failed with Google",
            });
          });
      } else {
        return res.status(400).json({
          error: "Google login failed. Try again!",
        });
      }
    });
};
