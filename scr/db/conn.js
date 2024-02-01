const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/schoolacademyform", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connection successful.");
  })
  .catch((e) => {
    console.error("Database connection failed:", e.message);
  });
