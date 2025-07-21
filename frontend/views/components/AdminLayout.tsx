// views/components/AdminLayout.tsx
import React from 'react';
import { Users, FileText, Settings, LogOut,BookOpen             } from 'lucide-react';
import { useAuthController } from '@/controllers/useAuthController'; 


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
  

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-2">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo__cepeige.png" 
              alt="Logo CEPEIGE" 
              className="h-30 w-auto"
            />
          </div>
          
          {/* Título central */}
          <div className="flex-1 text-center">
            <h1 
              className="text-2xl font-bold"
              style={{ 
                color: '#0367A6',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700
              }}
            >
              Bienvenido CEPEIGE - {userTypeText}
            </h1>
          </div>
          
          {/* Área de usuario */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
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
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <aside 
          className="w-full lg:w-64 min-h-screen shadow-sm lg:min-h-screen"
          style={{ backgroundColor: '#0367A6' }}
        >
          <nav className="p-4 lg:p-6">
           <div className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-3 overflow-x-auto lg:overflow-x-visible">
              {menuItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                 className={`flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                    activeModule === item.id
                      ? 'bg-white text-gray-900 shadow-md'
                      : 'text-white hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm lg:text-base">{item.label}</span>
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
