import AuthGuard from '@/components/auth/AuthGuard';
import TeamManagement from '@/components/business/TeamManagement';

export default function Page() {
  return (
    <AuthGuard requiredRole="business">
      <TeamManagement />
    </AuthGuard>
  );
}