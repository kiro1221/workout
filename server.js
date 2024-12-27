const dotenv = require("dotenv").config();
const express = require("express");
const connectDB = require("./db/connect");
const app = express();
const port = process.env.PORT || 3000;
const authController = require("./controllers/authController");
const exercisesController = require("./controllers/exercisesController");
const checkUser = require("./middleware/authMiddleware");
const render = require("./controllers/renderController");

const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
// app.use(checkUser);
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/auth", authController);
app.use("/exercises", exercisesController);
app.use("/render", render);

;


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("Connected to db...👾");
    app.listen(port, () => {
      console.log(`Listening on port ${port}...🤖`);
    });
  } catch (err) {
    console.log(err);
  }
};
start();
