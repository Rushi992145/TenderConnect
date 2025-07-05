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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!user && !!user.id);
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (dropdownOpen || mobileMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen, mobileMenuOpen]);

  function handleLogout() {
    dispatch(logout());
    setMobileMenuOpen(false);
    window.location.href = "/";
  }

  return (
    <nav className="w-full flex items-center justify-between px-4 sm:px-8 py-4 bg-white/95 dark:bg-black/90 border-b border-gray-200 dark:border-white/10 shadow-sm sticky top-0 z-50 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition">TenderConnect</Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6 text-base font-medium">
        <Link href="/" className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition">Home</Link>
        <Link href="/tenders" className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition">Tenders</Link>
        <Link href="/companies" className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition">Companies</Link>
        <Link href="/search" className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition">Search</Link>
        {isLoggedIn && (
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-900 dark:text-white transition focus:outline-none"
              onClick={() => setDropdownOpen((open) => !open)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span className="font-semibold">Profile</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg z-50">
                <div className="flex flex-col py-2">
                  <Link href="/profile" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-900 dark:text-white rounded" onClick={() => setDropdownOpen(false)}>My Profile</Link>
                  <button onClick={handleLogout} className="px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-white/10 text-red-600 dark:text-red-400 rounded">Logout</button>
                </div>
              </div>
            )}
          </div>
        )}
        {!isLoggedIn && (
          <Link href="/login" className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition">Login</Link>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300 transition p-2"
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="absolute top-full left-0 right-0 bg-white/95 dark:bg-black/95 border-b border-gray-200 dark:border-white/10 shadow-lg md:hidden backdrop-blur-sm"
        >
          <div className="flex flex-col py-4 px-4 space-y-4">
            <Link 
              href="/" 
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2 border-b border-gray-200 dark:border-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              href="/tenders" 
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2 border-b border-gray-200 dark:border-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tenders
            </Link>
            <Link 
              href="/companies" 
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2 border-b border-gray-200 dark:border-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Companies
            </Link>
            <Link 
              href="/search" 
              className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2 border-b border-gray-200 dark:border-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Search
            </Link>
            {isLoggedIn ? (
              <>
                <Link 
                  href="/profile" 
                  className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2 border-b border-gray-200 dark:border-white/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="text-left text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/login" 
                className="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 