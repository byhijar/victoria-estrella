import React from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useSales } from '../hooks/useSales';
import { Package, TrendingUp, Calendar, Clock, Loader2, MinusCircle, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { materials, loading: loadingMaterials, error: errorMaterials } = useMaterials();
  const { sales, loading: loadingSales } = useSales();

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const salesToday = sales.filter(s => s.createdAt.startsWith(today)).reduce((sum, s) => sum + s.gramsSold, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
  const salesWeek = sales.filter(s => s.createdAt >= startOfWeekStr).reduce((sum, s) => sum + s.gramsSold, 0);

  const startOfMonthStr = new Date().toISOString().slice(0, 7) + '-01';
  const salesMonth = sales.filter(s => s.createdAt >= startOfMonthStr).reduce((sum, s) => sum + s.gramsSold, 0);

  if (loadingMaterials || loadingSales) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-victoria-red" size={48} />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Cargando inventario...</p>
      </div>
    );
  }

  if (errorMaterials) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center space-y-4">
        <AlertCircle className="text-red-500 mx-auto" size={48} />
        <h3 className="text-xl font-display font-bold text-red-900">Error de Conexión</h3>
        <p className="text-sm text-red-600 max-w-xs mx-auto">{errorMaterials}</p>
        <div className="pt-4">
           <code className="bg-white/50 px-2 py-1 rounded text-xs text-red-400 font-mono">src/firebase/config.js</code>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Section */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="text-victoria-gold" size={20} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Ventas Registradas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Hoy" 
            value={salesToday.toFixed(1)} 
            unit="g"
            icon={<Clock className="text-victoria-wine" size={20} />}
            color="bg-white"
          />
          <StatCard 
            title="Esta Semana" 
            value={salesWeek.toFixed(1)} 
            unit="g"
            icon={<Calendar className="text-victoria-wine" size={20} />}
            color="bg-white"
          />
          <StatCard 
            title="Este Mes" 
            value={salesMonth.toFixed(1)} 
            unit="g"
            icon={<TrendingUp className="text-victoria-wine" size={20} />}
            color="bg-white"
          />
        </div>
      </section>

      {/* Stock Section */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-gray-800">
          <Package className="text-victoria-gold" size={20} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Actual de Joyas</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map(material => (
            <StockCard 
              key={material.id}
              name={material.name}
              stock={material.currentStockGrams}
              initial={material.initialStockGrams}
            />
          ))}
          {materials.length === 0 && (
            <div className="col-span-full text-center py-16 px-4 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
              <Package className="mx-auto text-gray-200 mb-4" size={48} />
              <p className="text-gray-400 font-medium italic">No hay stock registrado aún.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 flex flex-col gap-3">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      <div className="bg-gray-50 p-2 rounded-xl">
        {icon}
      </div>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-display font-bold text-victoria-wine">{value}</span>
      <span className="text-sm font-bold text-victoria-gold">{unit}</span>
    </div>
  </div>
);

const StockCard = ({ name, stock, initial }) => {
  const percentage = Math.max(0, (stock / initial) * 100);
  const isLow = percentage < 20;

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-gray-50 relative overflow-hidden group">
      {/* Accent Line */}
      <div className={`absolute top-0 left-0 w-2 h-full ${isLow ? 'bg-red-500' : 'bg-victoria-gold'}`} />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-victoria-wine mb-1 group-hover:text-victoria-red transition-colors">{name}</h3>
          <div className="flex items-center gap-1.5">
             <div className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
               {isLow ? 'Stock Bajo' : 'Estado Óptimo'}
             </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-gray-800">{stock.toFixed(1)}</span>
            <span className="text-lg font-bold text-victoria-gold tracking-tight">gramos</span>
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">Inició con {initial}g</span>
        </div>
        
        <div className="relative pt-2">
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isLow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-victoria-wine shadow-[0_0_10px_rgba(74,4,4,0.2)]'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
