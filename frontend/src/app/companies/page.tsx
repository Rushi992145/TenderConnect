"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../api";
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
}

interface CompanyWithTenders extends Company {
  tenders: Array<{
    id: number;
    title: string;
    description: string;
    deadline: string;
    budget: number;
    created_at: string;
  }>;
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithTenders | null>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [loadingCompanyDetails, setLoadingCompanyDetails] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/search/all-companies");
      setCompanies(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  }

  async function fetchCompanyDetails(companyId: number) {
    setLoadingCompanyDetails(true);
    try {
      const data = await apiFetch(`/search/companies/${companyId}`);
      setSelectedCompany(data);
      setShowCompanyModal(true);
    } catch (err: any) {
      console.error("Failed to fetch company details:", err);
    } finally {
      setLoadingCompanyDetails(false);
    }
  }

  function closeCompanyModal() {
    setShowCompanyModal(false);
    setSelectedCompany(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">All Companies</h1>
          <p className="text-gray-600 dark:text-gray-300">Discover and connect with registered businesses</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-600 dark:text-gray-300 shadow rounded-md">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading companies...
            </div>
          </div>
        )}

        {/* Companies Grid */}
        {!loading && !error && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
                <svg className="w-4 h-4 text-teal-600 dark:text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Found {companies.length} registered company{companies.length !== 1 ? 'ies' : ''}
                </span>
              </div>
            </div>
            
            {companies.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Companies Found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">Companies will appear here once they register.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Be the first to join our platform!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map(company => (
                  <div key={company.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{company.name}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-6 h-6 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{company.industry}</span>
                          </div>
                          {company.description && (
                            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-4">
                              {company.description}
                            </p>
                          )}
                        </div>
                        {company.logo_url && (
                          <img
                            src={company.logo_url}
                            alt={`${company.name} logo`}
                            className="w-12 h-12 object-contain ml-4 rounded-lg"
                          />
                        )}
                      </div>
                      
                      {company.services && company.services.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Services:</h4>
                          <div className="flex flex-wrap gap-1">
                            {company.services.slice(0, 3).map(service => (
                              <span
                                key={service.id}
                                className="bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 px-2 py-1 rounded text-xs font-medium"
                              >
                                {service.name}
                              </span>
                            ))}
                            {company.services.length > 3 && (
                              <span className="text-gray-500 dark:text-gray-400 text-xs">
                                +{company.services.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Joined: {new Date(company.created_at).toLocaleDateString()}
                        </div>
                        <button
                          onClick={() => fetchCompanyDetails(company.id)}
                          disabled={loadingCompanyDetails}
                          className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loadingCompanyDetails ? (
                            <div className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Loading...
                            </div>
                          ) : (
                            "View Details"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Company Details Modal */}
      {showCompanyModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedCompany.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{selectedCompany.industry}</p>
                </div>
                <button
                  onClick={closeCompanyModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Company Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Industry:</span>
                      <span className="text-gray-900 dark:text-white">{selectedCompany.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Founded:</span>
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedCompany.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {selectedCompany.description && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 block mb-2">Description:</span>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{selectedCompany.description}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedCompany.logo_url && (
                  <div className="flex justify-center items-center">
                    <img
                      src={selectedCompany.logo_url}
                      alt={`${selectedCompany.name} logo`}
                      className="w-32 h-32 object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )}
              </div>

              {/* Services Section */}
              {selectedCompany.services && selectedCompany.services.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Services & Products
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCompany.services.map(service => (
                      <div key={service.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{service.name}</h4>
                        {service.description && (
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tenders Section */}
              {selectedCompany.tenders && selectedCompany.tenders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 text-teal-600 dark:text-teal-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Active Tenders
                  </h3>
                  <div className="space-y-3">
                    {selectedCompany.tenders.map(tender => (
                      <div key={tender.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{tender.title}</h4>
                          <span className="text-green-600 dark:text-green-400 font-semibold">
                            ${tender.budget.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">{tender.description}</p>
                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                          <span>Deadline: {new Date(tender.deadline).toLocaleDateString()}</span>
                          <span>Posted: {new Date(tender.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 