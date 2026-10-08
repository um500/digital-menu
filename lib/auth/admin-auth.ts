import "server-only";

import { connectDB } from "@/lib/db/connect";
import { Admin } from "@/lib/db/models/Admin";
import { verifyPassword } from "./password";

export interface AdminLoginResult {
  adminId: string;
  restaurantId: string;
  email: string;
  name: string;
}

/** Returns the admin's identity on success, or null on bad credentials. Never reveals which part was wrong. */
export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult | null> {
  await connectDB();

  const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!admin) return null;

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return null;

  return {
    adminId: admin.id,
    restaurantId: admin.restaurantId,
    email: admin.email,
    name: admin.name,
  };
}
