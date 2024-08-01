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
  image1: {
    type: String,
    default: "profile_image_url_here",
    required: true,
  },
  image2: {
    type: String,
    default: "profile_image_url_here",
    required: true,
  },
  mobile: {
    type: Number,
    required: false,
  },
  mobileMasked: {
    type: Boolean,
    required: false,
  },
  note: {
    type: String,
    required: false,
  },
  upiId: {
    type: String,
    required: false,
  },
  gPay: {
    type: Number,
    required: false,
  },
  phonePe: {
    type: Number,
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
  freePinImage: {
    type: String,
    required: false,
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
  isSilver: {
    type: Boolean,
    default: false,
  },
  stage: {
    type: String,
    enum: [
      MEMBER_STAGE.NEW,
      MEMBER_STAGE.SILVER,
      MEMBER_STAGE.GOLD,
      MEMBER_STAGE.PLATINUM,
      MEMBER_STAGE.LEADER,
      MEMBER_STAGE.DIAMOND,
    ],
    default: MEMBER_STAGE.NEW,
  },
  teamCount: {
    type: Number,
    default: 0,
    required: false,
  },
  silverCount: {
    type: Number,
    default: 0,
    required: false,
  },
  levels: {
    type: Map,
    of: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
    default: new Map(),
  },
  loginAttempts: {
    type: Number,
    default: 0,
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



