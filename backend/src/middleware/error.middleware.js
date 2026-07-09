export const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
};

export const errorHandler = (error, _req, res, _next) => {
    if (error.message === "Origin is not allowed by CORS") {
        return res.status(403).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(error.status || 500).json({
        success: false,
        message: error.status ? error.message : "An unexpected server error occurred"
    });
};
