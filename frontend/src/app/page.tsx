import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-100 dark:from-gray-900 dark:to-blue-950">
      {/* Header */}
      <header className="w-full py-8 flex flex-col items-center bg-white/80 dark:bg-gray-900/80 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/next.svg" alt="TenderConnect Logo" width={48} height={48} />
          <h1 className="text-3xl font-bold tracking-tight text-blue-700 dark:text-blue-300">TenderConnect</h1>
        </div>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-xl text-center">
          The smart way to manage, discover, and apply for tenders. Connecting companies and opportunities seamlessly.
        </p>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-12">
        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/tenders" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full shadow transition">View Tenders</Link>
          <Link href="/register" className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-3 px-8 rounded-full shadow transition">Register Company</Link>
          <Link href="/login" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-full shadow transition">Login</Link>
        </div>

        {/* Latest Tenders Section (placeholder) */}
        <section className="w-full max-w-3xl bg-white/90 dark:bg-gray-800/80 rounded-xl shadow p-8 mt-8">
          <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4">Latest Tenders</h2>
          <ul className="space-y-3">
            <li className="text-gray-700 dark:text-gray-200">Tender #1 - Placeholder for tender details</li>
            <li className="text-gray-700 dark:text-gray-200">Tender #2 - Placeholder for tender details</li>
            <li className="text-gray-700 dark:text-gray-200">Tender #3 - Placeholder for tender details</li>
          </ul>
          <div className="mt-4 text-right">
            <Link href="/tenders" className="text-blue-600 hover:underline font-medium">See all tenders →</Link>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="w-full max-w-3xl mt-12">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3">How it Works</h2>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-300 space-y-2">
            <li>Companies register and post new tenders.</li>
            <li>Vendors browse and apply for relevant tenders.</li>
            <li>Track application status and manage opportunities in one place.</li>
          </ol>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-gray-500 text-sm bg-white/70 dark:bg-gray-900/70 mt-auto">
        &copy; {new Date().getFullYear()} TenderConnect. All rights reserved.
      </footer>
    </div>
  );
}
