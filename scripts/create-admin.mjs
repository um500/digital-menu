#!/usr/bin/env node
/**
 * One-off script to create the first Admin login for a restaurant.
 *
 * The app deliberately has no public "sign up as admin" page — the only
 * way in is an Admin document already sitting in Mongo (see README →
 * "Create an admin login"). This script creates that first document so
 * you can actually sign in at /admin/login. Safe to re-run for a second
 * admin later; it'll just refuse if the email already exists.
 *
 * Usage (from the project root, wherever .env.local with a real
 * MONGODB_URI lives):
 *
 *   node scripts/create-admin.mjs
 *
 * This only works somewhere that can actually reach your MongoDB Atlas
 * cluster — your own machine, not a network-restricted sandbox.
 */
import { createInterface } from "node:readline/promises";
import { readFileSync, existsSync } from "node:fs";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

function loadEnvLocal() {
  if (!existsSync(".env.local")) return;
  const lines = readFileSync(".env.local", "utf8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2];
    }
  }
}

loadEnvLocal();

const MONGODB_URI = process.env.MONGODB_URI;
const RESTAURANT_ID = process.env.NEXT_PUBLIC_DEMO_RESTAURANT_ID || "demo-restaurant";

if (!MONGODB_URI) {
  console.error(
    "MONGODB_URI not found. Run this from the project root, next to a .env.local that has it set."
  );
  process.exit(1);
}

const AdminSchema = new mongoose.Schema(
  {
    restaurantId: { type: String, required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);
const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

const rl = createInterface({ input: process.stdin, output: process.stdout });

async function main() {
  console.log(`Creating an admin login for restaurantId: ${RESTAURANT_ID}\n`);
  const name = (await rl.question("Your name: ")).trim();
  const email = (await rl.question("Email: ")).trim().toLowerCase();
  const password = await rl.question("Password (min 8 characters): ");
  rl.close();

  if (!name || !email) {
    console.error("Name and email are required.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  console.log("\nConnecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.error(`An admin with email ${email} already exists — nothing created.`);
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await Admin.create({ restaurantId: RESTAURANT_ID, email, passwordHash, name });

  console.log(`\nDone. Admin login created for ${email}.`);
  console.log("Sign in at /admin/login with this email and password.");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
