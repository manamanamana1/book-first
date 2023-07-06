const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        text: true,
    },
    email: {
        type: String,
        required: true,
        index: true,
    },
    role: {
        type: String,
        default: "subscriber",
    },
    cart: {
        type: Array,
        default: [],
    },
    address: String,

    images: {
        type: String,
    },
    // wishlist: [{ type: ObjectId, ref: "Product" }],
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);