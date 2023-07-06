const express = require("express");
const router = express.Router();

// middlewares
const { authCheck, adminCheck } = require("../middlewares/auth");

// controllers
const { upload, remove } = require("../controllers/cloudinary");

router.post("/uploadimages", authCheck, upload);
router.post("/removeimage", authCheck, remove);

module.exports = router;