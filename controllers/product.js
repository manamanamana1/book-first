const Product = require("../models/product");
const User = require("../models/user");


exports.create = async(req, res) => {
    try {
        console.log(req.body);

        const newProduct = await new Product(req.body).save();
        res.json(newProduct);
    } catch (err) {
        console.log(err);
        // res.status(400).send("Create product failed");
        res.status(400).json({
            err: err.message,
        });
    }
};
exports.find = async(req, res) => {
    try {
        const { email } = req.user;

        // Find the user based on the email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find products based on the seller's _id
        const products = await Product.find({ seller: user._id });

        res.json(products);
    } catch (err) {
        console.log(err);
        res.status(400).json({ error: 'Failed to find user products' });
    }
};
exports.listAll = async(req, res) => {


    let products = await Product.find()
        .limit(parseInt(req.params.count))

    .sort([
        ["createdAt", "desc"]
    ])

    res.json(products);
};
exports.remove = async(req, res) => {
    try {
        const deleted = await Product.findByIdAndRemove(req.params.id).exec();
        res.json(deleted);
    } catch (err) {
        console.log(err);
        return res.status(400).send("Product delete failed");
    }
};
exports.update = async(req, res) => {
    try {

        const updated = await Product.findOneAndUpdate({ _id: req.params.id },
            req.body, { new: true }
        )
        res.json(updated);
    } catch (err) {
        console.log("PRODUCT UPDATE ERROR ----> ", err);
        // return res.status(400).send("Product update failed");
        res.status(400).json({
            err: err.message,
        });
    }
};

exports.read = async(req, res) => {
    const product = await Product.findById(req.params.id)

    .populate("seller")

    res.json({ success: true, data: product });
};

const handleQuery = async(req, res, query) => {
    const products = await Product.find({ $text: { $search: query } })




    res.json(products);
};

const handlePrice = async(req, res, price) => {
    try {
        let products = await Product.find({
            price: {
                $gte: price[0],
                $lte: price[1],
            },
        })




        res.json(products);
    } catch (err) {
        console.log(err);
    }
};

const handleStar = async(req, res, stars) => {
    try {
        const aggregates = await Product.aggregate([{
                    $project: {
                        document: "$$ROOT",
                        // title: "$title",
                        floorAverage: {
                            $floor: { $avg: "$ratings.star" }, // floor value of 3.33 will be 3
                        },
                    },
                },
                { $match: { floorAverage: stars } },
            ])
            .limit(12)

        const products = await Product.find({ _id: aggregates })

        res.json(products);
    } catch (error) {
        console.log(err);
    }

};


exports.searchFilters = async(req, res) => {
    const {
        query,
        price,

        stars,

    } = req.body;

    if (query) {
        console.log("query --->", query);
        await handleQuery(req, res, query);
    }

    // price [20, 200]
    if (price !== undefined) {
        console.log("price ---> ", price);
        await handlePrice(req, res, price);
    }



    if (stars) {
        console.log("stars ---> ", stars);
        await handleStar(req, res, stars);
    }

};

exports.productStar = async(req, res) => {
    const product = await Product.findById(req.params.productId);
    const user = await User.findOne({ email: req.user.email });
    const { star } = req.body;

    // who is updating?
    // check if currently logged in user have already added rating to this product?
    let existingRatingObject = product.ratings.find(
        (ele) => ele.postedBy.toString() === user._id.toString()
    );

    // if user haven't left rating yet, push it
    if (existingRatingObject === undefined) {
        let ratingAdded = await Product.findByIdAndUpdate(
            product._id, {
                $push: { ratings: { star, postedBy: user._id } },
            }, { new: true }
        );
        console.log("ratingAdded", ratingAdded);
        res.json(ratingAdded);
    } else {
        // if user have already left rating, update it
        const ratingUpdated = await Product.updateOne({
            ratings: { $elemMatch: existingRatingObject },
        }, { $set: { "ratings.$.star": star } }, { new: true }).exec();
        console.log("ratingUpdated", ratingUpdated);
        res.json(ratingUpdated);
    }
};