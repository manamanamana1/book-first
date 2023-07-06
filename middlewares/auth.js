const admin = require("../firebase");
const User = require("../models/user");

exports.authCheck = async(req, res, next) => {
    console.log(req.headers.authtoken); // token
    try {
        const firebaseUser = await admin
            .auth()
            .verifyIdToken(req.headers.authtoken);
        // console.log("FIREBASE USER IN AUTHCHECK", firebaseUser);
        req.user = firebaseUser; // HERE YOU GET USER EMAIL
        console.log(req.user.email)

        next();
    } catch (err) {
        // console.log(err);
        res.status(401).json({
            err: "Invalid or expired token",
        });
    }
};