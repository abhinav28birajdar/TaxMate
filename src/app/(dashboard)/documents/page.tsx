'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Folder, FileText, Download, MoreVertical, UploadCloud, Loader2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchDocs = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('documents')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (data) setDocuments(data);
            setLoading(false);
        };

        fetchDocs();
    }, [supabase]);

    const folders = [
        { name: 'Financial Stmts 2023', items: 12, size: '24 MB' },
        { name: 'Tax Returns', items: 8, size: '8 MB' },
        { name: 'Legal Contracts', items: 5, size: '15 MB' },
        { name: 'Invoices', items: 45, size: '120 MB' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">Secure vault for all your financial records.</p>
                </div>
                <Button>
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload
                </Button>
            </div>

            {/* Filter/Search */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search documents..." className="pl-9" />
                </div>
                <Button variant="outline">Filter</Button>
            </div>

            {/* Folders (Mocked for now as we didn't add folders table) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {folders.map((folder, i) => (
                    <Card key={i} className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                <Folder className="w-6 h-6 fill-current" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="font-medium truncate">{folder.name}</h3>
                                <p className="text-xs text-muted-foreground">{folder.items} items</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recent Files */}
            <Card>
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Recent Files</h3>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : documents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No documents found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                documents.map((file) => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            {file.name}
                                        </TableCell>
                                        <TableCell>{file.type || 'Unknown'}</TableCell>
                                        <TableCell>{file.size || '-'}</TableCell>
                                        <TableCell>{format(new Date(file.created_at), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Download className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
