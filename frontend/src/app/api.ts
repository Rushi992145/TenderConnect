const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  
  const url = `${API_BASE}${path}`;
  console.log('API Request:', url, options);
  
  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    
    console.log('API Response status:', res.status, res.statusText);
    
    let data;
    try {
      data = await res.json();
      console.log('API Response data:', data);
    } catch {
      data = null;
      console.log('API Response: No JSON data');
    }
    
    if (!res.ok) {
      const errorMessage = data?.error || data?.details || `HTTP ${res.status}: ${res.statusText}`;
      console.error('API Error:', errorMessage, data);
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error(`API Error for ${path}:`, error);
    throw error;
  }
} 