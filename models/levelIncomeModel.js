const mongoose = require("mongoose");
const Member = require("./memberModel");
const MemberToken = require("./memberTokenModel");

const levelModelSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Member,
      required: true,
    },
    sourceToken: {
      type: mongoose.Schema.Types.ObjectId,
      ref: MemberToken,
      required: true,
    },
    level: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const LevelIncome = mongoose.model("LevelIncome", levelModelSchema);
module.exports = LevelIncome;
