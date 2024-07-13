// models/customerModel.js
const mongoose = require("mongoose");
const { VIDEO_KYC_STATUS, MEMBER_STAGE } = require("../helpers/types");
const memberSchema = new mongoose.Schema({
  fname: {
    type: String,
    required: false,
  },
  lname: {
    type: String,
    required: false,
  },
  profileImage: {
    type: String,
    required: false,
  },
  mobile: {
    type: Number,
    required: false,
  },
  upiId: {
    type: String,
    required: false,
  },
  passcode: {
    type: String,
    required: false,
  },
  otp: {
    type: Number,
    required: false,
  },
  otpExpires: {
    type: Date,
    required: false,
  },
  isMobileVerified: {
    type: Boolean,
    default: false,
  },
  epinBalance: {
    type: Number,
    default: 0,
  },
  referralCode: {
    type: String,
    required: false,
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: false,
  },
  isFollowed: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  videoKYC: {
    type: {
      url: {
        type: String,
        required: false,
      },
      status: {
        type: String,
        enum: [
          VIDEO_KYC_STATUS.PENDING,
          VIDEO_KYC_STATUS.APPROVED,
          VIDEO_KYC_STATUS.REJECTED,
        ],
        default: VIDEO_KYC_STATUS.PENDING,
      },
    }
  },
  isSliver: {
    type: Boolean,
    default: false,
  },
  stage: {
    type: String,
    enum: [
      MEMBER_STAGE.NEW,
      MEMBER_STAGE.SLIVER,
      MEMBER_STAGE.GOLD,
      MEMBER_STAGE.DIAMOND,
      MEMBER_STAGE.PLATINUM,
    ],
    default: MEMBER_STAGE.NEW,
  },
  levels: {
    1: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    2: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    3: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    4: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    5: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    6: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    7: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
  },
  tags: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tag",
    },
  ],
  income: {
    type: Number,
    default: 0,
  }
},
  {
    timestamps: true,
  }
);
const Member = mongoose.model("Member", memberSchema);
module.exports = Member;



