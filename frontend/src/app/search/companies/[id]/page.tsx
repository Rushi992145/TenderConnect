"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { apiFetch } from "../../../api";
import Link from "next/link";

interface Company {
  id: number;
  name: string;
  industry: string;
  description: string;
  logo_url?: string;
  created_at: string;
  services: Array<{
    id: number;
    name: string;
    description?: string;
  }>;
  tenders: Array<{
    id: number;
    title: string;
    description: string;
    deadline: string;
    budget: number;
    created_at: string;
  }>;
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.id as string;
  
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  async function fetchCompanyDetails() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`/search/companies/${companyId}`);
      setCompany(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch company details");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="text-center">Loading company details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="bg-white text-black rounded-lg shadow p-8 w-full max-w-md text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Link href="/search" className="text-blue-600 hover:underline font-medium">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
        <div className="bg-white text-black rounded-lg shadow p-8 w-full max-w-md text-center">
          <div className="text-gray-500 mb-4">Company not found</div>
          <Link href="/search" className="text-blue-600 hover:underline font-medium">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{company.name}</h1>
          <Link
            href="/search"
            className="text-blue-600 hover:underline font-medium"
          >
            ← Back to Search
          </Link>
        </div>

        {/* Company Information */}
        <div className="bg-white text-black rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Company Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Industry:</span>
                  <span className="ml-2 text-gray-600">{company.industry}</span>
                </div>
                <div>
                  <span className="font-medium">Founded:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>
                {company.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-gray-600">{company.description}</p>
                  </div>
                )}
              </div>
            </div>
            
            {company.logo_url && (
              <div className="flex justify-center">
                <img
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  className="max-w-32 max-h-32 object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {/* Services/Products */}
        {company.services && company.services.length > 0 && (
          <div className="bg-white text-black rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Services & Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.services.map(service => (
                <div key={service.id} className="border border-gray-200 rounded p-4">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  {service.description && (
                    <p className="text-sm text-gray-600">{service.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Tenders */}
        {company.tenders && company.tenders.length > 0 && (
          <div className="bg-white text-black rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Active Tenders</h2>
            <div className="space-y-4">
              {company.tenders.map(tender => (
                <div key={tender.id} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{tender.title}</h3>
                    <div className="text-sm text-gray-600">
                      Deadline: {new Date(tender.deadline).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{tender.description}</p>
                  <div className="text-sm text-gray-600">
                    Budget: ${tender.budget}
                  </div>
                  <div className="mt-3">
                    <Link
                      href={`/tenders`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View on Tenders Page →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!company.services || company.services.length === 0) && 
         (!company.tenders || company.tenders.length === 0) && (
          <div className="bg-white text-black rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              No additional information available for this company.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 