import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterials } from '../hooks/useMaterials';
import { registerSale } from '../services/saleService';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ShoppingBag, 
  ArrowRight, 
  User, 
  Coins 
} from 'lucide-react';

const RegisterSale = () => {
  const navigate = useNavigate();
  const { materials, loading } = useMaterials();
  const [formData, setFormData] = useState({ materialId: '', gramsSold: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const currentUser = localStorage.getItem('victoria_user') || 'Romi';
  const selectedMaterial = materials.find(m => m.id === formData.materialId);
  const totalPrice = selectedMaterial ? (parseFloat(formData.gramsSold || 0) * (selectedMaterial.pricePerGram || 0)) : 0;
  const isInsufficientStock = selectedMaterial && parseFloat(formData.gramsSold || 0) > selectedMaterial.currentStockGrams;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.materialId || !formData.gramsSold) {
      setStatus({ type: 'error', message: 'Completa todos los campos' });
      return;
    }

    if (isInsufficientStock) {
      setStatus({ type: 'error', message: 'No hay stock suficiente para esta venta' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      await registerSale({
        ...formData,
        materialName: selectedMaterial.name,
        sellerName: currentUser
      });
      
      setStatus({ type: 'success', message: '¡Venta registrada con éxito!' });
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
    <div className="max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-bold text-victoria-wine tracking-tight">Nueva Venta</h2>
          <div className="flex items-center gap-1.5">
            <User size={12} className="text-victoria-gold" />
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Vendedor: <span className="text-victoria-wine">{currentUser}</span>
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-victoria-wine/5 rounded-2xl flex items-center justify-center text-victoria-wine">
           <ShoppingBag size={24} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 space-y-8">
        {/* Material Selection */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2 block">
            ¿Qué se vendió?
          </label>
          <div className="grid grid-cols-1 gap-3">
            <select 
              value={formData.materialId}
              onChange={(e) => setFormData({...formData, materialId: e.target.value})}
              className="w-full p-5 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-victoria-gold transition-all text-sm font-bold appearance-none"
            >
              <option value="">Selecciona una joya...</option>
              {materials.filter(m => !m.deleted).map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} (Disp: {m.currentStockGrams.toFixed(1)}g)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-3">
          <div className="flex justify-between items-center ml-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold">Gramos Vendidos</label>
            {selectedMaterial && (
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isInsufficientStock ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                Disponible: {selectedMaterial.currentStockGrams.toFixed(1)}g
              </span>
            )}
          </div>
          <div className="relative group">
             <input 
              type="number" 
              step="0.01"
              value={formData.gramsSold}
              onChange={(e) => setFormData({...formData, gramsSold: e.target.value})}
              className={`w-full p-6 bg-gray-50 border-2 rounded-[1.5rem] focus:bg-white transition-all text-5xl font-display font-bold placeholder:text-gray-200 text-center ${isInsufficientStock ? 'border-red-100 text-red-500' : 'border-transparent text-victoria-wine focus:border-victoria-wine'}`}
              placeholder="0.00"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">gr</span>
          </div>
        </div>

        {/* Live Calculation Display */}
        {selectedMaterial && formData.gramsSold && (
          <div className="bg-victoria-wine/5 p-6 rounded-[2rem] border border-victoria-wine/10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-victoria-wine/60 uppercase tracking-widest">Resumen de Venta</span>
              <Coins className="text-victoria-gold" size={16} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">{formData.gramsSold}g x ${selectedMaterial.pricePerGram}/g</span>
                <span className="font-bold text-gray-700">${totalPrice.toLocaleString('es-CL')}</span>
              </div>
              <div className="h-[1px] bg-victoria-wine/10 w-full" />
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-victoria-wine uppercase tracking-tight">Total Cobrar</span>
                <span className="text-3xl font-display font-bold text-victoria-red tracking-tighter">
                  ${totalPrice.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </div>
        )}

        {status.message && (
          <div className={`p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            <p className="font-bold text-sm tracking-tight">{status.message}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting || isInsufficientStock || !formData.gramsSold}
          className="w-full py-6 bg-victoria-wine text-white rounded-[1.8rem] font-bold text-xl shadow-2xl shadow-victoria-wine/20 active:scale-[0.97] transition-all disabled:opacity-30 disabled:grayscale disabled:active:scale-100 flex justify-center items-center gap-3 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-victoria-red translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <span className="relative z-10 flex items-center gap-3">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                Confirmar Venta
                <ArrowRight size={20} />
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
};

export default RegisterSale;
