import AuthGuard from '@/components/auth/AuthGuard';
import DocumentManagement from '@/components/business/DocumentManagement';

export default function Page() {
  return (
    <AuthGuard requiredRole="business">
      <DocumentManagement />
    </AuthGuard>
  );
}