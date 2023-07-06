const User = require("../models/user");

exports.createOrUpdateUser = async(req, res) => {
    const { name, picture, email } = req.user;

    const user = await User.findOne({ email });
    if (user) {

        res.json(user);
    } else {
        const newUser = await new User({
            email,
            name: name ? name : email.split("@")[0],
            picture,
        }).save();
        console.log("USER CREATED", newUser);
        res.json(newUser);
    }
};

exports.currentUser = async(req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email })

        if (user) {
            res.status(200).json(user);
        }
    } catch (error) {
        console.log(error)
        res.status(401).json(error)
    }
};