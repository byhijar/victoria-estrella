import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, AlertCircle, Coins, Loader2 } from 'lucide-react';

const EditSaleModal = ({ isOpen, onClose, sale, onSave, onVoid, isUpdating }) => {
  const [formData, setFormData] = useState({
    gramsSold: '',
    pricePerGram: '',
    reason: '',
    note: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (sale) {
      setFormData({
        gramsSold: sale.gramsSold?.toString() || '',
        pricePerGram: (sale.sellPriceAtTimeOfSale || (sale.totalPrice / sale.gramsSold) || 0).toString(),
        reason: '',
        note: sale.note || ''
      });
      setError('');
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const currentTotal = parseFloat(formData.gramsSold || 0) * parseFloat(formData.pricePerGram || 0);
  const isValid = formData.gramsSold > 0 && formData.pricePerGram > 0 && formData.reason.length > 3;

  const handleSave = () => {
    if (!isValid) {
      setError('Por favor, ingresa un motivo válido (mín. 4 caracteres) y valores positivos.');
      return;
    }
    onSave({
      gramsSold: parseFloat(formData.gramsSold),
      sellPriceAtTimeOfSale: parseFloat(formData.pricePerGram),
      totalPrice: currentTotal,
      note: formData.note
    }, formData.reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-victoria-wine/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-victoria-wine p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-display font-bold">Editar Registro</h3>
            <p className="text-[10px] text-victoria-gold uppercase tracking-widest font-bold opacity-80 mt-1">
              {sale.materialName} • {new Date(sale.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Gramos</label>
              <div className="relative">
                <input 
                  type="number"
                  step="0.01"
                  value={formData.gramsSold}
                  onChange={(e) => setFormData({...formData, gramsSold: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-victoria-gold transition-all font-bold text-victoria-wine"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">GR</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Precio /g</label>
              <div className="relative">
                <input 
                  type="number"
                  value={formData.pricePerGram}
                  onChange={(e) => setFormData({...formData, pricePerGram: e.target.value})}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-victoria-gold transition-all font-bold text-victoria-wine"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">$</span>
              </div>
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-victoria-wine/5 p-5 rounded-[2rem] border border-victoria-wine/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-victoria-wine/60 uppercase tracking-widest block mb-1">Nuevo Total</span>
              <span className="text-2xl font-display font-bold text-victoria-red">
                ${currentTotal.toLocaleString('es-CL')}
              </span>
            </div>
            <div className="bg-white p-3 rounded-2xl shadow-sm">
                <Coins size={20} className="text-victoria-gold" />
            </div>
          </div>

          {/* Reason & Note */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-victoria-wine uppercase tracking-widest ml-1">Motivo del Cambio</label>
              <input 
                type="text"
                placeholder="Ej: Error al digitar precio..."
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-victoria-gold transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nota Pública (Opcional)</label>
              <textarea 
                value={formData.note}
                onChange={(e) => setFormData({...formData, note: e.target.value})}
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-sm h-20 resize-none"
                placeholder="Esta nota reemplazará la original..."
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
                if (formData.reason.length < 4) {
                    setError('Ingresa un motivo para la anulación');
                    return;
                }
                onVoid(formData.reason);
            }}
            disabled={isUpdating}
            className="flex-1 py-4 px-6 border-2 border-red-100 text-red-500 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Trash2 size={14} /> Anular Venta
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating || !isValid}
            className="flex-1 py-4 px-6 bg-victoria-wine text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-victoria-wine/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
          >
            {isUpdating ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSaleModal;
