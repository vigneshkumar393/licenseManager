'use client';

import React, { ReactNode, useState } from 'react';

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultActiveTabId?: string;
};

export default function Tabs({ tabs, defaultActiveTabId }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTabId || tabs[0].id);

  return (
    <div className="flex flex-col flex-grow overflow-hidden">
      {/* Tab Buttons */}
      <div className="flex border-b border-gray-300 flex-shrink-0">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-2 px-6 font-semibold whitespace-nowrap ${
              activeTab === id
                ? 'border-b-4 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content fills all remaining space, no scroll */}
      <div className="flex-grow overflow-hidden p-4 bg-white rounded shadow">
        {tabs.map(({ id, content }) =>
          id === activeTab ? <div key={id} className="h-full">{content}</div> : null
        )}
      </div>
    </div>
  );
}
