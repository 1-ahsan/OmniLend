import express from "express";
import { vendorRoutes } from "./vendor/vendor.module.js";

const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running.",
  });
});

app.use("/api/vendors", vendorRoutes);

// Handle unknown routes.
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// Central error handler.
app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message:
      statusCode < 500
        ? error.message
        : "An unexpected server error occurred.",
  });
});

export default app;