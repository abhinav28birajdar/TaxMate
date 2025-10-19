import AuthGuard from '@/components/auth/AuthGuard';
import ComplianceCalendar from '@/components/business/ComplianceCalendar';

export default function Page() {
  return (
    <AuthGuard requiredRole="business">
      <ComplianceCalendar />
    </AuthGuard>
  );
}