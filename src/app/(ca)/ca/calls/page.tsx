'use client';

import { useState } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, Users, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VideoCallRoomPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [inCall, setInCall] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-lime-600" /> LiveKit / Jitsi Consultation Room
          </h1>
          <p className="text-xs text-slate-500 mt-1">Encrypted WebRTC consultation room for client tax reviews and screen sharing.</p>
        </div>
      </div>

      {!inCall ? (
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-lime-600/10 text-lime-600 rounded-2xl mx-auto flex items-center justify-center border border-lime-600/20">
            <Video className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Tax Consultation Room #TM-8920</h2>
            <p className="text-xs text-slate-500 mt-1">Client: TechNova Solutions Pvt Ltd | Scheduled: 22 Oct 2026</p>
          </div>

          <Button onClick={() => setInCall(true)} className="w-full bg-lime-600 hover:bg-lime-500 text-white font-semibold py-3 rounded-xl shadow-md shadow-lime-600/20">
            Join Consultation Call
          </Button>
        </div>
      ) : (
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 space-y-4 p-4 min-h-[550px] flex flex-col justify-between">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-lime-600 text-white text-xl font-bold mx-auto flex items-center justify-center">
                  RS
                </div>
                <p className="text-xs font-semibold text-white">CA Rajesh Sharma (You)</p>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-300 text-xl font-bold mx-auto flex items-center justify-center border border-slate-700">
                  TN
                </div>
                <p className="text-xs font-semibold text-slate-300">TechNova Client Representative</p>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex items-center justify-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 max-w-md mx-auto">
            <Button
              variant="ghost"
              onClick={() => setIsMuted(!isMuted)}
              className={`rounded-full w-10 h-10 p-0 ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white'}`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsVideoOff(!isVideoOff)}
              className={`rounded-full w-10 h-10 p-0 ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-white'}`}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" className="rounded-full w-10 h-10 p-0 bg-slate-800 text-white">
              <Monitor className="w-5 h-5" />
            </Button>
            <Button onClick={() => setInCall(false)} className="rounded-full bg-red-600 hover:bg-red-500 text-white px-5">
              <PhoneOff className="w-4 h-4 mr-2" /> End Call
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
