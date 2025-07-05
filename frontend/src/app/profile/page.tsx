"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../api";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { setCompany } from "../../store/userCompanySlice";
import Image from "next/image";

interface Application {
  id: number;
  tender_id: number;
  company_id: number;
  proposal_text: string;
  created_at: string;
  company_name?: string;
  company_industry?: string;
  tender_title?: string;
  tender_description?: string;
  tender_deadline?: string;
  tender_budget?: number;
}

interface Tender {
  id: number;
  title: string;
  description: string;
  deadline: string;
  budget: number;
  applications_count: number;
  created_at: string;
}

interface GoodsService {
  id: number;
  name: string;
  description?: string;
}

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Applications and tenders state
  const [myTenders, setMyTenders] = useState<Tender[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [tenderApplications, setTenderApplications] = useState<{ [key: number]: Application[] }>({});
  const [loadingTenders, setLoadingTenders] = useState(false);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'my-tenders' | 'my-applications' | 'goods-services'>('profile');

  // Goods/Services state
  const [goodsServices, setGoodsServices] = useState<GoodsService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<GoodsService | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: "", description: "" });
  const [serviceError, setServiceError] = useState("");
  const [serviceLoading, setServiceLoading] = useState(false);

  const fetchMyTenders = useCallback(async () => {
    setLoadingTenders(true);
    try {
      const data = await apiFetch("/tenders/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyTenders(data);
    } catch (err: unknown) {
      console.error("Failed to fetch my tenders:", err);
    } finally {
      setLoadingTenders(false);
    }
  }, [token]);

  const fetchMyApplications = useCallback(async () => {
    setLoadingApplications(true);
    try {
      const data = await apiFetch("/applications/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMyApplications(data);
    } catch (err: unknown) {
      console.error("Failed to fetch my applications:", err);
    } finally {
      setLoadingApplications(false);
    }
  }, [token]);

  const fetchGoodsServices = useCallback(async () => {
    setLoadingServices(true);
    try {
      const data = await apiFetch("/companies/goods-services", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoodsServices(data);
    } catch (err: unknown) {
      console.error("Failed to fetch goods/services:", err);
    } finally {
      setLoadingServices(false);
    }
  }, [token]);

  useEffect(() => {
    if (hasCompany) {
      fetchMyTenders();
      fetchMyApplications();
      fetchGoodsServices();
    }
  }, [hasCompany, fetchGoodsServices, fetchMyApplications, fetchMyTenders]);

  async function fetchTenderApplications(tenderId: number) {
    try {
      const data = await apiFetch(`/applications/tender/${tenderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTenderApplications(prev => ({ ...prev, [tenderId]: data }));
    } catch (err: unknown) {
      console.error("Failed to fetch tender applications:", err);
    }
  }

  async function handleRegisterCompany(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      let finalLogoUrl = logoUrl;
      
      // If a file is selected, convert it to base64
      if (logoFile) {
        try {
          finalLogoUrl = await fileToBase64(logoFile);
        } catch {
          setError("Failed to process logo image");
          setLoading(false);
          return;
        }
      }

      console.log('Sending company registration data:', {
        name,
        industry,
        description,
        logo_url: finalLogoUrl ? '[BASE64_DATA]' : null
      });

      const data = await apiFetch("/companies", {
        method: "POST",
        body: JSON.stringify({ 
          name, 
          industry, 
          description, 
          logo_url: finalLogoUrl 
        }),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      console.log('Company registration successful:', data);
      dispatch(setCompany(data));
      
      // Clear form after successful registration
      setName("");
      setIndustry("");
      setDescription("");
      setLogoUrl("");
      setLogoFile(null);
      setLogoPreview("");
    } catch (err: unknown) {
      console.error('Company registration error:', err);
      setError(err instanceof Error ? err.message : "Failed to register company");
    } finally {
      setLoading(false);
    }
  }

  // Goods/Services functions
  function openServiceModal(service?: GoodsService) {
    if (service) {
      setEditingService(service);
      setServiceForm({ name: service.name, description: service.description || "" });
    } else {
      setEditingService(null);
      setServiceForm({ name: "", description: "" });
    }
    setServiceError("");
    setShowServiceModal(true);
  }

  function closeServiceModal() {
    setShowServiceModal(false);
    setEditingService(null);
    setServiceForm({ name: "", description: "" });
    setServiceError("");
  }

  async function handleServiceSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServiceError("");
    setServiceLoading(true);
    try {
      if (editingService) {
        await apiFetch(`/companies/goods-services/${editingService.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serviceForm),
        });
      } else {
        await apiFetch("/companies/goods-services", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(serviceForm),
        });
      }
      fetchGoodsServices();
      closeServiceModal();
    } catch (err: unknown) {
      setServiceError(err instanceof Error ? err.message : "Failed to save service");
    } finally {
      setServiceLoading(false);
    }
  }

  async function deleteService(serviceId: number) {
    if (!confirm("Are you sure you want to delete this service?")) return;
    
    try {
      await apiFetch(`/companies/goods-services/${serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchGoodsServices();
    } catch (err: unknown) {
      console.error("Failed to delete service:", err);
    }
  }

  // Handle logo file upload
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image file size must be less than 5MB");
        return;
      }

      setLogoFile(file);
      setLogoUrl(""); // Clear URL input when file is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    }
  }

  // Convert file to base64 for upload
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Access</h1>
            <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">You need to be logged in to access your profile.</p>
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-950 dark:to-indigo-900 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Your Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your account and company information</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            Profile
          </button>
        {hasCompany && (
          <>
            <button
              onClick={() => setActiveTab('my-tenders')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'my-tenders' 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              My Tenders
            </button>
            <button
              onClick={() => setActiveTab('my-applications')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'my-applications' 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              My Applications
            </button>
            <button
              onClick={() => setActiveTab('goods-services')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'goods-services' 
                  ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
              }`}
            >
              Goods/Services
            </button>
          </>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700 w-full max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
                <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Profile</h3>
              {hasCompany ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{company.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{company.industry}</div>
                    </div>
                  </div>
                  {company?.description && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">{company.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Company Profile</h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Register your company to start creating tenders and connecting with other businesses.</p>
                  </div>
                  
                  <form onSubmit={handleRegisterCompany} className="space-y-4">
                    <div>
                      <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        id="company-name"
                        type="text"
                        placeholder="Enter your company name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="industry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Industry
                      </label>
                      <input
                        id="industry"
                        type="text"
                        placeholder="e.g., Technology, Healthcare, Construction"
                        value={industry}
                        onChange={e => setIndustry(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        id="description"
                        placeholder="Tell us about your company..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        rows={3}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Logo (Optional)
                      </label>
                      
                      {/* Logo Preview */}
                      {logoPreview && (
                        <div className="mb-4">
                          <div className="relative inline-block">
                            <Image
                              src={logoPreview}
                              alt="Logo preview"
                              width={80}
                              height={80}
                              className="w-20 h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                              onError={(e) => {
                                console.warn('Failed to load logo preview');
                                // Hide the image element on error
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                              }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* File Upload */}
                      <div className="mb-4">
                        <label htmlFor="logo-file" className="cursor-pointer">
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {logoFile ? logoFile.name : "Click to upload logo or drag and drop"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                        </label>
                        <input
                          id="logo-file"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {/* URL Input (Alternative) */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <input
                          id="logo-url"
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={logoUrl}
                          onChange={e => {
                            setLogoUrl(e.target.value);
                            setLogoFile(null);
                            setLogoPreview("");
                          }}
                          className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Enter logo URL instead of uploading
                        </p>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
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
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering company...
                        </div>
                      ) : (
                        "Register Company"
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* My Tenders Tab */}
      {activeTab === 'my-tenders' && hasCompany && (
        <div className="w-full max-w-4xl">
          {loadingTenders ? (
            <div className="text-center">Loading your tenders...</div>
          ) : myTenders.length === 0 ? (
            <div className="bg-white text-black rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t created any tenders yet.</p>
              <Link href="/tenders" className="text-blue-600 hover:underline font-medium">Create Your First Tender</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {myTenders.map(tender => (
                <div key={tender.id} className="bg-white text-black rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{tender.title}</h3>
                      <p className="text-gray-600">{tender.description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>Deadline: {new Date(tender.deadline).toLocaleDateString()}</div>
                      <div>Budget: ${tender.budget}</div>
                      <div>{tender.applications_count} application{tender.applications_count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  
                  {tender.applications_count > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => fetchTenderApplications(tender.id)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {tenderApplications[tender.id] ? 'Hide' : 'View'} Applications
                      </button>
                      
                      {tenderApplications[tender.id] && (
                        <div className="mt-3 space-y-3">
                          {tenderApplications[tender.id].map(application => (
                            <div key={application.id} className="bg-gray-50 p-4 rounded">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold">{application.company_name}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(application.created_at).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">{application.company_industry}</div>
                              <div className="text-sm">{application.proposal_text}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Applications Tab */}
      {activeTab === 'my-applications' && hasCompany && (
        <div className="w-full max-w-4xl">
          {loadingApplications ? (
            <div className="text-center">Loading your applications...</div>
          ) : myApplications.length === 0 ? (
            <div className="bg-white text-black rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t applied to any tenders yet.</p>
              <Link href="/tenders" className="text-blue-600 hover:underline font-medium">Browse Available Tenders</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {myApplications.map(application => (
                <div key={application.id} className="bg-white text-black rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold">{application.tender_title}</h3>
                      <p className="text-gray-600">{application.tender_description}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div>Deadline: {new Date(application.tender_deadline!).toLocaleDateString()}</div>
                      <div>Budget: ${application.tender_budget}</div>
                      <div>Applied: {new Date(application.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="font-semibold text-sm mb-2">Your Proposal:</div>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {application.proposal_text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Goods/Services Tab */}
      {activeTab === 'goods-services' && hasCompany && (
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Goods & Services</h2>
            <button
              onClick={() => openServiceModal()}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
            >
              Add Service
            </button>
          </div>

          {loadingServices ? (
            <div className="text-center">Loading your services...</div>
          ) : goodsServices.length === 0 ? (
            <div className="bg-white text-black rounded-lg shadow p-8 text-center">
              <p className="text-gray-500 mb-4">You haven&apos;t added any goods or services yet.</p>
              <button
                onClick={() => openServiceModal()}
                className="text-blue-600 hover:underline font-medium"
              >
                Add Your First Service
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {goodsServices.map(service => (
                <div key={service.id} className="bg-white text-black rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                      {service.description && (
                        <p className="text-gray-600">{service.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openServiceModal(service)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteService(service.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black"
              onClick={closeServiceModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <form onSubmit={handleServiceSubmit} className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Service/Product Name"
                value={serviceForm.name}
                onChange={e => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              <textarea
                placeholder="Description (optional)"
                value={serviceForm.description}
                onChange={e => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
              />
              {serviceError && <div className="text-red-600 text-sm text-center">{serviceError}</div>}
              <button
                type="submit"
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-900 transition"
                disabled={serviceLoading}
              >
                {serviceLoading ? "Saving..." : (editingService ? "Update Service" : "Add Service")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  </div>
  );
} 