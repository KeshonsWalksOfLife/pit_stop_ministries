// Getting express module HTTP server running

// Loading environment variables First - before anything reads process.env
require("dotenv").config();

const express = require("express");
const path = require("path");
const morgan = require("morgan");
const errorHandler = require("./middleware/errorHandler");
const donationsRouter = require("./routes/donations");
const contactsRouter = require("./routes/contacts");

const app = express();
const port = process.env.PORT || 3000;

// Template engine = "ejs" - allows us to render dynamic HTML pages
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));

//  Static files (CSS, Images, JS) - served from the "public" directory)
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse JSON bodies in requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

// Donations routes for rendering the donations page
app.use("/donations", donationsRouter);

// Contacts routes for rendering the contact page
app.use("/contacts", contactsRouter);

app.get("/", (req, res) => {
    res.send("This is the Pit Stop Ministries API");
})

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})

console.log("Pit Stop Ministries API is running on port " + port); 