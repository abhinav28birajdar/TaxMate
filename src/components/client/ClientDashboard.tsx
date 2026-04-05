'use client';

import React, { useState } from 'react';
import {
    FileText,
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    User,
    MessageSquare,
    Phone,
    Video,
    Download,
    Upload
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function ClientDashboard() {
    const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

    // Mock data - Replace with Supabase data
    const stats = {
        activeCases: 3,
        completedCases: 12,
        upcomingDeadlines: 5,
        totalSpent: 45000
    };

    const myCases = [
        {
            id: '1',
            title: 'ITR Filing FY 2023-24',
            type: 'Income Tax Return',
            ca: 'CA Rajesh Kumar',
            status: 'in_progress',
            progress: 65,
            dueDate: '2024-07-31',
            lastUpdate: '2 hours ago'
        },
        {
            id: '2',
            title: 'GST Return Q1 2024',
            type: 'GST Filing',
            ca: 'CA Priya Sharma',
            status: 'pending_documents',
            progress: 30,
            dueDate: '2024-02-20',
            lastUpdate: '1 day ago'
        },
        {
            id: '3',
            title: 'TDS Return Q4',
            type: 'TDS Return',
            ca: 'CA Amit Patel',
            status: 'completed',
            progress: 100,
            dueDate: '2024-05-31',
            lastUpdate: '3 days ago'
        }
    ];

    const upcomingDeadlines = [
        {
            id: '1',
            title: 'GST Return Filing',
            date: '2024-02-20',
            daysLeft: 24,
            priority: 'high'
        },
        {
            id: '2',
            title: 'TDS Payment',
            date: '2024-03-07',
            daysLeft: 40,
            priority: 'medium'
        },
        {
            id: '3',
            title: 'ITR Filing Deadline',
            date: '2024-07-31',
            daysLeft: 186,
            priority: 'low'
        }
    ];

    const recentDocuments = [
        {
            id: '1',
            name: 'Form 16 FY 2023-24.pdf',
            uploadedBy: 'You',
            uploadedAt: '2 hours ago',
            size: '245 KB',
            caseTitle: 'ITR Filing FY 2023-24'
        },
        {
            id: '2',
            name: 'Bank Statement Jan 2024.pdf',
            uploadedBy: 'You',
            uploadedAt: '1 day ago',
            size: '1.2 MB',
            caseTitle: 'GST Return Q1 2024'
        },
        {
            id: '3',
            name: 'ITR Acknowledgement.pdf',
            uploadedBy: 'CA Rajesh Kumar',
            uploadedAt: '3 days ago',
            size: '156 KB',
            caseTitle: 'ITR Filing FY 2023-24'
        }
    ];

    const myCA = {
        name: 'CA Rajesh Kumar',
        specialization: 'Income Tax & GST',
        experience: '12 years',
        rating: 4.8,
        totalReviews: 156,
        responseTime: '< 2 hours',
        availability: 'Available'
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Track your cases and compliance status</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Document
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Active Cases */}
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Active Cases</h3>
                    <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.activeCases}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">In progress</p>
                </Card>

                {/* Completed Cases */}
                <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Completed</h3>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{stats.completedCases}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">All time</p>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">Deadlines</h3>
                    <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{stats.upcomingDeadlines}</p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Upcoming</p>
                </Card>

                {/* Total Spent */}
                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Total Spent</h3>
                    <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">₹{(stats.totalSpent / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">This year</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* My CA */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Chartered Accountant</h3>
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                            {myCA.name.split(' ')[1].charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">{myCA.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{myCA.specialization}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={`text-yellow-400 ${i < Math.floor(myCA.rating) ? 'fill-current' : ''}`}>★</span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {myCA.rating} ({myCA.totalReviews} reviews)
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Experience</span>
                            <span className="font-medium text-gray-900 dark:text-white">{myCA.experience}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                            <span className="font-medium text-gray-900 dark:text-white">{myCA.responseTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                                {myCA.availability}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                            <MessageSquare className="w-5 h-5 mb-1" />
                            <span className="text-xs">Chat</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                            <Phone className="w-5 h-5 mb-1" />
                            <span className="text-xs">Call</span>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-col h-auto py-3">
                            <Video className="w-5 h-5 mb-1" />
                            <span className="text-xs">Video</span>
                        </Button>
                    </div>
                </Card>

                {/* Upcoming Deadlines */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming Deadlines</h3>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <div className="space-y-4">
                        {upcomingDeadlines.map((deadline) => (
                            <div key={deadline.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${deadline.priority === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                                        deadline.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                            'bg-blue-100 dark:bg-blue-900/20'
                                    }`}>
                                    <Calendar className={`w-6 h-6 ${deadline.priority === 'high' ? 'text-red-600' :
                                            deadline.priority === 'medium' ? 'text-yellow-600' :
                                                'text-blue-600'
                                        }`} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 dark:text-white">{deadline.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Due: {deadline.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{deadline.daysLeft}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">days left</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* My Cases */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Cases</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myCases.map((caseItem) => (
                        <div key={caseItem.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">{caseItem.title}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{caseItem.type}</p>
                                </div>
                                <Badge className={
                                    caseItem.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                        caseItem.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                }>
                                    {caseItem.status.replace('_', ' ')}
                                </Badge>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                    {caseItem.ca.split(' ')[1].charAt(0)}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">{caseItem.ca}</span>
                            </div>

                            <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                                    <span className="font-semibold text-gray-900 dark:text-white">{caseItem.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600"
                                        style={{ width: `${caseItem.progress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    <span>Due: {caseItem.dueDate}</span>
                                </div>
                                <span className="text-gray-500 dark:text-gray-400">{caseItem.lastUpdate}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Recent Documents */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Documents</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="space-y-3">
                    {recentDocuments.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">{doc.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">{doc.caseTitle}</Badge>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{doc.size}</span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Uploaded by {doc.uploadedBy} • {doc.uploadedAt}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon">
                                <Download className="w-5 h-5" />
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
