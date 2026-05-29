'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const featureFlagSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  rolloutPercentage: z.coerce.number().int().min(0).max(100).default(0),
});

type FeatureFlagInput = z.infer<typeof featureFlagSchema>;

interface FeatureFlag extends FeatureFlagInput {
  id: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export default function AdminFeatureFlagsPage() {
  const { toast } = useToast();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FeatureFlagInput>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      isEnabled: false,
      rolloutPercentage: 0,
    },
  });

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/v1/admin/feature-flags');
      if (!response.ok) throw new Error('Failed to fetch flags');

      const data: ApiResponse<FeatureFlag[]> = await response.json();
      if (data.data) {
        setFlags(data.data);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load feature flags',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const onSubmit = async (values: FeatureFlagInput) => {
    try {
      const response = await fetch('/api/v1/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Failed to create flag');

      toast({
        title: 'Success',
        description: 'Feature flag created',
      });

      form.reset();
      setIsOpen(false);
      fetchFlags();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create feature flag',
        variant: 'destructive',
      });
    }
  };

  const handleToggleFlag = async (flag: FeatureFlag) => {
    try {
      const response = await fetch('/api/v1/admin/feature-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...flag,
          isEnabled: !flag.isEnabled,
        }),
      });

      if (!response.ok) throw new Error('Failed to update flag');

      toast({
        title: 'Success',
        description: 'Feature flag updated',
      });

      fetchFlags();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update feature flag',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Feature Flags</h2>
          <p className="text-sm text-gray-600 mt-1">Manage feature rollouts and experiments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>New Feature Flag</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>Add a new feature flag for gradual rollouts and experiments</DialogDescription>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  placeholder="my_new_feature"
                  {...form.register('key')}
                />
                {form.formState.errors.key && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.key.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="My New Feature"
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Brief description"
                  {...form.register('description')}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="enabled" {...form.register('isEnabled')} />
                <Label htmlFor="enabled" className="cursor-pointer">
                  Enable immediately
                </Label>
              </div>

              <div>
                <Label htmlFor="rollout">Rollout Percentage: {form.watch('rolloutPercentage')}%</Label>
                <Input
                  id="rollout"
                  type="range"
                  min="0"
                  max="100"
                  {...form.register('rolloutPercentage')}
                />
              </div>

              <Button type="submit" className="w-full">
                Create Flag
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : flags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No feature flags yet. Create one to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rollout %</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-mono text-sm">{flag.key}</TableCell>
                    <TableCell>{flag.name}</TableCell>
                    <TableCell className="text-sm text-gray-600">{flag.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={flag.isEnabled ? 'default' : 'secondary'}>
                        {flag.isEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>{flag.rolloutPercentage}%</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleFlag(flag)}
                      >
                        {flag.isEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
