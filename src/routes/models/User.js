import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "developer"],
      default: "developer",
      lowercase: true,
    },
    avatar: {
      type: String,
      default:
        "https://img.freepik.com/vector-premium/gary-avatar-genero-ilustracion-vectorial_276184-164.jpg",
    },
    refreshToken: {
      type: String,
      default: null,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    passwordResetCode: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    _id: false,
  }
);

export const User = mongoose.model("User", userSchema);
