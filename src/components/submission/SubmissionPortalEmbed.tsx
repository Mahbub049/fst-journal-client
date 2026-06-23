"use client";

import { FormEvent, useMemo, useState } from "react";

type FormMode = "login" | "register" | "forgot";

type ModeInfo = {
  label: string;
  title: string;
  helper: string;
};

const cleanBaseUrl = (url: string) => url.replace(/\/+$/, "");

const getOjsBaseUrl = () =>
  cleanBaseUrl(
    process.env.NEXT_PUBLIC_OJS_BASE_URL ||
      "https://testjournal.bup.edu.bd/index.php/jfst",
  );

const modes: Record<FormMode, ModeInfo> = {
  login: {
    label: "Login",
    title: "Author Login",
    helper: "Enter your OJS author account details to continue to manuscript submission.",
  },
  register: {
    label: "Register",
    title: "Author Registration",
    helper: "Create an author account before submitting a manuscript.",
  },
  forgot: {
    label: "Forgot Password",
    title: "Password Recovery",
    helper: "Request a password reset without leaving the Journal of FST website.",
  },
};

const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100";

const labelClass = "mb-1.5 block text-[13px] font-bold text-[#07122d]";

export default function SubmissionPortalEmbed() {
  const [mode, setMode] = useState<FormMode>("login");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStatus, setForgotStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [forgotMessage, setForgotMessage] = useState("");

  const ojs = useMemo(() => {
    const baseUrl = getOjsBaseUrl();

    return {
      baseUrl,
      loginAction: `${baseUrl}/login/signIn`,
      registerAction: `${baseUrl}/user/register`,
      submissionsUrl: `${baseUrl}/submissions`,
      submissionSource: `${baseUrl}/submissions`,
    };
  }, []);

  const currentMode = modes[mode];

  const handleForgotPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setForgotStatus("loading");
    setForgotMessage("");

    try {
      const response = await fetch("/api/ojs-portal/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message || "Password recovery request failed.");
      }

      setForgotStatus("success");
      setForgotMessage(
        result.message ||
          "If this email is registered, OJS will send password recovery instructions shortly.",
      );
    } catch (error) {
      setForgotStatus("error");
      setForgotMessage(
        error instanceof Error
          ? error.message
          : "Password recovery request failed. Please try again later.",
      );
    }
  };

  return (
    <section className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fbff_60%,#eefcff_100%)] px-5 py-5 md:px-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.26em] text-[#087895]">
                Journal of FST
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold text-[#07122d] md:text-3xl">
                Submit Manuscript
              </h1>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <div className="grid grid-cols-3 gap-1">
                {(Object.keys(modes) as FormMode[]).map((key) => {
                  const isActive = mode === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setMode(key);
                        setForgotStatus("idle");
                        setForgotMessage("");
                      }}
                      className={`h-10 cursor-pointer rounded-xl px-3 text-xs font-extrabold transition-all duration-300 sm:min-w-28 sm:text-sm ${
                        isActive
                          ? "bg-[#111433] text-white shadow-[0_10px_22px_rgba(17,20,51,0.16)]"
                          : "text-slate-600 hover:bg-slate-50 hover:text-[#087895]"
                      }`}
                    >
                      {modes[key].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-5 md:px-7 md:py-7">
          <div className="mb-5 border-b border-slate-100 pb-4">
            <h2 className="font-serif text-2xl font-bold text-[#07122d] md:text-3xl">
              {currentMode.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {currentMode.helper}
            </p>
          </div>

          {mode === "login" && (
            <form method="post" action={ojs.loginAction} className="space-y-4">
              <input type="hidden" name="source" value={ojs.submissionSource} />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="username" className={labelClass}>
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <label htmlFor="password" className="block text-[13px] font-bold text-[#07122d]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="cursor-pointer text-xs font-bold text-[#087895] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  name="remember"
                  value="1"
                  className="h-4 w-4 rounded border-slate-300 accent-[#111433]"
                />
                Keep me logged in
              </label>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#111433] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#087895]"
                >
                  Login and continue
                </button>
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#111433] transition hover:border-[#087895] hover:text-[#087895]"
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {mode === "register" && (
            <form method="post" action={ojs.registerAction} className="space-y-4">
              <input type="hidden" name="source" value={ojs.submissionSource} />
              <input type="hidden" name="locale" value="en_US" />
              <input type="hidden" name="registerAsAuthor" value="1" />
              <input type="hidden" name="repeatPassword" value={repeatPassword} />
              <input type="hidden" name="country" value="BD" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="givenName" className={labelClass}>
                    First name
                  </label>
                  <input
                    id="givenName"
                    name="givenName[en_US]"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="familyName" className={labelClass}>
                    Last name
                  </label>
                  <input
                    id="familyName"
                    name="familyName[en_US]"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="regUsername" className={labelClass}>
                    Username
                  </label>
                  <input
                    id="regUsername"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="regPassword" className={labelClass}>
                    Password
                  </label>
                  <input
                    id="regPassword"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="password2" className={labelClass}>
                    Confirm password
                  </label>
                  <input
                    id="password2"
                    name="password2"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={repeatPassword}
                    onChange={(event) => setRepeatPassword(event.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="affiliation" className={labelClass}>
                  Affiliation
                </label>
                <input
                  id="affiliation"
                  name="affiliation[en_US]"
                  type="text"
                  autoComplete="organization"
                  className={inputClass}
                />
              </div>

              <label className="flex cursor-pointer items-start gap-2 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  value="1"
                  required
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#111433]"
                />
                I agree to have my data collected and stored according to the journal privacy statement.
              </label>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#111433] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#087895]"
                >
                  Register and continue
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#111433] transition hover:border-[#087895] hover:text-[#087895]"
                >
                  Already have account
                </button>
              </div>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label htmlFor="forgotEmail" className={labelClass}>
                  Registered email address
                </label>
                <input
                  id="forgotEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={forgotEmail}
                  onChange={(event) => setForgotEmail(event.target.value)}
                  className={inputClass}
                />
              </div>

              {forgotMessage && (
                <div
                  className={`rounded-2xl border p-4 text-sm leading-6 ${
                    forgotStatus === "success"
                      ? "border-cyan-100 bg-cyan-50/70 text-slate-700"
                      : "border-rose-100 bg-rose-50 text-rose-700"
                  }`}
                >
                  {forgotMessage}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
                <button
                  type="submit"
                  disabled={forgotStatus === "loading"}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full bg-[#111433] px-7 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#087895] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {forgotStatus === "loading" ? "Sending..." : "Send reset instruction"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="inline-flex h-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#111433] transition hover:border-[#087895] hover:text-[#087895]"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
