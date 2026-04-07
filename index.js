// Getting express module HTTP server running

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Template engine
app.set("view engine", app)

app.get("/", (req, res) => {
    res.send("This is the Pit Stop Ministries API");
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})