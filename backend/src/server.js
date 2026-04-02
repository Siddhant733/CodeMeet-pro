import express from "express";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";

import { ENV } from "./lib/env.js";
import { connectDB } from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";

import chatRoutes from "./routes/chatRoutes.js";
import sessionRoute from "./routes/sessionRoute.js";

const app = express();

// middleware
app.use(express.json());

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-to-server, health checks, etc.)
      if (!origin) {
        return callback(null, true);
      }

      const allowedOrigins = [ENV.CLIENT_URL].filter(Boolean);

      const isExactAllowedOrigin = allowedOrigins.includes(origin);

      const isVercelPreview =
        origin.endsWith(".vercel.app") &&
        origin.startsWith("https://");

      if (isExactAllowedOrigin || isVercelPreview) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(clerkMiddleware());

// routes
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);
app.use("/api/sessions", sessionRoute);

// health check
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});

// optional root route
app.get("/", (req, res) => {
  res.status(200).json({
    msg: "CodeMeet Pro backend is running",
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(ENV.PORT, () => {
      console.log("Server is running on port:", ENV.PORT);
    });
  } catch (error) {
    console.error("💥 Error starting the server", error);
  }
};

startServer();