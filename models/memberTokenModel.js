const mongoose = require("mongoose");
const Member = require("./memberModel");
const { SH_GH_TYPES } = require("../helpers/types");

const memberTokenSchema = new mongoose.Schema({
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Member"
    },
    tokenId: {
        type: Number,
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sendHelp: {
        type:{
            recipient:{
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "MemberToken"
            },
            recipientUserId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: "Member"
            },
            screenShot: {
                type: String,
                required: false
            },
            assignedOn: {
                type: Date,
                required: false
            },
            updatedAt: {
                type: Date,
                required: false
            },
            status: {
                enum: [
                    SH_GH_TYPES.COMPLETED, 
                    SH_GH_TYPES.APPROVAL_PENDING, 
                    SH_GH_TYPES.REJECTED, 
                    SH_GH_TYPES.EXPIRED, 
                    SH_GH_TYPES.PAYMENT_PENDING
                ],
                type: String,
                required: true,
                default: SH_GH_TYPES.PAYMENT_PENDING
            },
            rejectionLimit: {
                type: Number,
                required: false,
                default: 0
            },
        }
    },
    getHelp1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MemberToken"
    },
    getHelp2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MemberToken"
    },
    container: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Container"
    },
},
    {
        timestamps: true,
    }
);

memberTokenSchema.pre("save", async function (next) {
    const memberToken = this;
    if(!memberToken.isNew) return next();
    const highestToken = await Member.findOne({ memberId: memberToken.memberId }).sort({ tokenId: -1 });
    memberToken.tokenId = highestToken ? highestToken.tokenId + 1 : 1;
    next();
});

const MemberToken = mongoose.model("MemberToken", memberTokenSchema);
module.exports = MemberToken;