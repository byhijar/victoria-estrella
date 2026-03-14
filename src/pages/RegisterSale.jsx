import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterials } from '../hooks/useMaterials';
import { registerSale } from '../services/saleService';
import { Loader2, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const RegisterSale = () => {
  const navigate = useNavigate();
  const { materials, loading } = useMaterials();
  const [formData, setFormData] = useState({ materialId: '', gramsSold: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.gramsSold) {
      setStatus({ type: 'error', message: 'Completa todos los campos' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const selectedMaterial = materials.find(m => m.id === formData.materialId);
      await registerSale({
        ...formData,
        materialName: selectedMaterial.name
      });
      
      setStatus({ type: 'success', message: '¡Venta exitosa!' });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-victoria-red" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold text-victoria-wine">Nueva Venta</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registra gramos vendidos</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2 flex items-center gap-2">
            <ShoppingBag size={12} /> Seleccionar Material
          </label>
          <div className="relative group">
            <select 
              value={formData.materialId}
              onChange={(e) => setFormData({...formData, materialId: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-victoria-gold transition-all text-lg font-medium appearance-none"
            >
              <option value="">¿Qué se vendió?</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.currentStockGrams.toFixed(1)}g)</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:rotate-90 transition-transform">
              <ArrowRight size={20} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Gramos Vendidos</label>
          <div className="relative group">
             <input 
              type="number" 
              step="0.01"
              value={formData.gramsSold}
              onChange={(e) => setFormData({...formData, gramsSold: e.target.value})}
              className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-victoria-wine transition-all text-4xl font-display font-bold placeholder:text-gray-200"
              placeholder="0.00"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">gr</span>
          </div>
        </div>

        {status.message && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-bold text-sm tracking-tight">{status.message}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full py-6 bg-victoria-wine text-white rounded-[1.8rem] font-bold text-xl shadow-2xl shadow-victoria-wine/20 active:scale-[0.97] transition-all disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-victoria-red translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-2">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Registrar Venta'}
          </span>
        </button>
      </form>
    </div>
  );
};

export default RegisterSale;
