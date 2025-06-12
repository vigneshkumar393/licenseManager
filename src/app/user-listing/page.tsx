// app/user-listing/page.tsx
'use client';

import UserListing from "@/components/UserListing";
import Dialog from "@/components/Dialog";
import LicenseForm from "@/components/LicenseForm";

interface Props {
  searchQuery: string;
  refreshList: boolean;
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  toggleRefresh: () => void;
}

export default function UserListingPage({
  searchQuery,
  refreshList,
  isDialogOpen,
  setIsDialogOpen,
  toggleRefresh,
}: Props) {
  console.log("user-list"+isDialogOpen)
  return (
    <main className="w-full h-full bg-gray-100 flex flex-col overflow-hidden">
      {/* Content area */}
      <div className="flex-grow w-full overflow-auto">
        <UserListing search={searchQuery} refresh={refreshList} />
      </div>

      {/* Dialog for insert */}
      <Dialog
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          toggleRefresh();
        }}
        title="Insert New License Record"
      >
        <LicenseForm
          onSuccess={() => {
            setIsDialogOpen(false);
            toggleRefresh();
          }}
        />
      </Dialog>
    </main>
  );
}
