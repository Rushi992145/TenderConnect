"use client";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { logout } from "../store/userCompanySlice";

export default function Navbar() {
  const user = useSelector((state: RootState) => state.userCompany.user);
  const dispatch = useDispatch<AppDispatch>();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!user && !!user.id);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  function handleLogout() {
    dispatch(logout());
    window.location.href = "/";
  }

  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-black/90 border-b border-white/10 shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl font-bold tracking-tight text-white hover:text-gray-200 transition">TenderConnect</Link>
      </div>
      <div className="flex items-center gap-6 text-base font-medium">
        <Link href="/" className="hover:text-gray-300 transition">Home</Link>
        <Link href="/tenders" className="hover:text-gray-300 transition">Tenders</Link>
        <Link href="/companies" className="hover:text-gray-300 transition">Companies</Link>
        <Link href="/search" className="hover:text-gray-300 transition">Search</Link>
        {isLoggedIn && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="font-semibold">Profile</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-black border border-white/10 rounded-lg shadow-lg z-50">
                <div className="flex flex-col py-2">
                  <Link href="/profile" className="px-4 py-2 hover:bg-white/10 text-white rounded" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                  <button onClick={handleLogout} className="px-4 py-2 text-left hover:bg-white/10 text-red-400 rounded">Logout</button>
                </div>
              </div>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <Link href="/login" className="hover:text-gray-300 transition">Login</Link>
        )}
      </div>
    </nav>
  );
} 