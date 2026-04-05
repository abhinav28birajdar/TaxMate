'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/AuthContext';
import { useRouter } from 'next/navigation';

// Document management component for business users
export default function DocumentManagement() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [uploadingFile, setUploadingFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  // Mock document data - would come from Firestore in production
  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Business Registration.pdf',
      type: 'pdf',
      size: '2.4 MB',
      category: 'registration',
      uploadedBy: profile?.displayName || 'Admin User',
      uploadedAt: '2023-12-01T10:30:00.000Z',
      shared: false,
    },
    {
      id: '2',
      name: 'Financial Statement Q3.xlsx',
      type: 'xlsx',
      size: '1.8 MB',
      category: 'financial',
      uploadedBy: profile?.displayName || 'Admin User',
      uploadedAt: '2023-11-15T14:20:00.000Z',
      shared: true,
    },
    {
      id: '3',
      name: 'Tax Return 2022.pdf',
      type: 'pdf',
      size: '3.6 MB',
      category: 'tax',
      uploadedBy: profile?.displayName || 'Admin User',
      uploadedAt: '2023-10-30T09:45:00.000Z',
      shared: false,
    }
  ]);

  // Mock folders
  const folders = [
    { id: 'all', name: 'All Documents', count: documents.length },
    { id: 'registration', name: 'Registration', count: documents.filter(d => d.category === 'registration').length },
    { id: 'financial', name: 'Financial', count: documents.filter(d => d.category === 'financial').length },
    { id: 'tax', name: 'Tax Documents', count: documents.filter(d => d.category === 'tax').length },
    { id: 'shared', name: 'Shared with CA', count: documents.filter(d => d.shared).length },
  ];

  const filteredDocuments = documents
    .filter(doc => selectedFolder === 'all' || (selectedFolder === 'shared' ? doc.shared : doc.category === selectedFolder))
    .filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Mock file upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setUploadingFile(true);
    
    // Simulate upload delay
    setTimeout(() => {
      const newDocument = {
        id: Math.random().toString(36).substring(7),
        name: file.name,
        type: file.name.split('.').pop() || '',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        category: 'registration', // Default category
        uploadedBy: profile?.displayName || 'Admin User',
        uploadedAt: new Date().toISOString(),
        shared: false,
      };
      
      setDocuments([...documents, newDocument]);
      setUploadingFile(false);
    }, 1500);
  };

  const handleDeleteDocument = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(doc => doc.id !== id));
    }
  };

  const handleToggleShare = (id: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, shared: !doc.shared } : doc
    ));
  };

  // Helper function to get file icon based on type
  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
      case 'xlsx':
      case 'xls':
      case 'csv':
        return (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
          </svg>
        );
      case 'docx':
      case 'doc':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with search and upload */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:text-3xl sm:truncate">
              Company Documents
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Securely store and share your business documents with your chartered accountant.
            </p>
          </div>
          <div className="mt-4 flex md:mt-0">
            <label
              htmlFor="file-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                uploadingFile ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {uploadingFile ? 'Uploading...' : 'Upload Document'}
            </label>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="hidden"
              disabled={uploadingFile}
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="mt-6">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:text-white"
              placeholder="Search documents by name..."
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Document explorer */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Folders sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Folders</h3>
          <nav className="mt-3 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md ${
                  selectedFolder === folder.id
                    ? 'bg-gray-100 dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {folder.name}
                </div>
                <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                  {folder.count}
                </span>
              </button>
            ))}
          </nav>
          
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Categories</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              <button className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                + New Category
              </button>
            </div>
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          {filteredDocuments.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Shared
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDocuments.map((document) => (
                  <tr key={document.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getFileIcon(document.type)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {document.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {document.category}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {document.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(document.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleShare(document.id)}
                        className={`flex items-center ${
                          document.shared
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {document.shared ? (
                          <>
                            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span className="text-sm">Shared</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span className="text-sm">Share</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 mr-4">
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(document.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No documents found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchQuery ? 'Try a different search term' : 'Upload a document to get started'}
              </p>
              <div className="mt-6">
                <label
                  htmlFor="file-upload-empty"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload a document
                </label>
                <input
                  id="file-upload-empty"
                  name="file-upload-empty"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
