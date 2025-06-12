'use client';

import { useState, useEffect, ReactNode } from 'react';
import Dialog from './Dialog';
import RenewDialog from './RenewDialog';
import toast from 'react-hot-toast';
import Subscription, { ISubscription } from '../../models/subscription';

export interface IUser {
  _id: string;
  clientName: string;
  clientEmail: string;
  macAddress: string;
  licenseKey: string;
  validFrom?: string;
  validTo?: string;
  subscriptionId: ISubscription; // Reference to Subscription type
}
interface UserListingProps {
  search: string;
  refresh?: boolean;  // add this
}


export default function UserListing({ search, refresh }: UserListingProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewTargetId, setRenewTargetId] = useState<string | null>(null);
  const [renewInitialValidFrom, setRenewInitialValidFrom] = useState<string>('');
  const [renewInitialValidTo, setRenewInitialValidTo] = useState<string>('');
  const [renewingIds, setRenewingIds] = useState<Set<string>>(new Set());
  const [renewValidFrom, setRenewValidFrom] = useState<string>('');
  const [renewValidTo, setRenewValidTo] = useState<string>('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const limit = 10;

  // Reset to page 1 when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

useEffect(() => {
  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/licenses?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('Failed to fetch licenses');
      const data = await res.json();
      setUsers(data.licenses);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  fetchUsers();
}, [page, refresh]);  // add refresh here

  const isExpired = (validTo?: string) => {
    if (!validTo) return true;
    return new Date(validTo) < new Date();
  };

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();

    const validFromStr = user.validFrom
      ? new Date(user.validFrom).toLocaleDateString().toLowerCase()
      : '';
    const validToStr = user.validTo
      ? new Date(user.validTo).toLocaleDateString().toLowerCase()
      : '';

    return (
      user.clientName.toLowerCase().includes(query) ||
      user.clientEmail.toLowerCase().includes(query) ||
      user.macAddress.toLowerCase().includes(query) ||
      user.licenseKey.toLowerCase().includes(query) ||
      validFromStr.includes(query) ||
      validToStr.includes(query)
    );
  });

  async function handleRenewConfirm(validFrom: string, validTo: string) {
  if (!renewTargetId) return;

  setRenewingIds((prev) => new Set(prev).add(renewTargetId));

  try {
    const res = await fetch(`/api/licenses/${renewTargetId}/renew`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        validFrom: new Date(validFrom).toISOString(),
        validTo: new Date(validTo).toISOString(),
      }),
    });
    if (!res.ok) throw new Error('Failed to renew license');

    const updatedLicense = await res.json();

    setUsers((prev) =>
      prev.map((user) =>
        user._id === renewTargetId
          ? {
              ...user,
              validFrom: updatedLicense.validFrom,
              validTo: updatedLicense.validTo,
              licenseKey:updatedLicense.licenseKey
            }
          : user
      )
    );
    setRenewDialogOpen(false);
    setRenewTargetId(null);
  } catch (err: any) {
     toast.error(`Error renewing license: ${err.message}`);
  } finally {
    setRenewingIds((prev) => {
      const copy = new Set(prev);
      copy.delete(renewTargetId);
      return copy;
    });
  }
}

  async function handleRenew(id: string) {
    setRenewingIds((prev) => new Set(prev).add(id));

    const now = new Date();
    const twoYearsLater = new Date();
    twoYearsLater.setFullYear(now.getFullYear() + 2);

    try {
      const res = await fetch(`/api/licenses/${id}/renew`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validFrom: now.toISOString(),
          validTo: twoYearsLater.toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to renew license');

      const updatedLicense = await res.json();

      setUsers((prev) =>
        prev.map((user) =>
          user._id === id
            ? {
                ...user,
                validFrom: updatedLicense.validFrom,
                validTo: updatedLicense.validTo,
              }
            : user
        )
      );
    } catch (err: any) {
       toast.error(`Error renewing license: ${err.message}`);
    } finally {
      setRenewingIds((prev) => {
        const copy = new Set(prev);
        copy.delete(id);
        return copy;
      });
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('License key copied to clipboard!');
    });
  }

  function promptDelete(id: string) {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  }
  
  function openRenewDialog(id: string, currentValidFrom?: string, currentValidTo?: string) {
  setRenewTargetId(id);
  setRenewValidFrom(currentValidFrom ? currentValidFrom.slice(0, 10) : '');
  setRenewValidTo(currentValidTo ? currentValidTo.slice(0, 10) : '');
  setRenewDialogOpen(true);
}


  async function confirmDelete() {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/licenses/${deleteTargetId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete license');
      setUsers((prev) => prev.filter((user) => user._id !== deleteTargetId));
      toast.success(`Successfully deleting license.`);
    } catch (err: any) {
      toast.error(`Error deleting license: ${err.message}`);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    }
  }
const planBgColors: { [key: string]: string } = {
  free: '#3B82F6', // Blue
  basic: '#10B981', // Green
  standard: '#F59E0B', // Yellow
  premium: '#8B5CF6', // Purple
  enterprise: '#EF4444', // Red
};
  const handlePrev = () => setPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setPage((p) => Math.min(p + 1, totalPages));

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="flex flex-col space-y-4 w-full h-full p-4 bg-gray-50 overflow-hidden">
        <div className="border rounded border-gray-300 bg-white shadow flex-grow overflow-auto no-scrollbar">
        <table className="w-full border-collapse border border-gray-300 table-fixed">
          <thead>
            <tr>
              <th className="border p-2 text-center">Client Name</th>
              <th className="border p-2 text-center">Email</th>
              <th className="border p-2 text-center">MAC Address</th>
              <th className="border p-2 text-center max-w-xs">License Key</th>
              <th className="border p-2 text-center">Subscription</th>
              <th className="border p-2 text-center">Valid From</th>
              <th className="border p-2 text-center">Valid To</th>
              <th className="border p-2 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-4">
                  No licenses found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const expired = isExpired(user.validTo);
                const isRenewing = renewingIds.has(user._id);

                return (
                  <tr key={user._id} className="hover:bg-gray-100 align-top">
                    <td className="border p-2">{user.clientName}</td>
                    <td className="border p-2">{user.clientEmail}</td>
                    <td className="border p-2">{user.macAddress}</td>
                    <td
                      className="border p-2 max-w-xs whitespace-pre-wrap break-words"
                      title={user.licenseKey}
                      style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                    >
                      <div className="flex items-start space-x-2">
                       <span>{user.licenseKey.slice(0, 20)}...</span>
                        <button
                          onClick={() => handleCopy(user.licenseKey)}
                          className="text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                          type="button"
                          title="Copy license key"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M8 16h8M8 12h8m-5-8H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2v-3"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
 <td className="border p-2 text-center">
  <button
    style={{
      backgroundColor: planBgColors[user.subscriptionId.planName] ?? 'grey',
      color: 'white',
      fontWeight: 'bold',
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      opacity: 0.5,
    }}
  >
    {user.subscriptionId.planName}
  </button>
</td>


                    <td className="border p-2">{user.validFrom ? formatDate(new Date(user.validFrom).toLocaleDateString()) : 'N/A'}</td>
                    <td className="border p-2">{user.validTo ? formatDate(new Date(user.validTo).toLocaleDateString()) : 'N/A'}</td>
                    <td className="border p-2">
                      <div className="flex space-x-2">
                          <button
                          disabled={!expired || isRenewing}
                          onClick={() =>
                            openRenewDialog(user._id, user.validFrom, user.validTo)
                          }
                          className={`px-3 py-1 rounded text-white text-sm ${
                            expired && !isRenewing
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-400 cursor-not-allowed'
                          }`}
                          type="button"
                        >
                          {isRenewing ? 'Renewing...' : 'Renew'}
                        </button>
                        <button
                          onClick={() => promptDelete(user._id)}
                          className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-sm"
                          type="button"
                          title="Delete License"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center space-x-4">
   <button
  onClick={handlePrev}
  disabled={page === 1}
  className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-200 disabled:text-gray-700"
  type="button"
>
  Prev
</button>

<span>
  Page {page} of {totalPages}
</span>

<button
  onClick={handleNext}
  disabled={page === totalPages}
  className="px-4 py-2 bg-black text-white rounded disabled:bg-gray-200 disabled:text-gray-700"
  type="button"
>
  Next
</button>

      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
         {/* Renew Dialog */}
      <RenewDialog
        open={renewDialogOpen}
        onClose={() => setRenewDialogOpen(false)}
        onConfirm={handleRenewConfirm}
        initialValidFrom={renewInitialValidFrom}
        initialValidTo={renewInitialValidTo}
        loading={renewTargetId ? renewingIds.has(renewTargetId) : false}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Deletion"
        footer={
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setDeleteDialogOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        }
      >
        <p>Are you sure you want to delete this license? This action cannot be undone.</p>
      </Dialog>
    </div>
  );
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function generateCustomLicense(macAddress: any, fromDate: any, toDate: any) {
  throw new Error('Function not implemented.');
}

