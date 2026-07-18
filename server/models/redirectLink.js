const mongoose = require("mongoose")

const linkSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    redirectTo: {
        type: String,
        default: ""
    },
    visited: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("Link", linkSchema)