
// app/cursos_admin/page.tsx - CREAR ARCHIVO

import CourseAdminView from '@/views/CourseAdminView';
import { AuthGuard } from '@/views/components/login/AuthGuard';

export default function CourseAdminPage() {
 return (
    <AuthGuard requiredRole="admin"> {/* 🆕 PROTEGER RUTA */}
      <CourseAdminView />
    </AuthGuard>
  );
}
