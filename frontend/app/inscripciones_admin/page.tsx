// app/inscripciones_admin/page.tsx
import AdminInscriptionsView from '@/views/AdminInscriptionsView';
import { AuthGuard } from '@/views/components/AuthGuard';

export default function AdminInscriptionsPage() {
  return (
    <AuthGuard requiredRole="admin"> 
      <AdminInscriptionsView />
    </AuthGuard>
  );
}
