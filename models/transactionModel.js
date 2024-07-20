const { default: mongoose } = require("mongoose");
const { TRANSACTION_TYPES } = require("../helpers/types");

const transactionSchema = new mongoose.Schema({
    qty: {
        type: Number,
        required: true,
    },
    narration: {
        type: String,
        required: false,
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: false,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Member",
        required: false,
    },
    sentByAdmin: {
        type: Boolean,
        default: false,
    },
    sentToAdmin: {
        type: Boolean,
        default: false,
    },
    transactionType: {
        enum: [TRANSACTION_TYPES.BUY, TRANSACTION_TYPES.TRANSFER, TRANSACTION_TYPES.FREE, TRANSACTION_TYPES.ID_CREATE, TRANSACTION_TYPES.REDEEM],
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    }
},
    {
        timestamps: true,
    }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;