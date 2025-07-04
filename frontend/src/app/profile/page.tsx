"use client";
import Link from "next/link";
import { useState } from "react";
import { apiFetch } from "../api";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { setCompany } from "../../store/userCompanySlice";

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.userCompany.user);
  const company = useSelector((state: RootState) => state.userCompany.company);
  const token = useSelector((state: RootState) => state.userCompany.token);
  const dispatch = useDispatch<AppDispatch>();
  const isLoggedIn = !!user && !!user.id;
  const hasCompany = !!company && !!company.name;

  // Register company form state
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegisterCompany(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiFetch("/companies", {
        method: "POST",
        body: JSON.stringify({ name, industry, description, logo_url: logoUrl }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      dispatch(setCompany(data));
    } catch (err: any) {
      setError(err.message || "Failed to register company");
    } finally {
      setLoading(false);
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-white text-black rounded-lg shadow p-8 w-full max-w-md text-center">
          <p className="mb-4">You are not logged in.</p>
          <Link href="/login" className="text-blue-600 hover:underline font-medium">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white text-black rounded-lg shadow p-8 w-full max-w-md">
        <div className="mb-4">
          <div className="font-semibold">Email:</div>
          <div>{user.email}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold">Company:</div>
          {hasCompany ? (
            <div>
              <div>{company.name}</div>
              <div className="text-sm text-gray-600">{company.industry}</div>
              {company?.description && <div className="text-sm mt-2">{company?.description}</div>}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-gray-500 mb-2">No company profile found.</div>
              <form onSubmit={handleRegisterCompany} className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <input
                  type="text"
                  placeholder="Industry"
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                  rows={2}
                />
                <input
                  type="url"
                  placeholder="Logo URL (optional)"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                />
                {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                <button
                  type="submit"
                  className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register Company"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 