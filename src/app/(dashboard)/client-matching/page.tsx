import React from 'react';
import { Card, Badge, Button } from '@/components/ui/core-components';

export default function ClientMatchingPage() {
  const [matchingStats, setMatchingStats] = React.useState({
    totalMatches: 156,
    successRate: 87.5,
    avgMatchScore: 8.2,
    clientsMatched: 42,
    caCapacity: 78,
  });

  const [potentialMatches, setPotentialMatches] = React.useState([
    {
      id: 1,
      clientName: 'Tech Innovations Pvt Ltd',
      industry: 'IT & Software',
      budget: '15-30K/year',
      caCandidates: [
        { name: 'Rajesh Kumar', score: 94, specialty: 'Tech startups', clients: 12, experience: 8 },
        { name: 'Priya Sharma', score: 88, specialty: 'IT companies', clients: 15, experience: 10 },
        { name: 'Amit Patel', score: 82, specialty: 'General compliance', clients: 22, experience: 5 },
      ],
    },
    {
      id: 2,
      clientName: 'Retail Chain Corporation',
      industry: 'Retail & E-commerce',
      budget: '25-50K/year',
      caCandidates: [
        { name: 'Neha Singh', score: 91, specialty: 'Retail businesses', clients: 18, experience: 7 },
        { name: 'Rajesh Kumar', score: 85, specialty: 'Multi-unit businesses', clients: 12, experience: 8 },
      ],
    },
    {
      id: 3,
      clientName: 'Healthcare Services Ltd',
      industry: 'Healthcare & Pharma',
      budget: '30-60K/year',
      caCandidates: [
        { name: 'Dr. Vikram Sharma', score: 97, specialty: 'Pharma & healthcare', clients: 8, experience: 12 },
        { name: 'Priya Sharma', score: 84, specialty: 'Service sector', clients: 15, experience: 10 },
      ],
    },
  ]);

  const [caProfiles, setCaProfiles] = React.useState([
    {
      name: 'Rajesh Kumar',
      specialist: 'Tech & Startup',
      clients: 12,
      capacity: 85,
      experience: 8,
      avgRating: 4.8,
      specialties: ['IT Companies', 'Startups', 'E-commerce'],
    },
    {
      name: 'Priya Sharma',
      specialist: 'Manufacturing & Trade',
      clients: 15,
      capacity: 92,
      experience: 10,
      avgRating: 4.7,
      specialties: ['Manufacturing', 'Import/Export', 'Trading'],
    },
    {
      name: 'Amit Patel',
      specialist: 'General Compliance',
      clients: 22,
      capacity: 68,
      experience: 5,
      avgRating: 4.6,
      specialties: ['GST Filing', 'ITR', 'General Services'],
    },
  ]);

  const [matchingCriteria, setMatchingCriteria] = React.useState({
    industry: 'Weight: 30%',
    budget: 'Weight: 25%',
    experience: 'Weight: 20%',
    capacity: 'Weight: 15%',
    specialization: 'Weight: 10%',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🎯 Intelligent Client Matching</h1>
        <p className="text-slate-600">AI-powered CA-Client matching based on expertise, capacity & requirements</p>
      </div>

      {/* Matching Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
          <p className="text-xs opacity-90">Total Matches</p>
          <p className="text-2xl font-bold">{matchingStats.totalMatches}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <p className="text-xs opacity-90">Success Rate</p>
          <p className="text-2xl font-bold">{matchingStats.successRate}%</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <p className="text-xs opacity-90">Avg Match Score</p>
          <p className="text-2xl font-bold">{matchingStats.avgMatchScore}/10</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
          <p className="text-xs opacity-90">Clients Matched</p>
          <p className="text-2xl font-bold">{matchingStats.clientsMatched}</p>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 text-white">
          <p className="text-xs opacity-90">CA Capacity Used</p>
          <p className="text-2xl font-bold">{matchingStats.caCapacity}%</p>
        </Card>
      </div>

      {/* Matching Algorithm Explanation */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">🧠 Matching Algorithm Criteria</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(matchingCriteria).map(([key, value]) => (
            <div key={key} className="p-3 bg-white rounded-lg text-center">
              <p className="font-semibold text-slate-900 capitalize mb-1">{key}</p>
              <p className="text-sm text-slate-600">{value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Potential Matches */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20 mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-6">📊 Potential Matches</h2>
        <div className="space-y-6">
          {potentialMatches.map((match) => (
            <div key={match.id} className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
              <div className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{match.clientName}</p>
                    <p className="text-sm text-slate-600">{match.industry} • {match.budget}</p>
                  </div>
                  <Button className="bg-indigo-600 text-white">Assign CA</Button>
                </div>
              </div>

              {/* CA Candidates */}
              <div className="space-y-3">
                {match.caCandidates.map((ca, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-lg border border-indigo-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {ca.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{ca.name}</p>
                          <p className="text-xs text-slate-600">
                            {ca.specialty} • {ca.experience} years experience
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-block rounded-full px-4 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 border border-indigo-300">
                          <p className="text-lg font-bold text-indigo-600">{ca.score}%</p>
                          <p className="text-xs text-indigo-700">Match</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-slate-600">Current Clients:</span>
                        <p className="font-semibold text-slate-900">{ca.clients}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Rating:</span>
                        <p className="font-semibold text-slate-900">⭐ {ca.avgRating}/5</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Availability:</span>
                        <Badge variant="success">Available</Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* CA Capacity & Skills Matrix */}
      <Card className="p-8 bg-white/80 backdrop-blur border border-white/20">
        <h2 className="text-xl font-bold text-slate-900 mb-6">💼 CA Capacity & Specialization Matrix</h2>
        <div className="space-y-4">
          {caProfiles.map((ca, idx) => (
            <div key={idx} className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-lg font-semibold text-slate-900">{ca.name}</p>
                  <p className="text-sm text-slate-600">{ca.specialist}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-indigo-600">⭐ {ca.avgRating}</p>
                  <p className="text-xs text-slate-600">{ca.clients} active clients</p>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">Capacity Used</span>
                  <span className="font-medium text-slate-900">{ca.capacity}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      ca.capacity > 85
                        ? 'bg-red-500'
                        : ca.capacity > 70
                        ? 'bg-orange-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${ca.capacity}%` }}
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-sm text-slate-600 mb-2">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {ca.specialties.map((specialty) => (
                    <Badge key={specialty} variant="default">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
