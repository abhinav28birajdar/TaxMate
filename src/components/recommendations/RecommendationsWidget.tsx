/**
 * AI Recommendations Component
 * Displays AI-powered recommendations
 */

'use client';

import React, { useEffect, useState } from 'react';

interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  priority: string;
  confidenceScore: number;
  expectedBenefit?: string;
  actionItems?: string[];
}

export const RecommendationsWidget = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations?limit=5');
        const data = await response.json();
        setRecommendations(data.data || []);
      } catch (error) {
        console.error('Error loading recommendations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  const getPriorityColor = (priority: string): string => {
    const colors: Record<string, string> = {
      critical: 'bg-red-100 text-red-800 border-l-4 border-red-500',
      high: 'bg-orange-100 text-orange-800 border-l-4 border-orange-500',
      medium: 'bg-amber-100 text-amber-800 border-l-4 border-amber-500',
      low: 'bg-blue-100 text-blue-800 border-l-4 border-blue-500',
    };
    return colors[priority] || colors['low'];
  };

  const handleDismiss = async (recommendationId: string) => {
    try {
      await fetch('/api/recommendations/dismiss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recommendationId }),
      });

      setRecommendations(recommendations.filter(r => r.id !== recommendationId));
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center">
        <p className="text-gray-500">No recommendations at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">AI Recommendations</h2>
      {recommendations.map(rec => (
        <div key={rec.id} className={`p-4 rounded-lg ${getPriorityColor(rec.priority)}`}>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg">{rec.title}</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-white/30 rounded">
                  {(rec.confidenceScore * 100).toFixed(0)}% confidence
                </span>
              </div>
              <p className="text-sm mb-3">{rec.description}</p>

              {rec.expectedBenefit && (
                <p className="text-sm font-semibold mb-3">
                  💡 {rec.expectedBenefit}
                </p>
              )}

              {rec.actionItems && rec.actionItems.length > 0 && (
                <div className="text-sm">
                  <p className="font-semibold mb-1">Suggested Actions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {rec.actionItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <button
              onClick={() => handleDismiss(rec.id)}
              className="ml-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationsWidget;
