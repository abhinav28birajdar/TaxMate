import AuthGuard from '@/components/auth/AuthGuard';
import Billing from '@/components/business/Billing';

export default function Page() {
  return (
    <AuthGuard requiredRole="business">
      <Billing />
    </AuthGuard>
  );
}