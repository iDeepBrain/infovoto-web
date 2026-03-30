/**
 * Admin entry point — redirects to Google login with /stats as callback.
 * Not linked from anywhere in the UI (hidden route).
 */

"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    signIn("google", { callbackUrl: "/stats" });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0f1a]">
      <span className="text-gray-400">Redirigiendo al login de administrador...</span>
    </div>
  );
}
