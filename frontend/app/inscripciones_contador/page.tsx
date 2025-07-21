// app/inscripciones_contador/page.tsx
import AccountantInscriptionsView from '@/views/AccountantInscriptionsView';
import { AuthGuard } from '@/views/components/AuthGuard';

export default function AccountantInscriptionsPage() {
   return (
    <AuthGuard requiredRole="accountant"> {/* 🆕 PROTEGER RUTA */}
      <AccountantInscriptionsView />
    </AuthGuard>
  );
}
