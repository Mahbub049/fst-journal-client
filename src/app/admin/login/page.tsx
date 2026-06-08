"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { setAdminToken, setAdminUser } from "@/lib/auth";

type LoginStep = "credentials" | "otp";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleCredentialSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      setEmail(data.email || email);
      setPassword("");
      setOtp("");
      setStep("otp");
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

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const { data } = await api.post("/auth/verify-otp", {
        email,
        otp,
      });

      setAdminToken(data.token);
      setAdminUser(data.admin);

      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setStep("credentials");
    setOtp("");
    setPassword("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <main className="grid min-h-screen bg-[#F4F7FA] lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[#005A78] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="mb-8 flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white p-2">
              <Image
                src="/images/bup.png"
                alt="BUP Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                Journal of FST
              </p>
              <h1 className="text-2xl font-bold">Admin CMS</h1>
            </div>
          </div>

          <h2 className="max-w-xl text-4xl font-bold leading-tight">
            Manage journal website content, issues, articles, editors, images,
            and PDFs from one place.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-white/80">
            This admin panel will control all editable website sections except
            the fixed journal name and BUP logo.
          </p>
        </div>

        <p className="text-sm text-white/60">
          Bangladesh University of Professionals
        </p>
      </section>

      <section className="flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <div className="relative mx-auto mb-4 h-16 w-16 overflow-hidden rounded-full border border-slate-200 bg-white">
              <Image
                src="/images/bup.png"
                alt="BUP Logo"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <h1 className="text-3xl font-bold text-[#003B5C]">
              Admin Login
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {step === "credentials"
                ? "Enter your admin credentials to receive a login OTP."
                : "Enter the 6-digit OTP sent to the admin email."}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {successMessage}
            </div>
          )}

          {step === "credentials" ? (
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
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Enter admin email"
                  autoComplete="off"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Enter password"
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full cursor-pointer rounded-xl bg-[#005A78] text-sm font-bold text-white transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleOtpSubmit}
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-600 outline-none"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-center text-lg font-bold tracking-[0.4em] outline-none transition focus:border-[#005A78] focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="h-12 w-full cursor-pointer rounded-xl bg-[#005A78] text-sm font-bold text-white transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Verifying..." : "Verify OTP & Login"}
              </button>

              <button
                type="button"
                onClick={goBackToCredentials}
                className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Use different email or request new OTP
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
