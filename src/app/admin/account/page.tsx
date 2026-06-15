"use client";

import { FormEvent, useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminUser, setAdminUser, AdminUser } from "@/lib/auth";
import {
  changeMyAdminPassword,
  updateMyAdminProfile,
} from "@/services/adminAccessService";
import {
  CheckCircle2,
  KeyRound,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

export default function AdminAccountPage() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const storedAdmin = getAdminUser();

    if (storedAdmin) {
      setAdmin(storedAdmin);
      setName(storedAdmin.name || "");
      setEmail(storedAdmin.email || "");
    }
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileLoading(true);
    setProfileError("");
    setProfileMessage("");

    try {
      const updatedAdmin = await updateMyAdminProfile({ name, email });
      setAdminUser(updatedAdmin);
      setAdmin(updatedAdmin);
      setProfileMessage("Profile information updated successfully.");
    } catch (err: any) {
      setProfileError(
        err?.response?.data?.message || "Profile could not be updated."
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      setPasswordLoading(false);
      return;
    }

    try {
      const updatedAdmin = await changeMyAdminPassword({
        currentPassword,
        newPassword,
      });

      setAdminUser(updatedAdmin);
      setAdmin(updatedAdmin);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordMessage("Password changed successfully.");
    } catch (err: any) {
      setPasswordError(
        err?.response?.data?.message || "Password could not be changed."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#005A78] to-[#0C7A92] px-6 py-7 text-white lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              Admin Account
            </p>
            <h1 className="mt-2 text-3xl font-bold">Profile & Security</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
              Update your admin name, email address, and password from one safe
              place. Newly created admins can also change their temporary password
              here after login.
            </p>
          </div>

          {admin?.mustChangePassword && (
            <div className="border-b border-amber-200 bg-amber-50 px-6 py-4 text-sm font-semibold text-amber-800 lg:px-8">
              You are using a temporary password. Please change it before
              continuing regular admin work.
            </div>
          )}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <form
            onSubmit={handleProfileSubmit}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#005A78]">
                <UserRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Profile Information
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Change the display name and email used for admin login.
                </p>
              </div>
            </div>

            {profileMessage && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} />
                {profileMessage}
              </div>
            )}

            {profileError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {profileError}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Admin Name
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                    placeholder="Admin name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="mt-6 rounded-2xl bg-[#005A78] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#005A78]/15 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {profileLoading ? "Saving..." : "Save Profile"}
            </button>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <KeyRound size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Change Password
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use a new password with at least 6 characters.
                </p>
              </div>
            </div>

            {passwordMessage && (
              <div className="mb-5 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircle2 size={17} />
                {passwordMessage}
              </div>
            )}

            {passwordError && (
              <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {passwordError}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                  placeholder="Re-enter new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="mt-6 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Account Status
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Role: <span className="font-semibold text-slate-800">{admin?.role === "super_admin" ? "Super Admin" : "Admin"}</span>
                <br />
                Email: <span className="font-semibold text-slate-800">{admin?.email || "-"}</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
