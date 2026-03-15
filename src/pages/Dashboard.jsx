import React from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useSales } from '../hooks/useSales';
import { Package, TrendingUp, Calendar, Clock, Loader2, MinusCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Dashboard = () => {
  const { materials, loading: loadingMaterials, error: errorMaterials } = useMaterials();
  const { sales, loading: loadingSales } = useSales();
  const [isPrivate, setIsPrivate] = React.useState(() => {
    return localStorage.getItem('victoria_privacy') === 'true';
  });

  const togglePrivacy = () => {
    setIsPrivate(!isPrivate);
    localStorage.setItem('victoria_privacy', !isPrivate);
  };

  // Helper to find material price
  const getMaterialPrice = (id) => {
    const material = materials.find(m => m.id === id);
    return material ? (material.pricePerGram || 0) : 0;
  };

  // Pre-calculate sums for daily, weekly, and monthly sales
  const stats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    
    const startOfMonthStr = new Date().toISOString().slice(0, 7) + '-01';

    return sales.reduce((acc, s) => {
      if (s.type === 'restock') return acc;

      const price = getMaterialPrice(s.materialId);
      const saleValue = (s.gramsSold || 0) * price;
      const isToday = s.createdAt.startsWith(today);
      const isThisWeek = s.createdAt >= startOfWeekStr;
      const isThisMonth = s.createdAt >= startOfMonthStr;

      if (isToday) {
        acc.today.grams += s.gramsSold;
        acc.today.money += saleValue;
        
        const user = s.sellerName || 'Romi';
        acc.today.byUser[user] = (acc.today.byUser[user] || 0) + saleValue;
      }
      if (isThisWeek) {
        acc.week.grams += s.gramsSold;
        acc.week.money += saleValue;
      }
      if (isThisMonth) {
        acc.month.grams += s.gramsSold;
        acc.month.money += saleValue;
      }

      return acc;
    }, {
      today: { grams: 0, money: 0, byUser: {} },
      week: { grams: 0, money: 0 },
      month: { grams: 0, money: 0 }
    });
  }, [sales, materials]);

  // Inventory Value
  const totalInventoryValue = materials.reduce((sum, m) => sum + ((m.currentStockGrams || 0) * (m.pricePerGram || 0)), 0);

  if (loadingMaterials || loadingSales) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader2 className="animate-spin text-victoria-red" size={48} />
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] animate-pulse">Cargando panel...</p>
      </div>
    );
  }

  if (errorMaterials) {
    return (
      <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center space-y-4">
        <AlertCircle className="text-red-500 mx-auto" size={48} />
        <h3 className="text-xl font-display font-bold text-red-900">Error de Conexión</h3>
        <p className="text-sm text-red-600 max-w-xs mx-auto">{errorMaterials}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-10">
      {/* Overview Section */}
      <section className="bg-victoria-wine p-8 rounded-[3rem] shadow-2xl shadow-victoria-wine/20 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
          <TrendingUp size={120} />
        </div>
        
        {/* Privacy Toggle Button */}
        <button 
          onClick={togglePrivacy}
          className="absolute top-6 right-8 z-20 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors text-white/60 hover:text-white"
          title={isPrivate ? "Mostrar montos" : "Ocultar montos"}
        >
          {isPrivate ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-2 opacity-60">
            <Package size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Valor Total Inventario</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-5xl font-display font-bold tracking-tighter">
              {isPrivate ? '*****' : `$${totalInventoryValue.toLocaleString('es-CL')}`}
            </h2>
            <p className="text-victoria-gold font-bold text-xs uppercase tracking-widest">Capital en Joyas de Plata</p>
          </div>
        </div>
      </section>

      {/* Sales Stats Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-victoria-gold" size={20} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Rendimiento de Ventas</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Hoy" 
            value={isPrivate ? '*****' : `$${stats.today.money.toLocaleString('es-CL')}`} 
            unit={`${stats.today.grams.toFixed(1)}g`}
            icon={<Clock className="text-victoria-wine" size={20} />}
          />
          <StatCard 
            title="Esta Semana" 
            value={isPrivate ? '*****' : `$${stats.week.money.toLocaleString('es-CL')}`} 
            unit={`${stats.week.grams.toFixed(1)}g`}
            icon={<Calendar className="text-victoria-wine" size={20} />}
          />
          <StatCard 
            title="Este Mes" 
            value={isPrivate ? '*****' : `$${stats.month.money.toLocaleString('es-CL')}`} 
            unit={`${stats.month.grams.toFixed(1)}g`}
            icon={<TrendingUp className="text-victoria-wine" size={20} />}
          />
        </div>
      </section>

      {/* User Breakdown Section */}
      <section className="space-y-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-300 ml-4">Ventas por Usuario (Hoy)</h2>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats.today.byUser).length > 0 ? Object.entries(stats.today.byUser).map(([user, amount]) => (
            <div key={user} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-gray-500">{user}</span>
              <span className="text-lg font-display font-bold text-victoria-red">
                {isPrivate ? '*****' : `$${amount.toLocaleString('es-CL')}`}
              </span>
            </div>
          )) : (
            <div className="col-span-full py-4 text-center text-[10px] text-gray-300 font-bold uppercase italic">Sin ventas hoy</div>
          )}
        </div>
      </section>

      {/* Stock Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-gray-800">
          <Package className="text-victoria-gold" size={20} />
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Actual</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.map(material => (
            <StockCard 
              key={material.id}
              name={material.name}
              stock={material.currentStockGrams}
              initial={material.initialStockGrams}
              price={material.pricePerGram || 0}
              minThreshold={material.minStockThreshold}
              isPrivate={isPrivate}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, unit, icon }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-3 group hover:border-victoria-gold/20 transition-all">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      <div className="bg-gray-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-display font-bold text-victoria-wine">{value}</div>
      <div className="text-[10px] font-bold text-victoria-gold uppercase tracking-tighter">{unit} vendidos</div>
    </div>
  </div>
);

const StockCard = ({ name, stock, initial, price, minThreshold, isPrivate }) => {
  const isLow = stock <= (minThreshold || 20);
  const percentage = Math.max(0, Math.min(100, (stock / (initial || stock || 1)) * 100));
  const value = stock * price;

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-gray-50 relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-2 h-full ${isLow ? 'bg-red-500' : 'bg-victoria-gold'}`} />
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-display font-bold text-victoria-wine mb-1 group-hover:text-victoria-red transition-colors capitalize">{name}</h3>
          <div className="flex items-center gap-1.5">
             <div className={`w-2 h-2 rounded-full ${isLow ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
             <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
               {isLow ? 'Stock Bajo' : 'Estado Óptimo'}
             </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Valor</div>
          <div className="text-lg font-display font-bold text-gray-800">
            {isPrivate ? '*****' : `$${value.toLocaleString('es-CL')}`}
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-display font-bold text-gray-800">{stock.toFixed(1)}</span>
            <span className="text-lg font-bold text-victoria-gold tracking-tight">gr</span>
          </div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            {isPrivate ? '****' : `$${price}/g`}
          </span>
        </div>
        
        <div className="relative pt-2">
          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${isLow ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-victoria-wine'}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
