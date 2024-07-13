const mongoose = require("mongoose");

const faqModelSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
            required: false,
        },
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

faqModelSchema.pre("save", async function (next) {
    const faq = this;
    if(!faq.isNew) return next();
    const highestFAQ = await FAQ.findOne().sort({ id: -1 });
    faq.id = highestFAQ ? highestFAQ.id + 1 : 1;
    next();
});

const FAQ = mongoose.model("FAQ", faqModelSchema);
module.exports = FAQ;