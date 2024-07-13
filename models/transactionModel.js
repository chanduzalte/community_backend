
const transactionSchema = new mongoose.Schema({
    qty: {
        type: Number,
        required: true,
    },
    narration: {
        type: String,
        required: true,
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
        enum: ["buy", "transfer", "free", "token"],
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