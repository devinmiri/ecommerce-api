require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const fileUploader = require("express-fileupload");
const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const mongosanitize = require("express-mongo-sanitize");

//extra packages


const cookieParser = require("cookie-parser");

const errorHandlerMiddleware = require("./middleware/error-handler");
const notFoundMiddleware = require("./middleware/not-found");
const connectDB = require("./db/connect");
const router = require("./routes");

//Middlewares
app.set("trust proxy", 1);
app.use(rateLimiter({ windowMs: 15 * 60 * 1000, max: 60 }));
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(mongosanitize());
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUploader({ useTempFiles: true }));
app.use(express.static("./public"));

//Routes
app.get("/api/v1", (req, res) => {
  // console.log(req.cookies)
  // console.log(req.signedCookies);
  res.send("Ecommerce API");
});

//Main routes
app.use("/api/v1", router);

//custom middlewares
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// Start the server
const startServer = async () => {
  try {   
    // connect to database
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to database");

    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
