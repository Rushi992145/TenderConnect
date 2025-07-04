"use client";
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type User = {
  id?: number;
  email?: string;
  // Add more user fields as needed
};

export type Company = {
  id?: number;
  name?: string;
  industry?: string;
  description?: string;
  // Add more company fields as needed
};

interface UserCompanyContextType {
  user: User;
  setUser: (user: User) => void;
  company: Company;
  setCompany: (company: Company) => void;
  token: string;
  setToken: (token: string) => void;
}

const UserCompanyContext = createContext<UserCompanyContextType | undefined>(undefined);

export function UserCompanyProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({});
  const [company, setCompany] = useState<Company>({});
  const [token, setTokenState] = useState<string>("");

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (storedToken) setTokenState(storedToken);
  }, []);

  const setToken = (newToken: string) => {
    setTokenState(newToken);
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem("token", newToken);
      } else {
        localStorage.removeItem("token");
      }
    }
  };

  return (
    <UserCompanyContext.Provider value={{ user, setUser, company, setCompany, token, setToken }}>
      {children}
    </UserCompanyContext.Provider>
  );
}

export function useUserCompany() {
  const context = useContext(UserCompanyContext);
  if (!context) throw new Error("useUserCompany must be used within a UserCompanyProvider");
  return context;
} 