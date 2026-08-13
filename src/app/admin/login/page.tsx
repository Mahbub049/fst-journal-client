"use client";

import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  clearLegacyAdminStorage,
  setAdminUser,
} from "@/lib/auth";

type LoginStep = "credentials" | "loginOtp" | "forgotEmail" | "resetPassword";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cleanMessages = () => {
    setError("");
    setSuccessMessage("");
  };

  const setNumericOtp = (value: string) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  };

  const handleCredentialSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    cleanMessages();

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      setEmail(data.email || email);
      setPassword("");
      setOtp("");
      setStep("loginOtp");
      setSuccessMessage(
        data.message || "OTP has been sent to the admin email."
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginOtpSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    cleanMessages();

    try {
      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      clearLegacyAdminStorage();
      setAdminUser(data.admin);

      router.push(data.admin?.mustChangePassword ? "/admin/account" : "/admin/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordResetOtp = async () => {
    setLoading(true);
    cleanMessages();

    try {
      const { data } = await api.post("/auth/forgot-password", {
        email,
      });

      setEmail(data.email || email);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("resetPassword");
      setSuccessMessage(
        data.message || "Password reset OTP has been sent to the admin email."
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Password reset OTP could not be sent. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    await sendPasswordResetOtp();
  };

  const handleResetPasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    cleanMessages();

    if (newPassword.length < 12) {
      setError("New password must be at least 12 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      setStep("credentials");
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMessage(
        data.message || "Password has been reset successfully. Please login."
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Password reset failed. Please check the OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    setStep("credentials");
    setPassword("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    cleanMessages();
  };

  const goToForgotPassword = () => {
    setStep("forgotEmail");
    setPassword("");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    cleanMessages();
  };

  const stepBadge =
    step === "credentials"
      ? "Login"
      : step === "loginOtp"
        ? "Verification"
        : "Password Recovery";

  const stepTitle =
    step === "credentials"
      ? "Welcome!"
      : step === "loginOtp"
        ? "Verify OTP"
        : step === "forgotEmail"
          ? "Forgot password"
          : "Reset password";

  const stepDescription =
    step === "credentials"
      ? "Enter your email and password. A login OTP will be sent for secure access."
      : step === "loginOtp"
        ? "Enter the 6-digit OTP sent to the admin email address."
        : step === "forgotEmail"
          ? "Enter your admin email. A password reset OTP will be sent to that address."
          : "Enter the reset OTP and choose a new password for your admin account.";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF6F8] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 10%, rgba(0, 90, 120, 0.22), transparent 32%), radial-gradient(circle at 88% 18%, rgba(17, 127, 116, 0.16), transparent 30%), radial-gradient(circle at 50% 100%, rgba(0, 90, 120, 0.10), transparent 35%), linear-gradient(135deg, #F8FBFC 0%, #EEF6F8 45%, #E7F3F6 100%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 90, 120, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 90, 120, 0.08) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 20%, black 75%, transparent)",
        }}
      />

      <div className="relative z-10 flex min-h-[calc(100vh-48px)] items-center justify-center">
        <section className="grid w-full max-w-5xl overflow-hidden rounded-[34px] border border-white/80 bg-white/85 shadow-[0_30px_90px_rgba(0,59,92,0.18)] backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="relative overflow-hidden bg-[#005A78] px-8 py-10 text-white sm:px-10 lg:px-12 lg:py-12">
            <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#0F7E72]/35" />
            <div className="absolute right-10 top-16 h-24 w-24 rounded-full border border-white/15" />

            <div className="relative flex h-full min-h-[350px] flex-col justify-between">
              <div>
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-[74px] w-[74px] items-center justify-center rounded-2xl bg-white shadow-lg shadow-slate-950/20">
                    <div className="relative h-14 w-14">
                      <Image
                        src="/images/bup.png"
                        alt="BUP Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
                      Journal of FST
                    </p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight">
                      Admin CMS
                    </h1>
                  </div>
                </div>

                <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                  Secure Admin Access
                </p>

                <h2 className="mt-6 max-w-sm text-4xl font-bold leading-tight tracking-tight">
                  Manage the journal website with clarity.
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">
                  Update issues, articles, editors, images, PDFs, and public page
                  content from one organized dashboard.
                </p>
              </div>

              <div className="relative mt-10 grid gap-3 text-sm text-white/80">
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                    01
                  </span>
                  Content, issue, and article management
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                    02
                  </span>
                  OTP protected login verification
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                    03
                  </span>
                  Password recovery with reset OTP
                </div>
              </div>
            </div>
          </aside>

          <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div className="w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md">
                    <div className="relative h-11 w-11">
                      <Image
                        src="/images/bup.png"
                        alt="BUP Logo"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#005A78]">
                      Journal of FST
                    </p>
                    <h1 className="text-xl font-bold text-[#003B5C]">
                      Admin CMS
                    </h1>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="mb-3 inline-flex rounded-full bg-[#E8F5F7] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#005A78]">
                  {stepBadge}
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#003B5C] sm:text-4xl">
                  {stepTitle}
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
                  {stepDescription}
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              )}

              {step === "credentials" && (
                <form
                  onSubmit={handleCredentialSubmit}
                  className="space-y-5"
                  autoComplete="off"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                      placeholder="Enter admin email"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-semibold text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={goToForgotPassword}
                        className="cursor-pointer text-xs font-bold text-[#005A78] transition hover:text-[#003B5C]"
                      >
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                        placeholder="Enter password"
                        autoComplete="new-password"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-[#005A78]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full cursor-pointer rounded-2xl bg-[#005A78] text-sm font-bold text-white shadow-lg shadow-[#005A78]/20 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </form>
              )}

              {step === "loginOtp" && (
                <form
                  onSubmit={handleLoginOtpSubmit}
                  className="space-y-5"
                  autoComplete="off"
                >
                  {/* <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-600 outline-none"
                      readOnly
                    />
                  </div> */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      OTP Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setNumericOtp(event.target.value)}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-center text-lg font-bold tracking-[0.4em] outline-none transition placeholder:text-slate-300 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="h-[52px] w-full cursor-pointer rounded-2xl bg-[#005A78] text-sm font-bold text-white shadow-lg shadow-[#005A78]/20 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify OTP & Login"}
                  </button>

                  <button
                    type="button"
                    onClick={goToLogin}
                    className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Back to login
                  </button>
                </form>
              )}

              {step === "forgotEmail" && (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-5"
                  autoComplete="off"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                      placeholder="Enter admin email"
                      autoComplete="off"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-[52px] w-full cursor-pointer rounded-2xl bg-[#005A78] text-sm font-bold text-white shadow-lg shadow-[#005A78]/20 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Sending Reset OTP..." : "Send Reset OTP"}
                  </button>

                  <button
                    type="button"
                    onClick={goToLogin}
                    className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Back to login
                  </button>
                </form>
              )}

              {step === "resetPassword" && (
                <form
                  onSubmit={handleResetPasswordSubmit}
                  className="space-y-5"
                  autoComplete="off"
                >
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 text-sm text-slate-600 outline-none"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reset OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(event) => setNumericOtp(event.target.value)}
                      className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 text-center text-lg font-bold tracking-[0.4em] outline-none transition placeholder:text-slate-300 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                      placeholder="000000"
                      autoComplete="one-time-code"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        minLength={12}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-[#005A78]"
                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-[52px] w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                        minLength={12}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-[#005A78]"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      otp.length !== 6 ||
                      newPassword.length < 12 ||
                      confirmPassword.length < 12
                    }
                    className="h-[52px] w-full cursor-pointer rounded-2xl bg-[#005A78] text-sm font-bold text-white shadow-lg shadow-[#005A78]/20 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "Resetting Password..." : "Reset Password"}
                  </button>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={sendPasswordResetOtp}
                      disabled={loading}
                      className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Resend OTP
                    </button>

                    <button
                      type="button"
                      onClick={goToLogin}
                      className="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                      Back to login
                    </button>
                  </div>
                </form>
              )}

              <p className="mt-8 text-center text-xs font-medium text-slate-400">
                Bangladesh University of Professionals
              </p>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
