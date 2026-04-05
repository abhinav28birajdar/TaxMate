'use client';

import React, { useEffect, useState } from 'react';
import { clientService } from '@/src/lib/services';
import { Client } from '@/lib/types/complete.types';
import {
  Card,
  Button,
  Input,
  Badge,
  LoadingSpinner,
  Modal,
  DataTable,
  TopBar,
} from '@/src/components/ui/core-components';
import { colors } from '@/src/theme/design-system';

// ============================================================================
// CLIENT MANAGEMENT COMPONENT
// Complete client management system for CAs
// ============================================================================

interface ClientManagementProps {
  caId: string;
}

export const ClientManagement: React.FC<ClientManagementProps> = ({ caId }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: 'individual',
    gst_number: '',
    pan_number: '',
    business_address: '',
    state: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    loadClients();
  }, [page, filterStatus, searchQuery]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await clientService.getClients(caId, {
        page,
        status: filterStatus,
        search: searchQuery,
        limit: 10,
      });
      setClients(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientService.createClient(caId, formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'individual',
        gst_number: '',
        pan_number: '',
        business_address: '',
        state: '',
        city: '',
        pincode: '',
      });
      setIsAddModalOpen(false);
      loadClients();
    } catch (error) {
      console.error('Failed to add client:', error);
    }
  };

  const handleEditClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      await clientService.updateClient(selectedClient.id, formData);
      setFormData({
        name: '',
        email: '',
        phone: '',
        type: 'individual',
        gst_number: '',
        pan_number: '',
        business_address: '',
        state: '',
        city: '',
        pincode: '',
      });
      setIsEditModalOpen(false);
      setSelectedClient(null);
      loadClients();
    } catch (error) {
      console.error('Failed to update client:', error);
    }
  };

  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      type: client.type,
      gst_number: client.gst_number || '',
      pan_number: client.pan_number || '',
      business_address: client.business_address || '',
      state: client.state || '',
      city: client.city || '',
      pincode: client.pincode || '',
    });
    setIsEditModalOpen(true);
  };

  const statusColorMap = {
    active: 'success',
    inactive: 'warning',
    archived: 'neutral',
  } as const;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.default }}>
      {/* Header */}
      <TopBar
        title="Client Management"
        searchPlaceholder="Search by name, PAN, or GST..."
        onSearch={(query) => {
          setSearchQuery(query);
          setPage(1);
        }}
        actions={
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            + Add Client
          </Button>
        }
      />

      {/* Filters */}
      <div className="p-6 border-b" style={{ borderColor: colors.neutral[200] }}>
        <div className="flex gap-4 flex-wrap">
          {['active', 'inactive', 'archived'].map((status) => (
            <button
              key={status}
              onClick={() => {
                setFilterStatus(status);
                setPage(1);
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor:
                  filterStatus === status ? colors.primary[600] : colors.neutral[200],
                color: filterStatus === status ? 'white' : colors.neutral[700],
              }}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="p-6">
        <Card>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : (
            <>
              <DataTable<Client>
                columns={[
                  { key: 'name', label: 'Client Name', width: '25%' },
                  {
                    key: 'type',
                    label: 'Type',
                    render: (value) => (
                      <Badge variant="info" size="sm">
                        {String(value).replace('_', ' ').toUpperCase()}
                      </Badge>
                    ),
                  },
                  {
                    key: 'gst_number',
                    label: 'GST Number',
                    render: (value) => value || '-',
                  },
                  {
                    key: 'pan_number',
                    label: 'PAN',
                    render: (value) => value || '-',
                  },
                  {
                    key: 'status',
                    label: 'Status',
                    render: (value) => (
                      <Badge variant={statusColorMap[value as keyof typeof statusColorMap]}>
                        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
                      </Badge>
                    ),
                  },
                  {
                    key: 'email',
                    label: 'Action',
                    render: (_, row) => (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(row)}
                      >
                        Edit
                      </Button>
                    ),
                  },
                ]}
                data={clients}
                emptyMessage="No clients found"
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      size="sm"
                      variant={page === p ? 'primary' : 'outline'}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      </div>

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Client"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddClient}>
              Add Client
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddClient} className="space-y-4">
          <Input
            label="Client Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter client name"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Client Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                style={{ borderColor: colors.neutral[200] }}
              >
                <option value="individual">Individual</option>
                <option value="business">Business</option>
                <option value="startup">Startup</option>
                <option value="huf">HUF</option>
                <option value="partnership">Partnership</option>
                <option value="llp">LLP</option>
              </select>
            </div>
            <Input
              label="GST Number"
              value={formData.gst_number}
              onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
            />
          </div>

          <Input
            label="PAN Number"
            value={formData.pan_number}
            onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
          />

          <Input
            label="Business Address"
            value={formData.business_address}
            onChange={(e) =>
              setFormData({ ...formData, business_address: e.target.value })
            }
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Pincode"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Client Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        title="Edit Client"
        size="lg"
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditClient}>
              Update Client
            </Button>
          </>
        }
      >
        <form onSubmit={handleEditClient} className="space-y-4">
          <Input
            label="Client Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="GST Number"
            value={formData.gst_number}
            onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
          />
          <Input
            label="PAN Number"
            value={formData.pan_number}
            onChange={(e) => setFormData({ ...formData, pan_number: e.target.value })}
          />
        </form>
      </Modal>
    </div>
  );
};

export default ClientManagement;
