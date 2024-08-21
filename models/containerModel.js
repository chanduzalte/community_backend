const mongoose = require("mongoose");

const containerModelSchema = new mongoose.Schema(
  {
    containerName: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      required: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishDateTime: {
      type: Date,
      required: false,
    },
    endDateTime: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

const Container = mongoose.model("Container", containerModelSchema);
module.exports = Container;
