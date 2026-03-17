import React, { useState, useMemo } from 'react';
import { useSales } from '../hooks/useSales';
import { useMaterials } from '../hooks/useMaterials';
import { Loader2, ArrowDownCircle, Search, Calendar, Filter, User, Package, Tag, FilterX, PlusCircle, Trash2, TrendingUp } from 'lucide-react';

const History = () => {
  const { sales, loading: loadingSales } = useSales();
  const { materials, loading: loadingMaterials } = useMaterials();
  const [filter, setFilter] = useState({ seller: '', type: '', material: '' });
  const [showFilters, setShowFilters] = useState(false);

  const sellers = [...new Set(sales.map(s => s.sellerName).filter(Boolean))];

  const processedGroups = useMemo(() => {
    // 1. Apply filters
    const filtered = sales.filter(sale => {
      const matchSeller = !filter.seller || sale.sellerName === filter.seller;
      const matchType = !filter.type || (
        filter.type === 'venta' ? sale.type === 'sale' : 
        filter.type === 'restock' ? sale.type === 'restock' :
        ['new_material', 'delete_material'].includes(sale.type)
      );
      const matchMaterial = !filter.material || sale.materialId === filter.material;
      return matchSeller && matchType && matchMaterial;
    });

    // 2. Group and sum
    return filtered.reduce((groups, sale) => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : new Date();
      const date = isNaN(saleDate.getTime()) ? 'Fecha Desconocida' : saleDate.toLocaleDateString('es-CL', { 
        day: '2-digit', month: 'long', year: 'numeric' 
      });
      if (!groups[date]) {
        groups[date] = { items: [], totalGrams: 0, totalMoney: 0 };
      }
      groups[date].items.push(sale);
      if (sale.type === 'sale') {
        groups[date].totalGrams += Number(sale.gramsSold || 0);
        groups[date].totalMoney += Number(sale.totalPrice || 0);
      }
      return groups;
    }, {});
  }, [sales, filter]);

  const periodTotals = useMemo(() => {
    let grams = 0;
    let money = 0;
    let count = 0;
    
    Object.values(processedGroups).forEach(group => {
      grams += group.totalGrams;
      money += group.totalMoney;
      count += group.items.length;
    });
    
    return { grams, money, count };
  }, [processedGroups]);

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('es-CL', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };


  if (loadingSales || loadingMaterials) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-victoria-red" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-victoria-wine tracking-tight">Historial</h2>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Registros de movimientos</p>
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs transition-all ${showFilters || filter.seller || filter.type || filter.material ? 'bg-victoria-wine text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100'}`}
        >
          <Filter size={14} />
          {showFilters ? 'Cerrar Filtros' : 'Filtrar Historial'}
          {(filter.seller || filter.type || filter.material) && (
            <span className="w-2 h-2 bg-victoria-gold rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Filter Menu */}
      {showFilters && (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-gray-200/20 border border-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 flex items-center gap-1">
              <User size={10} /> Vendedor
            </label>
            <select 
              value={filter.seller}
              onChange={(e) => setFilter({...filter, seller: e.target.value})}
              className="w-full p-3 bg-gray-50 border-0 rounded-xl text-xs font-bold text-victoria-wine focus:ring-2 focus:ring-victoria-gold appearance-none"
            >
              <option value="">Todos</option>
              {sellers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 flex items-center gap-1">
              <Tag size={10} /> Tipo
            </label>
            <select 
              value={filter.type}
              onChange={(e) => setFilter({...filter, type: e.target.value})}
              className="w-full p-3 bg-gray-50 border-0 rounded-xl text-xs font-bold text-victoria-wine focus:ring-2 focus:ring-victoria-gold appearance-none"
            >
              <option value="">Todos</option>
              <option value="venta">Solo Ventas</option>
              <option value="restock">Solo Cargas Stock</option>
              <option value="admin">Gestión Catálogo</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-gray-300 uppercase tracking-widest ml-2 flex items-center gap-1">
              <Package size={10} /> Joya
            </label>
            <select 
              value={filter.material}
              onChange={(e) => setFilter({...filter, material: e.target.value})}
              className="w-full p-3 bg-gray-50 border-0 rounded-xl text-xs font-bold text-victoria-wine focus:ring-2 focus:ring-victoria-gold appearance-none"
            >
              <option value="">Todas</option>
              {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          {(filter.seller || filter.type || filter.material) && (
             <button 
              onClick={() => setFilter({ seller: '', type: '', material: '' })}
              className="md:col-span-3 flex items-center justify-center gap-2 text-[10px] font-bold text-victoria-red uppercase hover:opacity-70 transition-opacity pt-2"
             >
               <FilterX size={12} /> Limpiar Filtros
             </button>
          )}
        </div>
      )}

      {/* Period Summary Card */}
      {periodTotals.count > 0 && (
        <div className="bg-victoria-wine p-6 rounded-[2.5rem] shadow-xl shadow-victoria-wine/20 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-victoria-gold opacity-80">Resumen del Periodo Filtrado</p>
              <h3 className="text-sm font-bold opacity-60">
                {filter.seller || 'Todos los vendedores'} • {filter.type || 'Todos los movimientos'}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-300 uppercase">Volumen Total</p>
                <p className="text-2xl font-display font-bold text-victoria-gold">{Number(periodTotals.grams || 0).toFixed(1)}g</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-gray-300 uppercase">Recaudación Total</p>
                <p className="text-2xl font-display font-bold">${periodTotals.money.toLocaleString('es-CL')}</p>
              </div>
            </div>
            
            <div className="pt-2 border-t border-white/10 flex items-center gap-2">
              <div className="w-1 h-1 bg-victoria-gold rounded-full" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-gray-200">
                {periodTotals.count} {periodTotals.count === 1 ? 'Movimiento registrado' : 'Movimientos registrados'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {Object.keys(processedGroups).length > 0 ? Object.entries(processedGroups).map(([date, group]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 py-3 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 flex items-center justify-between border-b border-gray-100/50 mb-2">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-victoria-gold" />
                <span className="text-[10px] font-bold text-victoria-wine uppercase tracking-[0.2em] whitespace-nowrap">{date}</span>
              </div>
              {group.totalGrams > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                    {Number(group.totalGrams || 0).toFixed(1)}g
                  </span>
                  <span className="text-[9px] font-black text-victoria-red bg-victoria-red/5 px-2 py-0.5 rounded-full">
                    ${group.totalMoney.toLocaleString('es-CL')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {group.items.map((sale) => {
                const isRestock = sale.type === 'restock';
                const isNew = sale.type === 'new_material';
                const isDelete = sale.type === 'delete_material';
                
                return (
                  <div key={sale.id} className="bg-white p-4 md:p-5 rounded-[2rem] shadow-sm border border-gray-50 flex flex-col gap-3 group active:scale-[0.98] transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                          isRestock ? 'bg-green-50 text-green-600' : 
                          isNew ? 'bg-blue-50 text-blue-600' :
                          isDelete ? 'bg-red-50 text-red-600' :
                          'bg-victoria-wine/5 text-victoria-wine'
                        }`}>
                          {isRestock ? <ArrowDownCircle size={20} /> : 
                           isNew ? <PlusCircle size={20} /> :
                           isDelete ? <Trash2 size={20} /> :
                           <Search size={20} className="rotate-180" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm capitalize leading-tight">
                            {isNew ? 'Nueva Joya: ' : isDelete ? 'Eliminado: ' : ''}
                            {sale.materialName}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {isRestock ? 'Stock' : isNew || isDelete ? 'Admin' : `${sale.sellerName || 'Romi'}`}
                            </span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[9px] font-bold text-gray-500">{sale.sellerName}</span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className="text-[10px] font-bold text-gray-300 tracking-tighter">{formatTime(sale.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                        {!isNew && !isDelete && (
                          <span className={`text-base md:text-lg font-display font-bold ${isRestock ? 'text-green-600' : 'text-victoria-red'}`}>
                            {isRestock ? '+' : '-'}{sale.gramsSold}g
                          </span>
                        )}
                        {sale.type === 'sale' && sale.totalPrice && (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-800">
                              ${sale.totalPrice.toLocaleString('es-CL')}
                            </span>
                            {sale.costPriceAtTimeOfSale !== undefined && (
                              <span className="text-[8px] font-black text-green-600 bg-green-50 px-1.5 py-0.5 rounded mt-0.5 whitespace-nowrap">
                                Ganancia: ${(sale.totalPrice - (sale.costPriceAtTimeOfSale * sale.gramsSold)).toLocaleString('es-CL')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {sale.note && (
                      <div className="bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-100">
                         <p className="text-[10px] text-gray-500 italic leading-relaxed">
                           <span className="font-bold uppercase text-victoria-gold not-italic mr-1">Nota:</span>
                           {sale.note}
                         </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 px-8 bg-white rounded-[3rem] border border-gray-50 shadow-sm">
             <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Calendar className="text-gray-200" size={32} />
             </div>
             <p className="text-gray-400 font-bold text-xs uppercase tracking-widest italic">No hay registros aún</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
