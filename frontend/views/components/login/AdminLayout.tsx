// views/components/AdminLayout.tsx
import React from 'react';
import Image from 'next/image';
import { Users, LogOut, BookOpen, BarChart3 } from 'lucide-react';
import { useAuthController } from '@/controllers/login/useAuthController'; 


interface AdminLayoutProps {
  children: React.ReactNode;
  userType: 'admin' | 'accountant';
  activeModule?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  userType, 
  activeModule = 'inscripciones' 
}) => {
  const { handleLogout, userName, userEmail } = useAuthController();
  const userTypeText = userType === 'admin' ? 'Administrador' : 'Contador';

  const menuItems = [
  {
    id: 'inscripciones',
    label: 'Inscripciones',
    icon: <Users className="h-5 w-5" />,
    href: userType === 'admin' ? '/inscripciones_admin' : '/inscripciones_contador'
  }
];

// 🆕 AGREGAR CURSOS SOLO PARA ADMIN
if (userType === 'admin') {
  menuItems.push({
    id: 'cursos',
    label: 'Gestión de Cursos',
    icon: <BookOpen className="h-5 w-5" />,
    href: '/cursos_admin'
  });
}

// 🆕 AGREGAR INFORMES PARA ADMIN Y CONTADOR
// ✅ COMENTADO TEMPORALMENTE
/* 
menuItems.push({
  id: 'informes',
  label: 'Informes',
  icon: <BarChart3 className="h-5 w-5" />,
  href: '/informes'
});
*/
  

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 py-2">
          {/* Logo y título en móvil */}
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto mb-2 sm:mb-0">
            <Image 
              src="/Logo__cepeige.png" 
              alt="Logo CEPEIGE" 
              width={80}
              height={80}
              className="h-12 sm:h-16 md:h-20 w-auto mr-3"
              priority
            />
            <h1 
              className="text-sm sm:text-lg md:text-2xl font-bold text-center sm:text-left"
              style={{ 
                color: '#0367A6',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700
              }}
            >
              CEPEIGE - {userTypeText}
            </h1>
          </div>
          
          {/* Área de usuario */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                {userName || userTypeText}
              </p>
              <p className="text-xs text-gray-500">
                {userEmail || 'Sistema de Gestión'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside 
          className="w-full lg:w-64 lg:min-h-screen shadow-sm"
          style={{ backgroundColor: '#0367A6' }}
        >
          <nav className="p-3 lg:p-6">
           <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => console.log(`🔗 Navegando a: ${item.href} (${item.label})`)}
                 className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeModule === item.id
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-xs sm:text-sm lg:text-base">{item.label}</span>
                </a>
              ))}
            </div>
          </nav>
        </aside>

        {/* Contenido principal */}
         <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
