// components/DeveloperFooter.tsx
import React from 'react';

export const DeveloperFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full bg-white border-t border-gray-200 text-gray-600 text-xs py-2 px-4 mt-auto">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-1 sm:space-y-0">
          <div className="text-center sm:text-left">
            <span>© {currentYear} CEPEIGE. Todos los derechos reservados.</span>
          </div>
          <div className="text-center sm:text-right">
            <span className="text-gray-500">
              Desarrollado por{' '}
              <span className="font-medium text-gray-700">Denilson Cachiguango</span>
              {' - '}
              <span className="font-medium text-gray-700">Leonardo Obando</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperFooter;