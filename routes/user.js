const express = require("express");

const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");
// controllers
const {
    userCart,
    getUserCart,
    emptyCart,
    saveAddress,
    createOrder,
    createCashOrder,
    orders
} = require("../controllers/user");

router.post("/user/cart", authCheck, userCart); // save cart
router.get("/user/cart", authCheck, getUserCart);
router.delete("/user/cart", authCheck, emptyCart);

router.post("/user/address", authCheck, saveAddress);

router.post("/user/order", authCheck, createOrder);
router.post("/user/cash-order", authCheck, createCashOrder); // cod
router.get("/user/orders", authCheck, orders);
module.exports = router;