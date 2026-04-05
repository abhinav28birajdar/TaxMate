/**
 * E-Signature Component
 * Handle digital signatures and requests
 */

'use client';

import React, { useEffect, useState } from 'react';

interface SignatureRequest {
  id: string;
  title: string;
  documentId: string;
  requesterName: string;
  createdAt: string;
  status: string;
}

export const ESignatureWidget = () => {
  const [pending, setPending] = useState<SignatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState<string | null>(null);

  useEffect(() => {
    loadPendingSignatures();
  }, []);

  const loadPendingSignatures = async () => {
    try {
      const response = await fetch('/api/esignature?type=pending');
      const data = await response.json();
      setPending(data.data || []);
    } catch (error) {
      console.error('Error loading signature requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureRequestId: string) => {
    setSigning(signatureRequestId);
    try {
      // In a real implementation, you'd use a signature pad or capture mechanism
      const signatureUrl = 'data:image/png;base64,...'; // Placeholder

      const response = await fetch('/api/esignature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureRequestId,
          signatureUrl,
        }),
      });

      if (response.ok) {
        setPending(pending.filter(r => r.id !== signatureRequestId));
        alert('Document signed successfully!');
      } else {
        alert('Failed to sign document');
      }
    } catch (error) {
      console.error('Error signing document:', error);
      alert('Error signing document');
    } finally {
      setSigning(null);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading signature requests...</div>;
  }

  if (pending.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No documents pending your signature</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Documents Pending Your Signature</h2>
      {pending.map(request => (
        <div key={request.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg">{request.title}</h3>
              <p className="text-sm text-gray-600 mt-1">Requested by: {request.requesterName}</p>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleSign(request.id)}
              disabled={signing === request.id}
              className={`px-4 py-2 rounded font-semibold ${
                signing === request.id
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {signing === request.id ? 'Signing...' : 'Sign Document'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ESignatureWidget;
