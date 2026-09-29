'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MonitorUp, 
  PhoneOff, 
  Users, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Circle,
  FileText,
  Send,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ClientCallRoomPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params?.callId as string || 'CALL-901';

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'CA Rajesh Sharma', text: 'Welcome to the consultation! Please share any notice or ledger files you would like us to review.' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleEndCall = () => {
    toast.info('Consultation session ended. Thank you for using TaxMate.');
    router.push('/client/dashboard');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { sender: 'You (Client)', text: chatInput }]);
    setChatInput('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-slate-950 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      
      {/* Top Overlay Bar */}
      <div className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Badge className="bg-lime-600/20 text-lime-400 border-lime-500/30 text-xs font-bold flex items-center gap-1.5">
            <Circle className="w-2 h-2 fill-lime-400 text-lime-400 animate-pulse" /> Encrypted Consultation
          </Badge>
          <span className="text-xs text-slate-400 font-mono">Room #{callId}</span>
          <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
            <Clock className="w-3.5 h-3.5 text-lime-500" /> {formatDuration(callDuration)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowChat(!showChat)}
            className="text-xs text-slate-300 hover:text-white"
          >
            <MessageSquare className="w-4 h-4 mr-1.5 text-lime-500" /> Meeting Chat ({messages.length})
          </Button>
        </div>
      </div>

      {/* Main Video Stage & Chat Drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center bg-slate-900/40">
          
          {/* Tile 1: CA Doctor / Professional */}
          <div className="h-full min-h-[260px] bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop"
              alt="CA Rajesh Sharma"
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500" />
              CA Rajesh Sharma, FCA (Assigned CA)
            </div>
          </div>

          {/* Tile 2: Client Self View */}
          <div className="h-full min-h-[260px] bg-slate-900 border border-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center group shadow-lg">
            {videoOn ? (
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&h=600&fit=crop"
                alt="Client Self View"
                className="w-full h-full object-cover opacity-90"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <VideoOff className="w-10 h-10" />
                <span className="text-xs">Your Camera is Off</span>
              </div>
            )}
            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-lime-500" />
              You (Client)
            </div>
          </div>
        </div>

        {/* In-Call Side Chat */}
        {showChat && (
          <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col p-4 space-y-3 z-20">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">In-Call Messages</h3>
            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {messages.map((m, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-800/80 space-y-0.5">
                  <span className="font-bold text-lime-400 text-[11px] block">{m.sender}</span>
                  <p className="text-slate-300 leading-snug">{m.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={handleSendChat} className="flex gap-2">
              <Input
                placeholder="Ask CA a question..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="bg-slate-950 border-slate-800 text-xs text-white rounded-xl"
              />
              <Button size="sm" type="submit" className="bg-lime-600 hover:bg-lime-500 text-white rounded-xl px-3">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="p-4 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex items-center justify-center gap-3 z-20">
        <Button
          variant={micOn ? 'secondary' : 'destructive'}
          size="sm"
          onClick={() => setMicOn(!micOn)}
          className="rounded-2xl p-3 w-12 h-12"
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={videoOn ? 'secondary' : 'destructive'}
          size="sm"
          onClick={() => setVideoOn(!videoOn)}
          className="rounded-2xl p-3 w-12 h-12"
        >
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={screenSharing ? 'default' : 'secondary'}
          size="sm"
          onClick={() => {
            setScreenSharing(!screenSharing);
            toast.info(screenSharing ? 'Screen sharing stopped' : 'Sharing your screen with CA');
          }}
          className={`rounded-2xl p-3 w-12 h-12 ${screenSharing ? 'bg-lime-600 hover:bg-lime-500 text-white' : ''}`}
        >
          <MonitorUp className="w-5 h-5" />
        </Button>

        <Button
          variant="destructive"
          size="sm"
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl px-6 h-12 text-xs flex items-center gap-2"
        >
          <PhoneOff className="w-5 h-5" /> Leave Consultation
        </Button>
      </div>

    </div>
  );
}
