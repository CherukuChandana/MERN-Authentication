// const { response } = require("express");
const User = require("../models/user");
exports.read = (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      user.hashed_password = undefined;
      user.salt = undefined;
      res.json(user);
    })
    .catch((err) => {
      return res.status(400).json({
        error: "User not found",
      });
    });
};

exports.update = (req, res) => {
  const { name, password } = req.body;

  User.findOne({ _id: req.auth._id })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(400).json({
          error: "User not found",
        });
      }
      if (!name) {
        return res.status(400).json({
          error: "Name is required",
        });
      } else {
        user.name = name;
      }
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({
            error: "Password must be atleast 6 characters long",
          });
        } else {
          user.password = password;
        }
      }
      user
        .save()
        .then((updatedUser) => {
          updatedUser.hashed_password = undefined;
          updatedUser.salt = undefined;
          res.json(updatedUser);
          console.log(req);
        })
        .catch((err) => {
          console.log("USER UPDATE ERROR!");
          return res.status(400).json({
            error: "User update failed",
          });
        });
    })
    .catch((err) => {
      return res.status(400).json({
        error: "User not found",
      });
    });
};
