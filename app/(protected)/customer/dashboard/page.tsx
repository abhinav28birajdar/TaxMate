import AuthGuard from '@/components/auth/AuthGuard';
import CustomerDashboard from '@/components/customer/CustomerDashboard';

export default function Page() {
  return (
    <AuthGuard requiredRole="customer">
      <CustomerDashboard />
    </AuthGuard>
  );
}