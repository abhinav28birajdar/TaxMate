import AuthGuard from '@/components/auth/AuthGuard';
import CADashboard from '@/components/ca/CADashboard';

export default function Page() {
  return (
    <AuthGuard requiredRole="ca">
      <CADashboard />
    </AuthGuard>
  );
}