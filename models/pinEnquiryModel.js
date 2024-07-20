const mongoose = require('mongoose');
const { PIN_STATUS } = require('../helpers/types');

const pinEnquirySchema = new mongoose.Schema({
    qty: {
        type: Number,
        required: true,
    },
    status: {
        enum: [PIN_STATUS.REQUESTED, PIN_STATUS.SENT],
        type: String,
        required: true,
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    screenShot: {
        type: String,
        required: true,
    },
},
    {
        timestamps: true,
    }
);

const PinEnquiry = mongoose.model('PinEnquiry', pinEnquirySchema);
module.exports = PinEnquiry;