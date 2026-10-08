import "server-only";

import { connectDB } from "@/lib/db/connect";
import { verifyPassword } from "@/lib/auth/password";
import { Staff } from "@/lib/db/models/Staff";

/**
 * PINs aren't unique or indexed (several staff could pick the same 4
 * digits), so this checks the hash of every active staff member for the
 * restaurant — fine at the scale of one cafe's shift roster. Returns the
 * first match's identity, or null if no active staff member has this PIN.
 */
export async function verifyStaffPin(
  restaurantId: string,
  pin: string
): Promise<{ staffId: string; name: string; role: string } | null> {
  await connectDB();

  const activeStaff = await Staff.find({ restaurantId, isActive: true });
  for (const staff of activeStaff) {
    if (await verifyPassword(pin, staff.pinHash)) {
      return { staffId: staff._id.toString(), name: staff.name, role: staff.role };
    }
  }
  return null;
}
