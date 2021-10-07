const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

mongoose
  .connect(`mongodb://localhost:27017/shoping`, {
    autoIndex: false,
  })
  .then(() => console.log("Database connect successfully"));

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App  running on port ${port}...`);
});
