'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, TrendingUp, PieChart, Download, Filter } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExpensesPage() {
  const [expenses] = useState([
    {
      id: '1',
      category: 'Software License',
      amount: 9999,
      gst: 1799.82,
      date: '2024-04-01',
      billNumber: 'SOFT/001',
      status: 'approved',
    },
    {
      id: '2',
      category: 'Office Supplies',
      amount: 2500,
      gst: 450,
      date: '2024-04-02',
      billNumber: 'OFF/065',
      status: 'approved',
    },
    {
      id: '3',
      category: 'Travel',
      amount: 5000,
      gst: 900,
      date: '2024-04-03',
      billNumber: 'TRAV/089',
      status: 'submitted',
    },
  ]);

  const [categories] = useState([
    { name: 'Software License', total: 9999, percentage: 45 },
    { name: 'Office Supplies', total: 2500, percentage: 11 },
    { name: 'Travel', total: 5000, percentage: 23 },
    { name: 'Employee Training', total: 3000, percentage: 14 },
    { name: 'Other', total: 1200, percentage: 7 },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500">Submitted</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalGST = expenses.reduce((sum, e) => sum + e.gst, 0);
  const gstRecovery = (totalGST / totalExpenses * 100).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">Track expenses, recover GST, and generate reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-900">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">GST Recoverable</p>
                <p className="text-2xl font-bold text-green-900">₹{totalGST.toLocaleString()}</p>
              </div>
              <PieChart className="w-10 h-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">GST Recovery %</p>
                <p className="text-2xl font-bold text-blue-900">{gstRecovery}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">Approved Expenses</p>
                <p className="text-2xl font-bold text-purple-900">
                  {expenses.filter(e => e.status === 'approved').length}
                </p>
              </div>
              <Badge className="bg-green-500">
                {Math.round((expenses.filter(e => e.status === 'approved').length / expenses.length) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="expenses" className="data-[state=active]:bg-white">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="categories" className="data-[state=active]:bg-white">
            By Category
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>All your expense transactions and GST details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bill #</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">GST</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{expense.category}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{expense.billNumber}</td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          ₹{expense.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-green-600 font-medium">
                          ₹{expense.gst.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {getStatusBadge(expense.status)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{cat.name}</span>
                      <span className="text-sm font-bold text-gray-900">₹{cat.total.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition"
                        style={{ width: `${cat.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">{cat.percentage}% of total</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Monthly Expense Summary</p>
                    <p className="text-sm text-gray-600">Download current month expense report</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">GST Recovery Report</p>
                    <p className="text-sm text-gray-600">Detailed GST recovery analysis</p>
                  </div>
                </Button>
                <Button variant="outline" className="w-full justify-start h-auto p-4">
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Category Analysis</p>
                    <p className="text-sm text-gray-600">Expenses grouped by category</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
