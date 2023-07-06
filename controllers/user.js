const User = require("../models/user");
const Product = require("../models/product");
const Cart = require("../models/cart");

const uniqueid = require("uniqueid");
const Order = require("../models/order");

exports.userCart = async(req, res) => {
    const { cart } = req.body;

    let products = [];

    const user = await User.findOne({ email: req.user.email });

    // check if cart with logged in user id already exist
    let cartExistByThisUser = await Cart.findOne({ orderdBy: user._id });

    if (cartExistByThisUser) {
        await Cart.deleteOne(cartExistByThisUser)
        console.log("removed old cart");
    }

    for (let i = 0; i < cart.length; i++) {
        let object = {};

        object.product = cart[i]._id;
        object.count = cart[i].count;

        // get price for creating total
        let productFromDb = await Product.findById(cart[i]._id)
            .select("price")

        object.price = productFromDb.price;

        products.push(object);
    }

    // console.log('products', products)

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
        cartTotal = cartTotal + products[i].price * products[i].count;
    }

    // console.log("cartTotal", cartTotal);

    let newCart = await new Cart({
        products,
        cartTotal,
        orderdBy: user._id,
    }).save();

    console.log("new cart ----> ", newCart);
    res.json({ ok: true });

}

exports.getUserCart = async(req, res) => {

    try {
        const user = await User.findOne({ email: req.user.email });

        let cart = await Cart.findOne({ orderdBy: user._id })
            .populate("products.product", "_id title price ")

        const { products, cartTotal, totalAfterDiscount } = cart;

        res.json({ products, cartTotal, totalAfterDiscount, cart });
    } catch (error) {
        console.log(error);
    }
}


exports.emptyCart = async(req, res) => {
    console.log("empty cart");
    const user = await User.findOne({ email: req.user.email }).exec();

    const cart = await Cart.findOneAndRemove({ orderdBy: user._id }).exec();
    res.json(cart);
};


exports.saveAddress = async(req, res) => {
    const userAddress = await User.findOneAndUpdate({ email: req.user.email }, { address: req.body.address });

    res.json({ ok: true });
};

exports.createOrder = async(req, res) => {

    const { paymentIntent } = req.body.stripeResponse;

    const user = await User.findOne({ email: req.user.email }).exec();

    let { products } = await Cart.findOne({ orderdBy: user._id }).exec();

    let newOrder = await new Order({
        products,
        paymentIntent,
        orderdBy: user._id,
    }).save();

    let bulkOption = products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id }, // IMPORTANT item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

    console.log("NEW ORDER SAVED", newOrder);
    res.json({ ok: true });
}

exports.createCashOrder = async(req, res) => {
    const { COD } = req.body;
    // if COD is true, create order with status of Cash On Delivery

    if (!COD) return res.status(400).send("Create cash order failed");

    const user = await User.findOne({ email: req.user.email }).exec();

    let userCart = await Cart.findOne({ orderdBy: user._id }).exec();

    let finalAmount = 0;


    finalAmount = userCart.cartTotal * 100;


    let newOrder = await new Order({
        products: userCart.products,
        paymentIntent: {
            id: uniqueid(),
            amount: finalAmount,
            currency: "usd",
            status: "Cash On Delivery",
            created: Date.now(),
            payment_method_types: ["cash"],
        },
        orderdBy: user._id,
        orderStatus: "Cash On Delivery",
    }).save();

    // decrement quantity, increment sold
    let bulkOption = userCart.products.map((item) => {
        return {
            updateOne: {
                filter: { _id: item.product._id }, // IMPORTANT item.product
                update: { $inc: { quantity: -item.count, sold: +item.count } },
            },
        };
    });

    let updated = await Product.bulkWrite(bulkOption, {});
    console.log("PRODUCT QUANTITY-- AND SOLD++", updated);

    console.log("NEW ORDER SAVED", newOrder);
    res.json({ ok: true });
}
exports.orders = async(req, res) => {
    let user = await User.findOne({ email: req.user.email });

    let userOrders = await Order.find({ orderdBy: user._id })
        .sort({ createdAt: -1 })
        .populate("products.product")


    res.json(userOrders);
}