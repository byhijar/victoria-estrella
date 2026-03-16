import React, { useState, useEffect } from 'react';
import { X, User, Lock, Loader2, LogOut } from 'lucide-react';
import { getUser, updateUserProfile } from '../services/userService';

const ProfileModal = ({ isOpen, onClose, onLogout }) => {
  const [userProfile, setUserProfile] = useState({ displayName: '', password: '' });
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchUser = async () => {
        const userId = localStorage.getItem('victoria_userId');
        if (userId) {
          const userData = await getUser(userId);
          if (userData) {
            setUserProfile({ displayName: userData.displayName, password: userData.password });
          }
        }
      };
      fetchUser();
    }
  }, [isOpen]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('victoria_userId');
    if (!userId || !userProfile.displayName.trim()) return;

    setIsUpdating(true);
    setError('');
    try {
      const updates = { displayName: userProfile.displayName.trim() };
      if (newPassword.trim()) {
        updates.password = newPassword.trim();
      }

      await updateUserProfile(userId, updates);
      localStorage.setItem('victoria_user', updates.displayName);
      setNewPassword('');
      alert('Perfil actualizado con éxito');
      window.location.reload();
    } catch (err) {
      setError('Error al actualizar: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
      <div 
        className="absolute inset-0 bg-victoria-wine/20 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="bg-victoria-wine p-2 rounded-xl">
              <User size={18} className="text-victoria-gold" />
            </div>
            <h3 className="font-display font-bold text-victoria-wine">Mi Cuenta</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-victoria-red transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Nombre de Pantalla</label>
            <input 
              type="text" 
              value={userProfile.displayName}
              onChange={(e) => setUserProfile({...userProfile, displayName: e.target.value})}
              className="w-full px-5 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold font-bold text-victoria-wine transition-all"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Nueva Contraseña</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-victoria-gold/30">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold font-sans transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="text-[9px] text-gray-400 text-center uppercase font-bold tracking-tighter">Opcional: Dejar vacío para mantener actual</p>
          </div>

          {error && <p className="text-red-500 text-[10px] font-bold text-center uppercase">{error}</p>}

          <div className="space-y-3 pt-2">
            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-victoria-wine text-white py-4 rounded-2xl font-bold shadow-lg shadow-victoria-wine/10 hover:bg-victoria-red transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isUpdating ? <Loader2 className="animate-spin" size={18} /> : 'Guardar Cambios'}
            </button>
            <button 
              type="button"
              onClick={onLogout}
              className="w-full py-4 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-victoria-red transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={14} />
              Cerrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
