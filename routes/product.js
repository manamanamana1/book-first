const express = require("express");

const router = express.Router();

const { authCheck } = require("../middlewares/auth");

const {
    create,
    listAll,
    remove,
    read,
    update,
    searchFilters,
    find,
    productStar
} = require("../controllers/product");

router.post("/product", authCheck, create);
router.get("/product/find", authCheck, find);
router.get("/products/:count", listAll);
router.delete("/product/:id", authCheck, remove);
router.put("/product/:id", authCheck, update);
router.get("/product/:id", read);
router.post("/search/filters", searchFilters);
router.put("/product/star/:productId", authCheck, productStar);

module.exports = router;