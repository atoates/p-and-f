"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/enquiries",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    // This is a redirect error from Next.js -- rethrow it
    throw error;
  }
}
