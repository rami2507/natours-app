const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

const DB = process.env.DB;

mongoose
  .connect(DB)
  .then(() => console.log("Database has beeen connected successfuly"))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`your server is currently running on port: ${port}`);
});

module.exports = server;
