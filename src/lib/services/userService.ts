import { connectToDatabase } from "@/lib/mongodb";
import { ApiError } from "@/lib/api";
import { hashPassword, verifyPassword } from "@/lib/auth/crypto";
import UserModel from "@/models/User";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "client" | "admin";
};

function toPublicUser(user: { _id: { toString(): string }; name: string; email: string; role: "client" | "admin" }): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export async function createUser(params: {
  name: string;
  email: string;
  password: string;
  referredBy?: string;
}) {
  await connectToDatabase();

  const existing = await UserModel.findOne({ email: params.email.toLowerCase() }).lean();
  if (existing) {
    throw new ApiError("Email already in use", 409);
  }

  const passwordHash = await hashPassword(params.password);

  try {
    const user = await UserModel.create({
      name: params.name,
      email: params.email.toLowerCase(),
      passwordHash,
      role: "client",
      referredBy: params.referredBy
    });

    return toPublicUser(user);
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new ApiError("Email already in use", 409);
    }

    throw error;
  }
}

export async function authenticateUser(params: { email: string; password: string }) {
  await connectToDatabase();

  const user = await UserModel.findOne({ email: params.email.toLowerCase() });
  if (!user) {
    throw new ApiError("Invalid credentials", 401);
  }

  const isValidPassword = await verifyPassword(params.password, user.passwordHash);
  if (!isValidPassword) {
    throw new ApiError("Invalid credentials", 401);
  }

  return toPublicUser(user);
}

export async function getUserById(userId: string) {
  await connectToDatabase();

  const user = await UserModel.findById(userId).lean();
  if (!user) {
    return null;
  }

  return toPublicUser(user as { _id: { toString(): string }; name: string; email: string; role: "client" | "admin" });
}

export async function changeUserPassword(params: {
  userId: string;
  currentPassword: string;
  nextPassword: string;
}) {
  await connectToDatabase();

  const user = await UserModel.findById(params.userId);
  if (!user) {
    throw new ApiError("User not found", 404);
  }

  const isValid = await verifyPassword(params.currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError("Mot de passe actuel incorrect", 400);
  }

  user.passwordHash = await hashPassword(params.nextPassword);
  await user.save();

  return { success: true };
}
