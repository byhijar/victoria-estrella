import React, { useState } from 'react';
import { Sparkles, Lock, Loader2 } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // For the MVP, we use a simple but effective access control
    // In a real production environment, this would use Firebase Auth
    setTimeout(() => {
      if (password === 'victoria2025') {
        onLogin();
      } else {
        setError('Acceso denegado. Contraseña incorrecta.');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-1000">
        <div className="text-center mb-10">
          <div className="bg-victoria-wine w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-victoria-wine/20">
            <Sparkles className="text-victoria-gold" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-victoria-wine leading-tight uppercase tracking-tighter">
            VICTORIA <span className="text-victoria-gold">ESTRELLA</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Joyas de Plata</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_30px_60px_rgba(139,0,0,0.08)] border border-gray-50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-center mb-4">
              <h2 className="text-lg font-bold text-gray-800 tracking-tight">Acceso Privado</h2>
              <p className="text-xs text-gray-400">Ingresa la clave para gestionar tu inventario</p>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-victoria-gold group-focus-within:text-victoria-red transition-colors">
                <Lock size={18} />
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg transition-all"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-xs font-bold text-center animate-bounce">
                {error}
              </p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-victoria-wine text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-victoria-wine/20 hover:bg-victoria-red transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-12">
          Victoria Estrella © 2026 • Acceso Restringido
        </p>
      </div>
    </div>
  );
};

export default Login;
