"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { getAdminUser } from "@/lib/auth";
import {
  AdminAccount,
  AdminRole,
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  updateAdminAccount,
} from "@/services/adminAccessService";
import {
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserPlus,
  UserRound,
  UsersRound,
} from "lucide-react";
import { confirmAdminAction, promptAdminText } from "@/lib/adminDialogs";

type AdminForm = {
  name: string;
  email: string;
  temporaryPassword: string;
  role: AdminRole;
  isActive: boolean;
};

const emptyForm: AdminForm = {
  name: "",
  email: "",
  temporaryPassword: "",
  role: "admin",
  isActive: true,
};

export default function AdminAccessPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const currentAdmin = getAdminUser();

  const isSuperAdmin = currentAdmin?.role === "super_admin";

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getAdminAccounts();
      setAdmins(result);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Admin accounts could not be loaded. Make sure you are logged in as a super admin."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const stats = useMemo(() => {
    const total = admins.length;
    const active = admins.filter((admin) => admin.isActive).length;
    const superAdmins = admins.filter(
      (admin) => admin.role === "super_admin"
    ).length;
    const tempPassword = admins.filter(
      (admin) => admin.mustChangePassword
    ).length;

    return { total, active, superAdmins, tempPassword };
  }, [admins]);

  const updateForm = <K extends keyof AdminForm>(key: K, value: AdminForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createAdminAccount(form);
      setForm(emptyForm);
      setSuccess(
        "Admin access created. Share the temporary password securely and ask the admin to change it after login."
      );
      await loadAdmins();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Admin access could not be created."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleAdminStatus = async (admin: AdminAccount) => {
    setError("");
    setSuccess("");

    try {
      await updateAdminAccount(admin.id || admin._id || "", {
        isActive: !admin.isActive,
      });
      setSuccess(
        admin.isActive
          ? "Admin account has been deactivated."
          : "Admin account has been activated."
      );
      await loadAdmins();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Status could not be updated.");
    }
  };

  const changeRole = async (admin: AdminAccount, role: AdminRole) => {
    setError("");
    setSuccess("");

    try {
      await updateAdminAccount(admin.id || admin._id || "", { role });
      setSuccess("Admin role updated successfully.");
      await loadAdmins();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Role could not be updated.");
    }
  };

  const resetTemporaryPassword = async (admin: AdminAccount) => {
    const temporaryPassword = await promptAdminText({
      title: "Set temporary password",
      text: `Create a temporary password for ${admin.email}.`,
      placeholder: "Minimum 6 characters",
      confirmButtonText: "Set password",
      inputType: "password",
      minLength: 6,
      minLengthMessage: "Temporary password must be at least 6 characters long.",
    });

    if (!temporaryPassword) return;

    setError("");
    setSuccess("");

    try {
      await updateAdminAccount(admin.id || admin._id || "", {
        temporaryPassword,
      });
      setSuccess(
        "Temporary password updated. Share it securely and ask the admin to change it after login."
      );
      await loadAdmins();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Temporary password could not be set."
      );
    }
  };

  const removeAdmin = async (admin: AdminAccount) => {
    const confirmed = await confirmAdminAction({
      title: "Remove admin access?",
      text: `${admin.email} will no longer be able to access the dashboard.`,
      confirmButtonText: "Remove access",
      destructive: true,
    });

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await deleteAdminAccount(admin.id || admin._id || "");
      setSuccess("Admin access removed successfully.");
      await loadAdmins();
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Admin account could not be removed."
      );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#005A78] via-[#086D83] to-[#0F7E72] px-6 py-7 text-white lg:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
              Admin Security
            </p>
            <h1 className="mt-2 text-3xl font-bold">Admin Access Control</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-white/80">
              Give dashboard access to approved email addresses, set a temporary
              password, and control each admin account status. New admins should
              change their temporary password from Profile & Security after login.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4 lg:p-6">
            {[
              ["Total Admins", stats.total, UsersRound],
              ["Active Accounts", stats.active, CheckCircle2],
              ["Super Admins", stats.superAdmins, ShieldCheck],
              ["Temporary Password", stats.tempPassword, KeyRound],
            ].map(([label, value, Icon]) => {
              const StatIcon = Icon as typeof UsersRound;

              return (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {String(label)}
                    </p>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 text-[#005A78]">
                      <StatIcon size={18} />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-black text-slate-950">
                    {String(value)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {success && (
          <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        )}

        {!isSuperAdmin && !loading && (
          <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-800">
            Only a super admin can manage admin access. You can still update your
            own name and password from the Admin dropdown at the top right.
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <form
            onSubmit={handleCreateAdmin}
            className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7"
          >
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-[#005A78]">
                <UserPlus size={23} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Add New Admin
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Add a permitted email and temporary password.
                </p>
              </div>
            </div>

            <fieldset disabled={!isSuperAdmin || saving} className="space-y-5 disabled:opacity-60">
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
                    value={form.name}
                    onChange={(event) => updateForm("name", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                    placeholder="For example, Assistant Editor"
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
                    value={form.email}
                    onChange={(event) => updateForm("email", event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Temporary Password
                </label>
                <div className="relative">
                  <KeyRound
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={form.temporaryPassword}
                    onChange={(event) =>
                      updateForm("temporaryPassword", event.target.value)
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(event) =>
                      updateForm("role", event.target.value as AdminRole)
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                  >
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.isActive ? "active" : "inactive"}
                    onChange={(event) =>
                      updateForm("isActive", event.target.value === "active")
                    }
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold outline-none transition focus:border-[#005A78] focus:bg-white focus:ring-4 focus:ring-[#005A78]/10"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#005A78] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#005A78]/15 transition hover:bg-[#00465d] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving || !isSuperAdmin}
              >
                {saving ? "Creating..." : "Create Admin Access"}
              </button>
            </fieldset>

            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500">
              The temporary password is not emailed automatically. Share it only
              through a secure channel. The new admin can change it from Profile &
              Security after login.
            </p>
          </form>

          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Existing Admin Accounts
                </h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Manage email access, role, status, and temporary password resets.
                </p>
              </div>

              <button
                onClick={loadAdmins}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <RefreshCw size={16} />
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                Loading admin accounts...
              </div>
            ) : admins.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                No admin account found.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="min-w-[860px] w-full divide-y divide-slate-200 text-left text-sm">
                    <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                      <tr>
                        <th className="px-4 py-4">Admin</th>
                        <th className="px-4 py-4">Role</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 py-4">Password</th>
                        <th className="px-4 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {admins.map((admin) => {
                        const adminId = admin.id || admin._id || "";
                        const isSelf = adminId === currentAdmin?.id;

                        return (
                          <tr key={adminId} className="align-top">
                            <td className="px-4 py-4">
                              <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#005A78]/10 text-sm font-black text-[#005A78]">
                                  {admin.name.charAt(0).toUpperCase()}
                                </span>
                                <div>
                                  <p className="font-bold text-slate-950">
                                    {admin.name} {isSelf && <span className="text-xs text-[#005A78]">(You)</span>}
                                  </p>
                                  <p className="mt-1 text-slate-500">{admin.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <select
                                value={admin.role}
                                onChange={(event) =>
                                  changeRole(admin, event.target.value as AdminRole)
                                }
                                disabled={!isSuperAdmin}
                                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none disabled:opacity-60"
                              >
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                              </select>
                            </td>
                            <td className="px-4 py-4">
                              <button
                                onClick={() => toggleAdminStatus(admin)}
                                disabled={!isSuperAdmin || isSelf}
                                className={[
                                  "rounded-full px-3 py-1.5 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
                                  admin.isActive
                                    ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                ].join(" ")}
                              >
                                {admin.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={[
                                  "rounded-full px-3 py-1.5 text-xs font-bold",
                                  admin.mustChangePassword
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-600",
                                ].join(" ")}
                              >
                                {admin.mustChangePassword
                                  ? "Temporary"
                                  : "Changed"}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => resetTemporaryPassword(admin)}
                                  disabled={!isSuperAdmin}
                                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <KeyRound size={14} />
                                  Set Temp
                                </button>
                                <button
                                  onClick={() => removeAdmin(admin)}
                                  disabled={!isSuperAdmin || isSelf}
                                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 size={14} />
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
