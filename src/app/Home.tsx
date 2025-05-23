'use client';

import { Plus, RefreshCcw, LogOut } from "lucide-react";
import UserListing from "@/components/UserListing";
import Dialog from "@/components/Dialog";
import { useState } from "react";
import LicenseForm from "@/components/LicenseForm";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false);

  const handleInsertNewRecord = () => {
    setIsDialogOpen(true);
  };

  const handleReset = () => {
    setSearchQuery("");
  };

  const handleLogout = () => {
    // Perform logout logic here (e.g., clear auth, redirect)
    window.location.reload(); // simple way to simulate logout
  };

  return (
    <main className="w-screen h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-black text-white shadow-md relative">
        <h1 className="text-2xl font-semibold text-center w-full pointer-events-none">
          License Manager
        </h1>

        <div className="absolute right-6 flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="px-3 py-2 rounded-md text-black bg-white placeholder-black"
          />

          <button
            onClick={handleReset}
            className="bg-gray-700 hover:bg-gray-800 text-white font-medium py-2 px-3 rounded flex items-center gap-1"
          >
            <RefreshCcw size={16} />
            Reset
          </button>

          <button
            onClick={handleInsertNewRecord}
            className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-3 rounded border border-gray-300 flex items-center gap-1"
          >
            <Plus size={16} />
            Insert
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded flex items-center gap-1"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Content area */}
      <div className="flex-grow w-full overflow-auto">
        <UserListing search={searchQuery} refresh={refreshList} />
      </div>

      {/* Dialog for insert */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setRefreshList((prev) => !prev);
        }}
        title="Insert New License Record"
      >
        <LicenseForm
          onSuccess={() => {
            setIsDialogOpen(false);
            setRefreshList((prev) => !prev);
          }}
        />
      </Dialog>
    </main>
  );
}
