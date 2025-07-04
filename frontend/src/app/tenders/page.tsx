"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { apiFetch } from "../api";

interface Tender {
  id: number;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  company_id: number;
  created_at: string;
}

export default function TendersPage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyStatus, setApplyStatus] = useState<{ [key: number]: string }>({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", deadline: "", budget: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const token = useSelector((state: RootState) => state.userCompany.token);
  const user = useSelector((state: RootState) => state.userCompany.user);
  const company = useSelector((state: RootState) => state.userCompany.company);

  useEffect(() => {
    async function fetchTenders() {
      setLoading(true);
      setError("");
      try {
        const data = await apiFetch("/tenders");
        setTenders(data.tenders || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch tenders");
      } finally {
        setLoading(false);
      }
    }
    fetchTenders();
  }, []);

  async function handleApply(tenderId: number) {
    setApplyStatus(s => ({ ...s, [tenderId]: "loading" }));
    try {
      await apiFetch(`/applications/${tenderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApplyStatus(s => ({ ...s, [tenderId]: "applied" }));
    } catch (err: any) {
      setApplyStatus(s => ({ ...s, [tenderId]: err.message || "Failed to apply" }));
    }
  }

  function openModal() {
    setForm({ title: "", description: "", deadline: "", budget: "" });
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
  }

  async function handleCreateTender(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);
    try {
      const data = await apiFetch("/tenders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          deadline: form.deadline,
          budget: parseFloat(form.budget),
        }),
      });
      setTenders(tenders => [data, ...tenders]);
      setShowModal(false);
    } catch (err: any) {
      setFormError(err.message || "Failed to create tender");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Tenders</h1>
      {company && company.name && (
        <button
          className="mb-8 bg-black text-white px-6 py-2 rounded hover:bg-gray-900 transition font-semibold"
          onClick={openModal}
        >
          Create Tender
        </button>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">Create Tender</h2>
            <form onSubmit={handleCreateTender} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Title"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
                required
              />
              <input
                type="date"
                placeholder="Deadline"
                value={form.deadline}
                onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <input
                type="number"
                placeholder="Budget"
                value={form.budget}
                onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                min={0}
                step={0.01}
                required
              />
              {formError && <div className="text-red-600 text-sm text-center">{formError}</div>}
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                disabled={formLoading}
              >
                {formLoading ? "Creating..." : "Create Tender"}
              </button>
            </form>
          </div>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="w-full max-w-3xl space-y-6">
          {tenders.length === 0 && <div className="text-gray-400">No tenders found.</div>}
          {tenders.map(tender => (
            <div key={tender.id} className="bg-white text-black rounded-lg shadow p-6 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <div className="text-xl font-semibold">{tender.title}</div>
                <div className="text-sm text-gray-600">Deadline: {new Date(tender.deadline).toLocaleDateString()}</div>
              </div>
              <div className="text-gray-700 mb-2">{tender.description}</div>
              <div className="text-sm text-gray-600">Budget: ${tender.budget}</div>
              {user && user.id && (
                <div>
                  <button
                    className="mt-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition disabled:opacity-60"
                    onClick={() => handleApply(tender.id)}
                    disabled={applyStatus[tender.id] === "loading" || applyStatus[tender.id] === "applied"}
                  >
                    {applyStatus[tender.id] === "applied"
                      ? "Applied"
                      : applyStatus[tender.id] === "loading"
                      ? "Applying..."
                      : "Apply"}
                  </button>
                  {applyStatus[tender.id] && applyStatus[tender.id] !== "applied" && applyStatus[tender.id] !== "loading" && (
                    <div className="text-red-600 text-sm mt-1">{applyStatus[tender.id]}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 