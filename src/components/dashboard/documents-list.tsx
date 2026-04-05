'use client';

import { Document } from '@/lib/types/complete.types';

interface DocumentsListProps {
  documents: Document[];
  loading: boolean;
}

export default function DocumentsList({ documents, loading }: DocumentsListProps) {
  if (loading) {
    return <div className="text-center py-10">Loading documents...</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
        <p className="text-gray-500">No documents found. Upload your first document!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      {documents.map((doc) => (
        <div key={doc.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition">
          <div className="flex items-start justify-between mb-4">
            <div className="text-3xl">📄</div>
            <div className="text-sm font-medium text-gray-500">v{doc.version}</div>
          </div>
          <h3 className="font-semibold text-gray-900 truncate">{doc.file_name}</h3>
          <p className="text-sm text-gray-600 mt-1">{doc.category}</p>
          <p className="text-xs text-gray-500 mt-2">
            Uploaded {new Date(doc.created_at).toLocaleDateString()}
          </p>
          <button className="mt-4 w-full px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition text-sm font-medium">
            Download
          </button>
        </div>
      ))}
    </div>
  );
}
