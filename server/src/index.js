import "dotenv/config";
import app from "./app.js";
import prisma from "./config/db.js";
import env from "./config/env.js";

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();