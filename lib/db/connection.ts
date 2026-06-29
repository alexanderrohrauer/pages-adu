import "server-only";

import mongoose from "mongoose";

const cache = globalThis as unknown as {
  _mongoosePromise: Promise<typeof mongoose> | null;
};

export async function connectDB(): Promise<void> {
  if (mongoose.connection.readyState >= 1) return;

  if (!cache._mongoosePromise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI is not defined");
    cache._mongoosePromise = mongoose.connect(uri);
  }

  await cache._mongoosePromise;
}
