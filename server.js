const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const { readdirSync } = require("fs");
const path = require("path");
require("dotenv").config();

// app
const app = express();

// db
const connectDB = async() => {
    try {
        mongoose.set('strictQuery', false)
        mongoose.connect(process.env.DATABASE)
        console.log('Mongo connected')
    } catch (error) {
        console.log(error)
        process.exit()
    }
}

connectDB()
    // middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(cors());
app.use(express.static(path.join(__dirname, './build')))

// routes middleware
readdirSync("./routes").map((r) => app.use("/api", require("./routes/" + r)));

app.use("*", function(req, res) {
        res.sendFile(path.join(__dirname, './build'))
    })
    // port
const port = process.env.PORT || 8000;

app.listen(port, () => console.log(`Server is running on port ${port}`));