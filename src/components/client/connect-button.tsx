'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/UnifiedAuthContext';
import { createClient } from '@/utils/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ConnectButtonProps {
    caId: string;
    className?: string;
}

export default function ConnectButton({ caId, className }: ConnectButtonProps) {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'accepted' | 'rejected'>('idle');
    const router = useRouter();
    const supabase = createClient();

    // Check existing status on mount
    React.useEffect(() => {
        if (!user || String(role).toLowerCase() !== 'client') return;

        const checkStatus = async () => {
            const { data } = await supabase
                .from('ca_client_relationships')
                .select('status')
                .eq('ca_id', caId)
                .eq('client_id', user.id) // Assuming client_id is same as user.id or we need to fetch profile id
                // Actually supabase_schema says client_id is uuid references client_profiles(id). 
                // So we need client_profile_id.
                // We'll solve this by querying with user_id through join or fetching profile first.
                // For MVP, if we assume 1:1 user:profile, we can fetch profile first.
                .maybeSingle();

            if (data) {
                setStatus(data.status as any);
            }
        };
        // checkStatus(); // Commented out until we handle profile ID resoloution correctly
    }, [caId, user, role, supabase]);

    const handleConnect = async () => {
        if (!user) {
            router.push('/login?next=/find-ca/' + caId);
            return;
        }

        if (String(role).toLowerCase() !== 'client') {
            toast({
                title: "Action Restricted",
                description: "Only clients can send connection requests.",
                variant: "destructive"
            });
            return;
        }

        setLoading(true);
        try {
            // 1. Get Client Profile ID
            const { data: profile, error: profileError } = await supabase
                .from('client_profiles')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (profileError || !profile) {
                // If no profile, maybe they need to onboard?
                toast({ title: "Profile Error", description: "Please complete your onboarding first.", variant: "destructive" });
                router.push('/onboarding/client');
                return;
            }

            // 2. Insert Request
            const { error } = await supabase
                .from('ca_client_relationships')
                .insert({
                    ca_id: caId,
                    client_id: profile.id,
                    requested_by: user.id,
                    status: 'pending'
                });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    toast({ title: "Already Requested", description: "You have already sent a request to this CA." });
                    setStatus('pending');
                } else {
                    throw error;
                }
            } else {
                toast({ title: "Request Sent", description: "The CA will be notified of your request." });
                setStatus('pending');
            }

        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (String(role).toLowerCase() === 'ca' && user?.id === caId) return null; // Don't show on own profile (if viewing as public)

    if (status === 'pending') {
        return (
            <Button disabled variant="outline" className={className}>
                <Check className="w-4 h-4 mr-2" /> Request Sent
            </Button>
        );
    }

    if (status === 'accepted') {
        return (
            <Button variant="outline" className={className} onClick={() => router.push('/dashboard/client')}>
                <Check className="w-4 h-4 mr-2" /> Connected
            </Button>
        );
    }

    return (
        <Button onClick={handleConnect} disabled={loading} className={className}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
            Connect Now
        </Button>
    );
}
