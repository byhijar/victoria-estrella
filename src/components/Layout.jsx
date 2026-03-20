import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, Box, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import ProfileModal from './ProfileModal';

const Layout = ({ children, onLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const isDemo = localStorage.getItem('victoria_demo_mode') === 'true';

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-victoria-wine p-2 rounded-lg shrink-0">
              <Sparkles className="text-victoria-gold" size={20} />
            </div>
            <div className="min-w-0 flex items-center gap-2">
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-display font-bold text-victoria-wine leading-none truncate">
                  <span className="hidden sm:inline">VICTORIA </span>
                  <span className="text-victoria-gold">ESTRELLA</span>
                </h1>
                <div className="flex items-center gap-2">
                  <p className="text-[8px] md:text-[10px] tracking-[0.2em] font-bold text-gray-400 mt-1 uppercase truncate font-sans">Joyas de Plata</p>
                  <span className="text-[7px] font-black text-victoria-wine/30 mt-1 border border-victoria-wine/10 px-1 rounded uppercase tracking-tighter">v1.3.0</span>
                </div>
              </div>
              {isDemo && (
                <span className="bg-victoria-gold/10 text-victoria-gold text-[7px] font-black px-1.5 py-0.5 rounded border border-victoria-gold/20 animate-pulse whitespace-nowrap">MODO DEMO</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 md:gap-3 p-1 md:p-1.5 md:pr-4 md:pl-1.5 rounded-2xl bg-gray-50/50 hover:bg-victoria-wine/5 border border-transparent hover:border-victoria-wine/10 transition-all group"
            >
              <div className="w-8 h-8 rounded-xl bg-victoria-wine flex items-center justify-center shadow-lg shadow-victoria-wine/10 shrink-0">
                <UserIcon size={16} className="text-victoria-gold" />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="hidden xs:block text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cuenta</span>
                <span className="text-xs font-bold text-victoria-wine mt-0.5 group-hover:text-victoria-red transition-colors truncate max-w-[80px]">
                  {localStorage.getItem('victoria_user') || 'Usuario'}
                </span>
              </div>
            </button>
            <button 
              onClick={onLogout}
              className="p-2 text-gray-300 hover:text-victoria-red transition-colors rounded-xl hidden sm:block"
              title="Cerrar Sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        onLogout={onLogout} 
      />

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
                  <Box size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>Inventario</span>
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
