'use client';

import { useAuth } from '@/hooks/UnifiedAuthContext';
import Link from 'next/link';

export default function TopBar() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search clients, documents, tasks..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6 ml-6">
          {/* Notifications */}
          <button className="relative text-gray-600 hover:text-gray-900 transition">
            <span className="text-2xl">🔔</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-gray-900">{profile?.display_name || user?.email || 'User'}</p>
              <p className="text-sm text-gray-600 capitalize">{profile?.first_name}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
              {(profile?.display_name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            className="text-sm text-gray-600 hover:text-gray-900 transition"
          >
            ↪️
          </button>
        </div>
      </div>
    </div>
  );
}
