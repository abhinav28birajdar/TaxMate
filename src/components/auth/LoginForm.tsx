"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/UnifiedAuthContext";

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || undefined;

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [needsVerificationEmail, setNeedsVerificationEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  const { signIn, resendEmailVerification } = useAuth();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    setFormError(null);
    setNeedsVerificationEmail(null);

    try {
      await signIn(values.email, values.password, redirectTo);
      router.refresh();
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : "Login failed";
      if (rawMessage.toLowerCase().includes("email not confirmed")) {
        setNeedsVerificationEmail(values.email);
        setFormError("Your email address is not verified yet. Check your inbox or resend the link below.");
      } else if (rawMessage.toLowerCase().includes("invalid login credentials")) {
        setFormError("Incorrect email or password. Please verify your credentials and try again.");
      } else {
        setFormError(rawMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!needsVerificationEmail) return;
    setResendingVerification(true);
    try {
      await resendEmailVerification(needsVerificationEmail);
    } catch {
      // Toast already handled by resendEmailVerification
    } finally {
      setResendingVerification(false);
    }
  }

  return (
    <div className="space-y-5">
      {formError && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="leading-relaxed">{formError}</p>
            {needsVerificationEmail && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={resendingVerification}
                onClick={handleResendVerification}
                className="h-7 px-3 text-[11px] border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
              >
                <RefreshCw className={`w-3 h-3 mr-1.5 ${resendingVerification ? "animate-spin" : ""}`} />
                {resendingVerification ? "Sending verification..." : "Resend verification email"}
              </Button>
            )}
          </div>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-xs font-semibold text-gray-300">Email Address</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="name@company.com"
                      {...field}
                      disabled={isLoading}
                      className="h-11 pl-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm focus:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs font-semibold text-gray-300">Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:underline underline-offset-4 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      {...field}
                      disabled={isLoading}
                      className="h-11 pl-10 pr-10 bg-black/50 border-white/15 text-white placeholder:text-gray-500 rounded-xl text-sm focus:border-emerald-500 focus-visible:ring-emerald-500/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs text-rose-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-[0_0_24px_rgba(16,185,129,0.3)] transition-all mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
