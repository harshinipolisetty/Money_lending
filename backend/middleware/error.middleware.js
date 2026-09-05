const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    const statusCode = err.name === 'ValidationError' ? 400 : (err.statusCode || 500);
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error'
    });
};

module.exports = errorHandler;
