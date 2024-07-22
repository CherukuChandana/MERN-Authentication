// const express = require('express');

// const app = express();

// // below code is not required when routes is used
// // app.get('/api/signup', (req, res) => {
// //     res.json({
// //         data: 'You hit signup endpoint..!'
// //     });
// // });

// // import routes
// const authRoutes = require('./routes/auth');
// // middleware
// app.use('/api', authRoutes);

// const port = process.env.port || 8000;

// app.listen(port, ()=>{
//     console.log(`API is running in the port ${port}`);
// });
// require("../client/")
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// connect server to db
mongoose
  .connect(process.env.DATABASE, {
    // no more deprecations in new versions...!!
    // useNewUrlParser: true,
    // useFindAndModify : false,
    // useUnifiedTopology: true,
    // useCreateIndex: true
  })
  .then(() => {
    console.log("DB Connected");
  })
  .catch((err) => {
    console.log("DB CONNECTION ERROR: ", err);
  });

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

// app middlewares => must be above the route-middlewares
app.use(morgan("dev"));
// app.use(cors()) //to allow all origins
if ((process.env.NODE_ENV = "development")) {
  app.use(cors({ origin: `http://localhost:3000` }));
}
app.use(bodyParser.json());

// middleware
app.use("/api", authRoutes);
app.use("/api", userRoutes);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`API is running on port ${port}`);
});

// if changes are made to .env file, then we need to restart the server by - npm start
