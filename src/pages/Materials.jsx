import React, { useState } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { addMaterial, deleteMaterial, updateMaterial, wipeAllData } from '../services/materialService';
import { restockMaterial } from '../services/saleService';
import { Plus, Trash2, Edit2, Loader2, Sparkles, PackagePlus, ArrowUpCircle, Search, User } from 'lucide-react';
import { useSales } from '../hooks/useSales';

const VictoriaMaterials = [
  { name: 'Plata con Oro', pricePerGram: 8500, initialStock: 50, minThreshold: 20 },
  { name: 'Plata Italiana 925', pricePerGram: 6500, initialStock: 100, minThreshold: 30 },
  { name: 'Plata Nacional 925', pricePerGram: 5500, initialStock: 80, minThreshold: 25 },
  { name: 'Plata Peruana', pricePerGram: 4500, initialStock: 60, minThreshold: 20 },
  { name: 'Microcircon Premium', pricePerGram: 12000, initialStock: 30, minThreshold: 10 },
  { name: 'Acero Blanco', pricePerGram: 2500, initialStock: 150, minThreshold: 40 }
];

const Materials = () => {
  const { materials, loading: loadingMaterials } = useMaterials();
  const { sales, loading: loadingSales } = useSales();
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    initialStockGrams: '', 
    pricePerGram: '',
    minStockThreshold: '' 
  });
  const [restockData, setRestockData] = useState({ materialId: '', materialName: '', gramsAdded: '' });
  const [editingId, setEditingId] = useState(null);
  const [isRestocking, setIsRestocking] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState('');
  
  // Profile State
  const [profileName, setProfileName] = useState(localStorage.getItem('victoria_user') || '');

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    localStorage.setItem('victoria_user', profileName.trim());
    alert('Nombre de perfil actualizado');
    window.location.reload(); // Sync header
  };

  // Calculate total sold per material
  const salesByMaterial = sales.reduce((acc, s) => {
    if (s.type === 'restock') return acc;
    acc[s.materialId] = (acc[s.materialId] || 0) + (s.gramsSold || 0);
    return acc;
  }, {});

  const filteredMaterials = (materials || [])
    .filter(m => !m.deleted)
    .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
      const materialData = {
        name: formData.name.trim(),
        initialStockGrams: parseFloat(formData.initialStockGrams),
        pricePerGram: parseFloat(formData.pricePerGram || 0),
        minStockThreshold: parseFloat(formData.minStockThreshold || 20)
      };

      if (editingId) {
        await updateMaterial(editingId, materialData);
      } else {
        await addMaterial(materialData);
      }
      setFormData({ name: '', initialStockGrams: '', pricePerGram: '', minStockThreshold: '' });
      setIsAdding(false);
      setEditingId(null);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleEdit = (material) => {
    setFormData({ 
      name: material.name, 
      initialStockGrams: material.initialStockGrams,
      pricePerGram: material.pricePerGram || '',
      minStockThreshold: material.minStockThreshold || '20'
    });
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

  const handleMasterReset = async () => {
    if (window.confirm('🚨 ¡ATENCIÓN! Esto borrará TODAS las ventas y materiales permanentemente. No lo hagas si no estás seguro.')) {
      if (window.confirm('Confirma una segunda vez. Esta acción es definitiva.')) {
        setIsInitializing(true);
        try {
          await wipeAllData();
          alert('Sistema reseteado a 0. La página se recargará.');
          window.location.reload();
        } catch (err) {
          setError('Error: ' + err.message);
        } finally {
          setIsInitializing(false);
        }
      }
    }
  };

  const initializeDefaultMaterials = async () => {
    setIsInitializing(true);
    try {
      for (const material of VictoriaMaterials) {
        if (!materials.some(m => m.name.toLowerCase() === material.name.toLowerCase())) {
          await addMaterial({ 
            name: material.name, 
            initialStockGrams: material.initialStock, 
            pricePerGram: material.pricePerGram,
            minStockThreshold: material.minThreshold 
          });
        }
      }
    } catch (err) {
      setError('Error al inicializar: ' + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  if (loadingMaterials || loadingSales) {
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
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Personalización y Gestión</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-victoria-wine text-white p-4 rounded-2xl shadow-xl shadow-victoria-wine/20 hover:bg-victoria-red transition-all active:scale-95"
        >
          {isAdding ? <PackagePlus className="rotate-45" size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {/* Profile Section */}
      {!isAdding && (
        <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-victoria-gold" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Identidad del Vendedor</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="flex gap-3">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full pl-5 pr-4 py-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold font-bold text-victoria-wine transition-all"
                placeholder="Tu nombre o alias"
              />
            </div>
            <button 
              type="submit"
              className="bg-victoria-wine text-white px-8 rounded-2xl font-bold text-sm hover:bg-victoria-red shadow-lg shadow-victoria-wine/10 transition-all active:scale-95"
            >
              Guardar
            </button>
          </form>
        </section>
      )}

      {!isAdding && materials.length > 0 && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            placeholder="Buscar joyas por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-2 focus:ring-victoria-gold shadow-sm transition-all"
          />
        </div>
      )}

      {materials.length === 0 && !isAdding && (
         <div className="bg-victoria-wine/5 border border-victoria-wine/10 p-10 rounded-[3rem] text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-md">
                <Sparkles className="text-victoria-gold" size={40} />
            </div>
            <div className="space-y-3">
               <h3 className="text-2xl font-display font-bold text-victoria-wine">Bienvenido a Victoria Estrella</h3>
               <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                 Parece que tu inventario está listo para comenzar. Podemos cargar los materiales clásicos con precios base reales para que empieces a probar ahora mismo.
               </p>
            </div>
            <button 
              onClick={initializeDefaultMaterials}
              disabled={isInitializing}
              className="bg-victoria-gold text-white px-10 py-5 rounded-[1.8rem] font-bold text-lg flex items-center gap-3 mx-auto shadow-2xl shadow-victoria-gold/30 hover:bg-amber-600 transition-all active:scale-95 disabled:opacity-50"
            >
              {isInitializing ? <Loader2 className="animate-spin" size={24} /> : <PackagePlus size={24} />}
              Cargar Configuración Victoria
            </button>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Se cargarán 6 tipos de joyas con stock y precios reales</p>
         </div>
      )}

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-gray-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <h3 className="font-display font-bold text-xl text-victoria-wine">
            {editingId ? 'Editar Material' : 'Nuevo Tipo de Joya'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Precio por Gramo ($)</label>
              <input 
                type="number" 
                value={formData.pricePerGram}
                onChange={(e) => setFormData({...formData, pricePerGram: e.target.value})}
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg"
                placeholder="Ej: 5000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-victoria-gold ml-2">Alerta Stock Bajo (gramos)</label>
              <input 
                type="number" 
                value={formData.minStockThreshold}
                onChange={(e) => setFormData({...formData, minStockThreshold: e.target.value})}
                className="w-full p-4 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-victoria-gold text-lg"
                placeholder="20"
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                setFormData({ name: '', initialStockGrams: '', pricePerGram: '', minStockThreshold: '' });
              }}
              className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-victoria-wine text-white rounded-2xl font-bold shadow-lg shadow-victoria-wine/20"
            >
              {editingId ? 'Actualizar Material' : 'Guardar Material'}
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
        {filteredMaterials.map((material) => {
          const totalSold = salesByMaterial[material.id] || 0;
          return (
            <div key={material.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center group hover:border-victoria-gold/20 transition-all">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-victoria-wine/5 rounded-2xl flex items-center justify-center text-victoria-wine font-bold">
                    {material.name.charAt(0)}
                 </div>
                  <div>
                    <h4 className="font-bold text-gray-800 tracking-tight">{material.name}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-200 rounded-full" /> Stock: {material.currentStockGrams}g
                      </p>
                      <p className="text-[10px] font-bold text-victoria-gold uppercase tracking-widest">Precio: ${material.pricePerGram || 0}/g</p>
                      <p className="text-[10px] font-bold text-victoria-red uppercase tracking-widest">Total Vendido: {totalSold.toFixed(1)}g</p>
                    </div>
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
          );
        })}
        {filteredMaterials.length === 0 && materials.length > 0 && (
          <div className="text-center py-10 text-gray-400 italic">No se encontraron materiales para "{searchTerm}"</div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col items-center gap-4 text-center">
        <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Zona de Peligro</h4>
        <button 
          onClick={handleMasterReset}
          disabled={isInitializing}
          className="px-6 py-2 text-[10px] font-bold text-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all border border-transparent hover:border-red-100"
        >
          Borrar Todo e Iniciar desde 0
        </button>
      </div>
    </div>
  );
};

export default Materials;
