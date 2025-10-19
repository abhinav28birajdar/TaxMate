import AuthGuard from '@/components/auth/AuthGuard';
import BusinessDashboard from '@/components/business/BusinessDashboard';

export default function Page() {
  return (
    <AuthGuard requiredRole="business">
      <BusinessDashboard />
    </AuthGuard>
  );
}