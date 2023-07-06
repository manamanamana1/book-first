const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        text: true,
    },
    author: {
        type: String,
        required: true
    },
    ISBN: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    shipping: {
        type: String,
        enum: ["Yes", "No"],
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    ratings: [{
        star: Number,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    }, ],

    quantity: Number,
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array,
    },
});

module.exports = mongoose.model('Product', productSchema);