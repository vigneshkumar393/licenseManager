'use client';

import { useState } from 'react';
import SubscriptionPage from '@/components/SubscriptionPage';
import UserListingPage from '../user-listing/page';
import { LogOut, Plus, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import SubscriptionForm from '@/components/SubscriptionForm';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'user-listing' | 'subscription'>('user-listing');
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubDialogOpen, setSubIsDialogOpen] = useState(false);
  const [refreshList, setRefreshList] = useState(false);

  const router = useRouter();

  const handleInsertNewRecord = () =>{ 

    if(activeTab === 'subscription'){
          console.log(activeTab)
setSubIsDialogOpen(true);
    }else{
   setIsDialogOpen(true)
    }
 
  };
  const handleReset = () => setSearchQuery("");

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      toast.success('Logged out successfully');
      router.push('/');
    } catch (err: any) {
      toast.error(`Error logging out: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ Top Bar at the top */}
      <header className="flex items-center justify-between px-6 py-4 bg-black text-white shadow-md">
        <h1 className="text-2xl font-semibold">License Manager</h1>

        <div className="flex items-center gap-3">
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

      {/* ✅ Below TopBar: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-1/6 bg-gray-100 p-4 border-r overflow-auto">
          <h2 className="text-lg font-bold mb-4">Dashboard</h2>
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveTab('user-listing')}
                className={`w-full text-left p-2 rounded ${
                  activeTab === 'user-listing' ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                User Listing
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`w-full text-left p-2 rounded ${
                  activeTab === 'subscription' ? 'bg-black text-white' : 'hover:bg-gray-200'
                }`}
              >
                Subscription
              </button>
            </li>
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto bg-gray-50">
          {activeTab === 'user-listing' &&   
          <UserListingPage
    searchQuery={searchQuery}
    refreshList={refreshList}
    isDialogOpen={isDialogOpen}
    setIsDialogOpen={setIsDialogOpen}
    toggleRefresh={() => setRefreshList((prev) => !prev)}
  />}
 {activeTab === 'subscription' && (
  <>
    <SubscriptionPage
      searchQuery={searchQuery}
      refreshList={refreshList}
      isDialogOpen={isSubDialogOpen}
      setIsDialogOpen={setSubIsDialogOpen}
    />
  </>
)}

        </div>
      </div>
    </div>
  );
}
