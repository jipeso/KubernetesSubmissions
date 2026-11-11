export const errorHandler = (err, req, res, next) => {
  console.error(`${req.method} ${req.originalUrl} failed:`, err.message);

  if (res.headersSent) return next(err);

  res.status(502).json({ error: "backend unavailable" });
};
