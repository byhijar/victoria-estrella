import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState({ materialId: '', gramsSold: '', note: '' });
  const [customPrice, setCustomPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const currentUser = localStorage.getItem('victoria_user') || 'Romi';
  const isDemo = localStorage.getItem('victoria_demo_mode') === 'true';
  const selectedMaterial = materials.find(m => m.id === formData.materialId);
  const baseSellPrice = selectedMaterial ? (selectedMaterial.sellPricePerGram || selectedMaterial.pricePerGram || 0) : 0;
  const costPrice = selectedMaterial ? (selectedMaterial.costPricePerGram || 0) : 0;
  
  // Use custom price if user typed something, otherwise use base price
  const activePrice = customPrice !== '' ? parseFloat(customPrice) : baseSellPrice;
  
  const totalPrice = selectedMaterial ? (parseFloat(formData.gramsSold || 0) * activePrice) : 0;
  const totalCost = selectedMaterial ? (parseFloat(formData.gramsSold || 0) * costPrice) : 0;
  const estimatedProfit = totalPrice - totalCost;
  
  const isInsufficientStock = selectedMaterial && parseFloat(formData.gramsSold || 0) > selectedMaterial.currentStockGrams;
  const isBelowCost = selectedMaterial && activePrice < costPrice;
  const isDiscounted = activePrice < baseSellPrice;

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
      if (isDemo) {
        // Simulation for video/content creation
        const demoSale = {
          id: 'demo_' + Date.now(),
          ...formData,
          gramsSold: Number(formData.gramsSold || 0),
          materialName: selectedMaterial.name,
          sellerName: currentUser,
          priceAtTimeOfSale: activePrice,
          totalPrice: Number(totalPrice || 0),
          note: formData.note.trim(),
          type: 'sale',
          createdAt: new Date().toISOString(),
          costPriceAtTimeOfSale: costPrice,
          sellPriceAtTimeOfSale: activePrice,
          isDemo: true
        };
        
        const stored = localStorage.getItem('victoria_demo_sales');
        let existingDemoSales = [];
        try {
          const parsed = stored ? JSON.parse(stored) : [];
          existingDemoSales = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          console.error("Corrupted demo sales, resetting:", e);
        }
        
        localStorage.setItem('victoria_demo_sales', JSON.stringify([demoSale, ...existingDemoSales]));
        
        await new Promise(resolve => setTimeout(resolve, 800));
      } else {
        await registerSale({
          ...formData,
          materialName: selectedMaterial.name,
          sellerName: currentUser,
          priceAtTimeOfSale: activePrice,
          totalPrice: totalPrice,
          note: formData.note.trim()
        });
      }
      
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
              className={`w-full p-4 md:p-6 bg-gray-50 border-2 rounded-[1.5rem] focus:bg-white transition-all text-4xl md:text-5xl font-display font-bold placeholder:text-gray-200 text-center ${isInsufficientStock ? 'border-red-100 text-red-500' : 'border-transparent text-victoria-wine focus:border-victoria-wine'}`}
              placeholder="0.00"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-300">gr</span>
          </div>
        </div>

        {/* Live Calculation Display */}
        {selectedMaterial && formData.gramsSold && (
          <div className={`p-6 rounded-[2rem] border animate-in zoom-in-95 duration-300 ${isBelowCost ? 'bg-red-50 border-red-100' : 'bg-victoria-wine/5 border-victoria-wine/10'}`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isBelowCost ? 'text-red-500' : 'text-victoria-wine/60'}`}>
                {isBelowCost ? '⚠️ Venta bajo costo' : 'Resumen de Venta'}
              </span>
              <Coins className={isBelowCost ? 'text-red-500' : 'text-victoria-gold'} size={16} />
            </div>
            
            <div className="space-y-4">
              {/* Price Adjustment */}
              <div className="flex items-center justify-between bg-white/50 p-3 rounded-xl border border-dashed border-victoria-wine/20">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase">Precio por Gramo</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-victoria-wine">$</span>
                    <input 
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      placeholder={baseSellPrice.toString()}
                      className="w-20 bg-transparent border-0 p-0 text-sm font-bold text-victoria-wine focus:ring-0"
                    />
                  </div>
                </div>
                {isDiscounted && (
                  <span className="text-[10px] font-bold text-victoria-red bg-victoria-red/5 px-2 py-1 rounded-lg">
                    Descuento Aplicado
                  </span>
                )}
              </div>

              {/* Profit Preview */}
              <div className="flex justify-between items-center text-xs">
                 <div className="flex flex-col">
                    <span className="text-gray-400 font-bold uppercase text-[9px]">Gramos x Precio</span>
                    <span className="text-gray-600 font-medium">{formData.gramsSold}g x ${activePrice.toLocaleString('es-CL')}</span>
                 </div>
                 {costPrice > 0 && (
                   <div className="text-right flex flex-col">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Ganancia Neta</span>
                      <span className={`font-black ${estimatedProfit < 0 ? 'text-red-500' : 'text-green-600'}`}>
                        ${estimatedProfit.toLocaleString('es-CL')}
                      </span>
                   </div>
                 )}
              </div>

              <div className="h-[1px] bg-victoria-wine/10 w-full" />
              
              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-bold text-victoria-wine uppercase tracking-tight">Total Cobrar</span>
                <span className={`text-2xl md:text-3xl font-display font-bold tracking-tighter ${isBelowCost ? 'text-red-600' : 'text-victoria-red'}`}>
                  ${totalPrice.toLocaleString('es-CL')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Note Field */}
        {selectedMaterial && (
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Nota o Cliente (Opcional)</label>
            <textarea 
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
              placeholder="Ej: Para la vecina del 2A, descuento por amistad..."
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-sm h-20 resize-none"
            />
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
