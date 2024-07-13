const mongoose = require("mongoose");

const levelPriceModelSchema = new mongoose.Schema(
  {
    price: [Number],
  },
  { timestamps: true }
);

const LevelPrice = mongoose.model("LevelPrice", levelPriceModelSchema);
module.exports = LevelPrice;
