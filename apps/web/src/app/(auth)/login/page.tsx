import GoogleLoginButton from "@/components/GoogleLoginButton";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="card max-w-md w-full p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand/10">
          <LogIn className="h-6 w-6 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold">Sign in to Stock Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Google only — secure and fast.
        </p>
        <div className="mt-6">
          <GoogleLoginButton />
        </div>
      </div>
    </main>
  );
}
