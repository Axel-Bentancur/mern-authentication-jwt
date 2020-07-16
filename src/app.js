//Requirement
const express = require("express");
const cors = require("cors");

//Initializations
const app = express();

//Settings
app.set("port", process.env.PORT || 5000);

//Middlewares
app.use(express.json());
app.use(cors());

//Routes
app.use("/users", require("./Routes/userRouter"));

//Exports
module.exports = app;
