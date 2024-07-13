const { default: mongoose } = require("mongoose");

const settings = new mongoose.Schema({
    key: {
        type: String,
        required: true,
    },
    value: [
        {
            type: {
                key: {
                    type: String,
                    required: true,
                },
                value: {
                    type: String,
                    required: true,
                }
            }
        }
    ]
},
    {
        timestamps: true,
    }
);

const Settings = mongoose.model('Settings', settings);
module.exports = Settings;