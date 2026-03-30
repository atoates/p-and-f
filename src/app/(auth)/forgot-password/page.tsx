"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulated delay -- email integration to be added
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Check your email
        </h2>
        <p className="text-gray-600 mb-6">
          If an account exists for <strong>{email}</strong>, you will receive
          password reset instructions shortly. Please check your inbox.
        </p>
        <p className="text-amber-600 text-sm mb-4 bg-amber-50 p-3 rounded-lg">
          Note: Email sending is not yet configured. Please contact your
          administrator to reset your password manually.
        </p>
        <p className="text-gray-600 text-sm mb-6">
          Didn&apos;t receive an email? Check your spam folder or{" "}
          <button
            onClick={() => setSubmitted(false)}
            className="text-primary-green font-medium hover:text-light-green"
          >
            try again
          </button>
        </p>
        <Link href="/login" className="text-primary-green font-medium hover:text-light-green">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Reset your password
      </h2>
      <p className="text-gray-600 mb-6">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email address"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-gray-600 text-sm mt-6">
        <Link href="/login" className="text-primary-green font-medium hover:text-light-green">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
