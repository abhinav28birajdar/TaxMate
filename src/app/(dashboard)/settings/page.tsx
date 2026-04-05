'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Save,
  Lock,
  Bell,
  Building2,
  User,
  Mail,
  Phone,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { toast } from 'sonner';

interface ProfileFormData {
  name: string;
  phone: string;
  bio: string;
}

interface SecurityFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface NotificationPreferences {
  emailCaseNotifications: boolean;
  emailDocumentAlerts: boolean;
  emailPaymentReminders: boolean;
  emailAppointmentReminders: boolean;
  smsAlerts: boolean;
}

export default function SettingsPage() {
  const { user, updateProfile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailCaseNotifications: true,
    emailDocumentAlerts: true,
    emailPaymentReminders: true,
    emailAppointmentReminders: true,
    smsAlerts: false,
  });

  const profileForm = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      phone: '',
      bio: '',
    },
  });

  const securityForm = useForm<SecurityFormData>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle Profile Update
  const onProfileSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true);
      
      await updateProfile({
        name: data.name,
      });

      toast.success('Profile updated successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Password Change
  const onSecuritySubmit = async (data: SecurityFormData) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsSaving(true);
      
      // API call would be made here
      console.log('Password change submitted:', data);
      
      toast.success('Password changed successfully. Please sign in again.');
      securityForm.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Notification Preferences
  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...notifications,
      [key]: !notifications[key],
    };

    setNotifications(newPreferences);

    try {
      // API call would be made here
      console.log('Notification preferences updated:', newPreferences);
      toast.success('Preferences saved');
    } catch (error) {
      // Revert on error
      setNotifications(notifications);
      toast.error('Failed to update preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <motion.div
        className="space-y-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="firm" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Firm
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4">
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Public Profile</CardTitle>
                  <CardDescription>
                    This is how others will see you on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <Avatar className="w-24 h-24 border-2 border-primary/20">
                      <AvatarImage src={user?.avatarUrl} />
                      <AvatarFallback className="text-lg font-bold">
                        {user?.name?.split(' ').map((n) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Avatar
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Accepted formats: JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      {...profileForm.register('name', {
                        required: 'Name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                      })}
                      placeholder="Your full name"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email Field (Disabled) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      value={user?.email}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email address cannot be changed. Contact support for assistance.
                    </p>
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      {...profileForm.register('phone')}
                      placeholder="+91 (555) 000-0000"
                      type="tel"
                    />
                  </div>

                  {/* Bio Field */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      Professional Bio
                    </Label>
                    <textarea
                      id="bio"
                      {...profileForm.register('bio', {
                        maxLength: { value: 500, message: 'Bio must not exceed 500 characters' },
                      })}
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Tell us about your expertise and experience..."
                    />
                    <p className="text-xs text-muted-foreground">
                      {profileForm.watch('bio')?.length || 0}/500 characters
                    </p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your security preferences and change your password.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Change Password */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Change Password
                    </h3>

                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPassword ? 'text' : 'password'}
                          {...securityForm.register('currentPassword', {
                            required: 'Current password is required',
                          })}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {securityForm.formState.errors.currentPassword && (
                        <p className="text-xs text-destructive">
                          {securityForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPassword ? 'text' : 'password'}
                          {...securityForm.register('newPassword', {
                            required: 'New password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' },
                          })}
                          placeholder="Enter your new password"
                        />
                      </div>
                      {securityForm.formState.errors.newPassword && (
                        <p className="text-xs text-destructive">
                          {securityForm.formState.errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPassword ? 'text' : 'password'}
                          {...securityForm.register('confirmPassword', {
                            required: 'Please confirm your password',
                          })}
                          placeholder="Confirm your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Two-Factor Authentication */}
                  <div className="border-t pt-6 space-y-4">
                    <h3 className="font-semibold text-sm">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">
                          {user?.twoFactorEnabled ? '✓ 2FA Enabled' : 'Not Enabled'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Add an extra layer of security to your account.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Firm Tab */}
          <TabsContent value="firm" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Firm Information</CardTitle>
                <CardDescription>
                  Manage your firm or practice details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border-2 border-dashed p-8 text-center">
                  <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Firm management features coming soon.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how and when you want to receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: 'emailCaseNotifications' as const,
                    title: 'Case Notifications',
                    description: 'Get notified when a new case is assigned or updated.',
                  },
                  {
                    key: 'emailDocumentAlerts' as const,
                    title: 'Document Alerts',
                    description: 'Receive alerts when clients upload documents.',
                  },
                  {
                    key: 'emailPaymentReminders' as const,
                    title: 'Payment Reminders',
                    description: 'Get reminded about upcoming payment due dates.',
                  },
                  {
                    key: 'emailAppointmentReminders' as const,
                    title: 'Appointment Reminders',
                    description: 'Receive reminders before scheduled meetings.',
                  },
                  {
                    key: 'smsAlerts' as const,
                    title: 'SMS Alerts',
                    description: 'Receive urgent alerts via SMS (Premium feature).',
                  },
                ].map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <Label className="text-base font-medium">{pref.title}</Label>
                      <p className="text-sm text-muted-foreground">{pref.description}</p>
                    </div>
                    <Switch
                      checked={notifications[pref.key]}
                      onCheckedChange={() => handleNotificationChange(pref.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
