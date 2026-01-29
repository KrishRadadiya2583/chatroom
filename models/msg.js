const mongoose = require("mongoose");

const msgSchema = new mongoose.Schema({
    username: String,
    message: String,

    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model("Msg", msgSchema);