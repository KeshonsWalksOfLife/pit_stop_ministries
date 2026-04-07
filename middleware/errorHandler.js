//. Centralized error handler that catches errors thrown in routes
// Express recognizes this as an error handler because of its 4 parameters

function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
}

module.exports = errorHandler;