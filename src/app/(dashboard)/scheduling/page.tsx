'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, MapPin, Users, Video, Phone, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SchedulingPage() {
  const [appointments] = useState([
    {
      id: '1',
      title: 'GST Filing Review',
      client: 'ABC Pvt Ltd',
      date: '2024-04-05',
      time: '10:00 AM',
      type: 'video',
      status: 'scheduled',
      attendees: 2,
    },
    {
      id: '2',
      title: 'ITR Consultation',
      client: 'Sharma & Associates',
      date: '2024-04-05',
      time: '2:00 PM',
      type: 'phone',
      status: 'confirmed',
      attendees: 1,
    },
  ]);

  const [slots] = useState([
    {
      day: 'Monday',
      times: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
    },
    {
      day: 'Tuesday',
      times: ['9:00 AM', '10:00 AM', '11:00 AM', '3:00 PM'],
    },
    {
      day: 'Wednesday',
      times: ['10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'],
    },
    {
      day: 'Thursday',
      times: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
    },
    {
      day: 'Friday',
      times: ['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM'],
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-blue-500">Scheduled</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-500">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-gray-500">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getAppointmentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5 text-blue-500" />;
      case 'phone':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'in-person':
        return <MapPin className="w-5 h-5 text-purple-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scheduling & Appointments</h1>
          <p className="text-gray-600 mt-1">Manage your calendar, book appointments, and send reminders</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="appointments" className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="appointments" className="data-[state=active]:bg-white">
            Appointments
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-white">
            Calendar
          </TabsTrigger>
          <TabsTrigger value="availability" className="data-[state=active]:bg-white">
            Availability
          </TabsTrigger>
        </TabsList>

        {/* Appointments Tab */}
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Scheduled meetings and consultations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="pt-1">
                        {getAppointmentIcon(apt.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{apt.title}</p>
                        <p className="text-sm text-gray-600">{apt.client}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {apt.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {apt.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {apt.attendees} attendee{apt.attendees > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="mb-2">
                        {getStatusBadge(apt.status)}
                      </div>
                      <Button variant="ghost" size="sm" className="text-indigo-600">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendar View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-12">
                <div className="text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Calendar widget</p>
                  <p className="text-sm text-gray-500 mt-2">Integration with Google Calendar coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Availability & Slots</CardTitle>
              <CardDescription>Set your working hours and available time slots</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div key={slot.day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{slot.day}</h3>
                    <div className="flex flex-wrap gap-2">
                      {slot.times.map((time) => (
                        <Button
                          key={time}
                          variant="outline"
                          size="sm"
                          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700">
                Save Availability
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
