let isHealthy = true;

export const breakApp = () => {
  isHealthy = false;
};

export const healthMiddleware = (_, res, next) => {
  if (!isHealthy) {
    return res.status(500).json({ status: "unhealthy" });
  }

  next();
};
