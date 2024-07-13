const mongoose = require('mongoose');

const dayTableSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    systemIdCreationLimit: {
        type: Number,
        required: true,
    },
    published: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const DayTable = mongoose.model('DayTable', dayTableSchema);
exports.DayTable = DayTable;