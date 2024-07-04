const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const DB =
  "mongodb+srv://madridrami97:RAmi2002@cluster0.i2n1z4g.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(DB)
  .then(() => console.log("Database has beeen connected successfuly"))
  .catch((err) => console.log(err));

const port = 3000;

app.listen(port, () => {
  console.log(`your server is currently running on port: ${port}`);
});
