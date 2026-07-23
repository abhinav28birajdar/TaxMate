'use client';

import { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, ShieldCheck, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ClientCallsPage() {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-lime-600" /> WebRTC Consultation Room
          </h1>
          <p className="text-xs text-slate-500">Live Encrypted Video Consultation with CA Rajesh Sharma</p>
        </div>
        <span className="px-2.5 py-1 bg-lime-600/20 text-lime-600 dark:text-lime-400 border border-lime-500/30 text-xs font-bold rounded-full">
          256-bit WebRTC Connected
        </span>
      </div>

      <div className="relative bg-slate-950 rounded-3xl aspect-video overflow-hidden border border-slate-800 shadow-2xl flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full bg-lime-600 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-lg shadow-lime-600/30">
            RS
          </div>
          <h3 className="text-white font-bold text-base flex items-center justify-center gap-1.5">
            CA Rajesh Sharma <ShieldCheck className="w-4 h-4 text-lime-400" />
          </h3>
          <p className="text-xs text-slate-400">Waiting for participant to share video stream...</p>
        </div>

        <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4">
          <Button variant={micOn ? 'outline' : 'destructive'} size="icon" onClick={() => setMicOn(!micOn)} className="rounded-full w-12 h-12">
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          <Button variant={videoOn ? 'outline' : 'destructive'} size="icon" onClick={() => setVideoOn(!videoOn)} className="rounded-full w-12 h-12">
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button variant="destructive" size="icon" className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-700">
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
