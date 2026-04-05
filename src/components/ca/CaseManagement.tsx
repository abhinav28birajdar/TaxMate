'use client';

import React, { useState } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    Filter,
    Calendar,
    User,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Case {
    id: string;
    caseNumber: string;
    title: string;
    type: string;
    client: {
        name: string;
        avatar?: string;
    };
    status: 'draft' | 'pending_documents' | 'in_progress' | 'under_review' | 'filed' | 'completed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate: Date;
    createdDate: Date;
    progress: number;
    assignedTo?: string;
    tags: string[];
    documentsCount: number;
    tasksCompleted: number;
    totalTasks: number;
}

const CASE_TYPES = [
    'Income Tax Return',
    'GST Filing',
    'Tax Audit',
    'Company Audit',
    'ROC Filing',
    'TDS Return',
    'Financial Planning',
    'Business Valuation',
    'Compliance',
    'Advisory'
];

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-500', icon: FileText },
    pending_documents: { label: 'Pending Documents', color: 'bg-yellow-500', icon: Clock },
    in_progress: { label: 'In Progress', color: 'bg-primary', icon: Briefcase },
    under_review: { label: 'Under Review', color: 'bg-purple-600', icon: AlertCircle },
    filed: { label: 'Filed', color: 'bg-green-600', icon: CheckCircle },
    completed: { label: 'Completed', color: 'bg-emerald-600', icon: CheckCircle }
};

const PRIORITY_CONFIG = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
};

export default function CaseManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Mock cases - Replace with Supabase data
    const [cases] = useState<Case[]>([
        {
            id: '1',
            caseNumber: 'CASE-2024-001',
            title: 'ITR Filing FY 2023-24',
            type: 'Income Tax Return',
            client: {
                name: 'Rajesh Kumar',
                avatar: undefined
            },
            status: 'in_progress',
            priority: 'high',
            dueDate: new Date('2024-07-31'),
            createdDate: new Date('2024-01-15'),
            progress: 65,
            tags: ['ITR-1', 'Salaried'],
            documentsCount: 12,
            tasksCompleted: 8,
            totalTasks: 12
        },
        {
            id: '2',
            caseNumber: 'CASE-2024-002',
            title: 'GST Return Filing Q1 2024',
            type: 'GST Filing',
            client: {
                name: 'Priya Sharma',
                avatar: undefined
            },
            status: 'pending_documents',
            priority: 'urgent',
            dueDate: new Date('2024-02-20'),
            createdDate: new Date('2024-01-10'),
            progress: 30,
            tags: ['GSTR-1', 'GSTR-3B'],
            documentsCount: 5,
            tasksCompleted: 3,
            totalTasks: 10
        },
        {
            id: '3',
            caseNumber: 'CASE-2024-003',
            title: 'Company Audit 2024',
            type: 'Company Audit',
            client: {
                name: 'Tech Solutions Pvt Ltd',
                avatar: undefined
            },
            status: 'under_review',
            priority: 'medium',
            dueDate: new Date('2024-09-30'),
            createdDate: new Date('2024-01-05'),
            progress: 80,
            tags: ['Statutory Audit', 'Annual'],
            documentsCount: 45,
            tasksCompleted: 15,
            totalTasks: 18
        },
        {
            id: '4',
            caseNumber: 'CASE-2024-004',
            title: 'TDS Return Q4 FY23-24',
            type: 'TDS Return',
            client: {
                name: 'Amit Patel',
                avatar: undefined
            },
            status: 'filed',
            priority: 'low',
            dueDate: new Date('2024-05-31'),
            createdDate: new Date('2024-01-20'),
            progress: 100,
            tags: ['26Q', 'Quarterly'],
            documentsCount: 8,
            tasksCompleted: 6,
            totalTasks: 6
        }
    ]);

    const filteredCases = cases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.client.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType = selectedType === 'all' || c.type === selectedType;
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

        return matchesSearch && matchesType && matchesStatus;
    });

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    const getDaysUntilDue = (dueDate: Date) => {
        const now = new Date();
        const diff = dueDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Case Management</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Manage all your client cases in one place</p>
                </div>
                <Button className="bg-primary hover:bg-purple-700 text-white">
                    <Plus className="w-5 h-5 mr-2" />
                    New Case
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border border-border dark:border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Total Cases</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{cases.length}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-card border border-border dark:border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">In Progress</p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {cases.filter(c => c.status === 'in_progress').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-card border border-border dark:border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Completed</p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {cases.filter(c => c.status === 'completed' || c.status === 'filed').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 bg-card border border-border dark:border-border">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">Urgent</p>
                            <p className="text-3xl font-bold text-foreground mt-1">
                                {cases.filter(c => c.priority === 'urgent').length}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cases by title, number, or client..."
                            className="pl-10"
                        />
                    </div>

                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Types</option>
                        {CASE_TYPES.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>

                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Status</option>
                        {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                            <option key={key} value={key}>{config.label}</option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Cases Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCases.map((caseItem) => {
                    const StatusIcon = STATUS_CONFIG[caseItem.status].icon;
                    const daysUntilDue = getDaysUntilDue(caseItem.dueDate);
                    const isOverdue = daysUntilDue < 0;
                    const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 7;

                    return (
                        <Card key={caseItem.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="text-xs">
                                            {caseItem.caseNumber}
                                        </Badge>
                                        <Badge className={PRIORITY_CONFIG[caseItem.priority].color}>
                                            {PRIORITY_CONFIG[caseItem.priority].label}
                                        </Badge>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                                        {caseItem.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{caseItem.type}</p>
                                </div>
                            </div>

                            {/* Client */}
                            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                    {caseItem.client.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{caseItem.client.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Client</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {STATUS_CONFIG[caseItem.status].label}
                                        </span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {caseItem.progress}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full ${STATUS_CONFIG[caseItem.status].color}`}
                                        style={{ width: `${caseItem.progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Tasks & Documents */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {caseItem.tasksCompleted}/{caseItem.totalTasks}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Tasks</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {caseItem.documentsCount}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Documents</p>
                                </div>
                            </div>

                            {/* Due Date */}
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${isOverdue ? 'bg-red-50 dark:bg-red-900/20' :
                                    isDueSoon ? 'bg-yellow-50 dark:bg-yellow-900/20' :
                                        'bg-gray-50 dark:bg-gray-800'
                                }`}>
                                <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' :
                                        isDueSoon ? 'text-yellow-600' :
                                            'text-gray-600'
                                    }`} />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Due Date</p>
                                    <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' :
                                            isDueSoon ? 'text-yellow-600' :
                                                'text-gray-900 dark:text-white'
                                        }`}>
                                        {formatDate(caseItem.dueDate)}
                                        {isOverdue && ' (Overdue)'}
                                        {isDueSoon && !isOverdue && ` (${daysUntilDue} days left)`}
                                    </p>
                                </div>
                            </div>

                            {/* Tags */}
                            {caseItem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {caseItem.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredCases.length === 0 && (
                <Card className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No cases found</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                            ? 'Try adjusting your filters'
                            : 'Create your first case to get started'}
                    </p>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Case
                    </Button>
                </Card>
            )}
        </div>
    );
}
