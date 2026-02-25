import { createHash, randomBytes } from "node:crypto";
import { ApiError } from "@/lib/api";
import { hashPassword } from "@/lib/auth/crypto";
import { connectToDatabase } from "@/lib/mongodb";
import { sendPasswordResetEmail } from "@/lib/services/emailService";
import PasswordResetTokenModel from "@/models/PasswordResetToken";
import UserModel from "@/models/User";

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email: string) {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
  if (!user) {
    return { success: true };
  }

  const plainToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(plainToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await PasswordResetTokenModel.create({
    user: user._id,
    tokenHash,
    expiresAt
  });

  await sendPasswordResetEmail({
    to: user.email,
    token: plainToken,
    expiresAt
  });

  // MVP: on retourne le token pour faciliter les tests en local.
  return { success: true, token: plainToken, expiresAt };
}

export async function resetPasswordWithToken(token: string, nextPassword: string) {
  await connectToDatabase();

  const tokenHash = hashResetToken(token);

  const resetEntry = await PasswordResetTokenModel.findOne({ tokenHash, usedAt: { $exists: false } });
  if (!resetEntry) {
    throw new ApiError("Invalid reset token", 400);
  }

  if (resetEntry.expiresAt.getTime() <= Date.now()) {
    throw new ApiError("Reset token expired", 400);
  }

  const passwordHash = await hashPassword(nextPassword);

  await UserModel.findByIdAndUpdate(resetEntry.user, { passwordHash });
  resetEntry.usedAt = new Date();
  await resetEntry.save();

  return { success: true };
}
