const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = 3001;
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const userRoutes = require("./routes/userRoutes");

const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri)
  .then(() => console.info("Connected to mongo!"))
  .catch((err) => console.error(err));

app.use("/user", userRoutes);

app.listen(port, () => {
  console.log("Server started on port " + port);
});
