import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, Settings, Sparkles, LogOut } from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-victoria-wine p-2 rounded-lg">
              <Sparkles className="text-victoria-gold" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-victoria-wine leading-none">VICTORIA <span className="text-victoria-gold">ESTRELLA</span></h1>
              <p className="text-[10px] tracking-[0.2em] font-bold text-gray-400 mt-1 uppercase">Joyas de Plata</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-victoria-red transition-colors rounded-lg hover:bg-gray-50"
            title="Cerrar Sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 mb-24 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-4 z-20 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <ul className="max-w-4xl mx-auto flex justify-around items-center">
          <li>
            <NavLink 
              to="/" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'text-victoria-red scale-110' : 'text-gray-400'}`}
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>Inicio</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/vender" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'text-victoria-red scale-110' : 'text-gray-400'}`}
            >
              {({ isActive }) => (
                <>
                  <Receipt size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>Venta</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/historial" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'text-victoria-red scale-110' : 'text-gray-400'}`}
            >
              {({ isActive }) => (
                <>
                  <History size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>Historial</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/materiales" 
              className={({ isActive }) => `flex flex-col items-center gap-1.5 px-4 py-1 rounded-xl transition-all ${isActive ? 'text-victoria-red scale-110' : 'text-gray-400'}`}
            >
              {({ isActive }) => (
                <>
                  <Settings size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>Ajustes</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Layout;
