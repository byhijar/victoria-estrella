import React, { useState } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { addMaterial, deleteMaterial, updateMaterial } from '../services/materialService';
import { restockMaterial } from '../services/saleService';
import { Plus, Trash2, Edit2, Loader2, Sparkles, PackagePlus, AlertCircle, ArrowUpCircle } from 'lucide-react';

const VictoriaMaterials = [
  'Plata con oro',
  'Plata italiana',
  'Plata nacional',
  'Plata peruana',
  'Microcircon'
];

const Materials = () => {
  const { materials, loading } = useMaterials();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ name: '', initialStockGrams: '' });
  const [restockData, setRestockData] = useState({ materialId: '', materialName: '', gramsAdded: '' });
  const [editingId, setEditingId] = useState(null);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.initialStockGrams) {
      setError('Completa todos los campos');
      return;
    }

    // Duplicate check
    const normalizedNewName = formData.name.trim().toLowerCase();
    const isDuplicate = materials.some(m => 
      m.name.trim().toLowerCase() === normalizedNewName && m.id !== editingId
    );

    if (isDuplicate) {
      setError('Este material ya existe en el inventario');
      return;
    }

    try {
      if (editingId) {
        await updateMaterial(editingId, {
          name: formData.name.trim(),
          initialStockGrams: parseFloat(formData.initialStockGrams),
          // We also update currentStock if it's the same as initial, otherwise it might be tricky
          // For MVP, we'll just update initial and name.
        });
      } else {
        await addMaterial(formData);
      }
      setFormData({ name: '', initialStockGrams: '' });
      setIsAdding(false);
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleEdit = (material) => {
    setFormData({ name: material.name, initialStockGrams: material.initialStockGrams });
    setEditingId(material.id);
    setIsAdding(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este material?')) {
      try {
        await deleteMaterial(id);
      } catch (err) {
        setError('Error al eliminar: ' + err.message);
      }
    }
  };

  const handleRestockInitiate = (material) => {
    setRestockData({ materialId: material.id, materialName: material.name, gramsAdded: '' });
    setIsRestocking(true);
    setError('');
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockData.gramsAdded) return;
    
    setIsInitializing(true);
    try {
      await restockMaterial(restockData);
      setIsRestocking(false);
      setRestockData({ materialId: '', materialName: '', gramsAdded: '' });
    } catch (err) {
      setError('Error al sumar stock: ' + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const initializeDefaultMaterials = async () => {
    setIsInitializing(true);
    try {
      for (const name of VictoriaMaterials) {
        if (!materials.some(m => m.name === name)) {
          await addMaterial({ name, initialStockGrams: 0 });
        }
      }
    } catch (err) {
      setError('Error al inicializar: ' + err.message);
    } finally {
      setIsInitializing(false);
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-display font-bold text-victoria-wine">Configuración</h2>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Gestiona tus tipos de joyas</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-victoria-wine text-white p-4 rounded-2xl shadow-xl shadow-victoria-wine/20 hover:bg-victoria-red transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      {materials.length === 0 && !isAdding && (
         <div className="bg-victoria-wine/5 border border-victoria-wine/10 p-8 rounded-[2rem] text-center space-y-6">
            <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="text-victoria-gold" size={32} />
            </div>
            <div className="space-y-2">
               <h3 className="text-xl font-display font-bold text-victoria-wine">¿Empezamos el Inventario?</h3>
               <p className="text-sm text-gray-500 max-w-xs mx-auto">Configura los materiales básicos de Victoria Estrella con un solo clic.</p>
            </div>
            <button 
              onClick={initializeDefaultMaterials}
              disabled={isInitializing}
              className="bg-victoria-gold text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              {isInitializing ? <Loader2 className="animate-spin" size={20} /> : <PackagePlus size={20} />}
              Inicializar Victoria Estrella
            </button>
         </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <h3 className="font-display font-bold text-xl text-victoria-wine">
            {editingId ? 'Editar Material' : 'Nuevo Tipo de Joya'}
          </h3>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Nombre del Material</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg"
              placeholder="Ej: Plata con oro"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Stock Inicial (gramos)</label>
            <input 
              type="number" 
              value={formData.initialStockGrams}
              onChange={(e) => setFormData({...formData, initialStockGrams: e.target.value})}
              className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg"
              placeholder="0"
            />
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ name: '', initialStockGrams: '' });
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-victoria-wine text-white rounded-2xl font-bold shadow-lg shadow-victoria-wine/20"
            >
              Guardar
            </button>
          </div>
        </form>
      )}

      {isRestocking && (
         <form onSubmit={handleRestockSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,128,0,0.04)] border border-green-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-3">
               <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                  <ArrowUpCircle size={24} />
               </div>
               <h3 className="font-display font-bold text-xl text-gray-800">Cargar Stock: <span className="text-green-600 capitalize">{restockData.materialName}</span></h3>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-2">Gramos para Agregar</label>
              <input 
                type="number" 
                step="0.01"
                value={restockData.gramsAdded}
                onChange={(e) => setRestockData({...restockData, gramsAdded: e.target.value})}
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-green-500 text-lg"
                placeholder="0.00"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsRestocking(false)}
                className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={isInitializing}
                className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 flex items-center justify-center"
              >
                {isInitializing ? <Loader2 className="animate-spin" size={20} /> : 'Sumar al Inventario'}
              </button>
            </div>
         </form>
      )}

      <div className="grid gap-4">
        {materials.filter(m => !m.deleted).map((material) => (
          <div key={material.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center group hover:border-victoria-gold/20 transition-all">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-victoria-wine/5 rounded-2xl flex items-center justify-center text-victoria-wine font-bold">
                  {material.name.charAt(0)}
               </div>
               <div>
                 <h4 className="font-bold text-gray-800 tracking-tight">{material.name}</h4>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Base: {material.initialStockGrams}g</p>
               </div>
            </div>
            <div className="flex gap-1">
              <button 
                onClick={() => handleRestockInitiate(material)}
                className="p-3 text-gray-300 hover:text-green-600 transition-colors"
                title="Sumar Stock"
              >
                <ArrowUpCircle size={18} />
              </button>
              <button 
                onClick={() => handleEdit(material)}
                className="p-3 text-gray-300 hover:text-victoria-gold transition-colors"
                title="Editar"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(material.id)}
                className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Materials;
