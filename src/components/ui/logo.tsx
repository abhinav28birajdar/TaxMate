import { Briefcase } from 'lucide-react';
import Link from 'next/link';

export const Logo = ({ className = "" }: { className?: string }) => {
    return (
        <Link href="/" className={`flex items-center gap-2 ${className}`}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">
                TaxMate
            </span>
        </Link>
    );
};
