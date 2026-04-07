// Getting express module HTTP server running

// Loading environment variables First - before anything reads process.env
require("dotenv").config();

const express = require("express");
const path = require("path");


const app = express();
const port = process.env.PORT || 3000;

// Template engine
app.set("view engine", app)

// Parse JSON bodies ( Needed for POST requests)
app.use(express.json());


app.get("/", (req, res) => {
    res.send("This is the Pit Stop Ministries API");
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})