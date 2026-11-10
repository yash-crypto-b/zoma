const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "invalid JSON body",
    });
  }

  const status = err.status || err.statusCode || 500;

  if (status >= 500) {
    console.error(JSON.stringify({ event: "application_error", requestId: req.requestId, code: /^[A-Z0-9_]{1,20}$/.test(err.code || "") ? err.code : "INTERNAL" }));
  }

  return res.status(status).json({
    success: false,
    message:
      status === 413 ? "request too large" : status < 500 ? "request failed" : "Internal server error",
  });
};

export default errorHandler;
