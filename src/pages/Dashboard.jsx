import React, { useState, useMemo } from 'react';
import { useMaterials } from '../hooks/useMaterials';
import { useSales } from '../hooks/useSales';
import { Package, TrendingUp, Calendar, Clock, Loader2, MinusCircle, AlertCircle, Eye, EyeOff, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const isDemo = localStorage.getItem('victoria_demo_mode') === 'true';
  const { materials, loading: loadingMaterials, error: errorMaterials } = useMaterials();
  const { sales, loading: loadingSales } = useSales();
  const [privacy, setPrivacy] = useState(() => {
    const saved = localStorage.getItem('victoria_privacy_settings');
    return saved ? JSON.parse(saved) : {
      inventory: false,
      today: false,
      week: false,
      month: false,
      users: false,
      stock: false
    };
  });

  const togglePrivacy = (section) => {
    const newSettings = { ...privacy, [section]: !privacy[section] };
    setPrivacy(newSettings);
    localStorage.setItem('victoria_privacy_settings', JSON.stringify(newSettings));
  };

  // Helper to find material price
  const getMaterialPrices = (id) => {
    const material = materials.find(m => m.id === id);
    if (!material) return { cost: 0, sell: 0 };
    return {
      cost: material.costPricePerGram || 0,
      sell: material.sellPricePerGram || material.pricePerGram || 0
    };
  };

  // Pre-calculate sums for daily, weekly, and monthly sales
  const stats = useMemo(() => {
    // Current local time boundaries
    const now = new Date();
    
    // Start of today (local 00:00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of week (local Sunday 00:00:00)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    
    // Start of month (local 1st 00:00:00)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return sales.reduce((acc, s) => {
      if (s.type === 'restock') return acc;

      const prices = getMaterialPrices(s.materialId);
      
      // Use persisted data for accuracy, fallback to current for legacy
      const sellPrice = s.sellPriceAtTimeOfSale !== undefined ? s.sellPriceAtTimeOfSale : prices.sell;
      const costPrice = s.costPriceAtTimeOfSale !== undefined ? s.costPriceAtTimeOfSale : prices.cost;
      
      const grams = Number(s.gramsSold || 0);
      const saleValue = s.totalPrice !== undefined ? Number(s.totalPrice) : grams * sellPrice;
      const profitValue = saleValue - (grams * costPrice);
        
      // Parse record date
      const createdAt = s.createdAt ? new Date(s.createdAt) : new Date();
      const isToday = createdAt >= startOfToday;
      const isThisWeek = createdAt >= startOfWeek;
      const isThisMonth = createdAt >= startOfMonth;

      if (isToday) {
        acc.today.grams += grams;
        acc.today.money += saleValue;
        acc.today.profit += profitValue;
        
        const user = s.sellerName || 'Romi';
        acc.today.byUser[user] = (acc.today.byUser[user] || 0) + saleValue;
      }
      if (isThisWeek) {
        acc.week.grams += grams;
        acc.week.money += saleValue;
        acc.week.profit += profitValue;
      }
      if (isThisMonth) {
        acc.month.grams += grams;
        acc.month.money += saleValue;
        acc.month.profit += profitValue;
      }

      return acc;
    }, {
      today: { grams: 0, money: 0, profit: 0, byUser: {} },
      week: { grams: 0, money: 0, profit: 0 },
      month: { grams: 0, money: 0, profit: 0 }
    });
  }, [sales, materials]);

  // Inventory Calculations
  const inventoryStats = useMemo(() => {
    return materials
      .filter(m => !m.deleted)
      .reduce((acc, m) => {
        const cost = m.costPricePerGram || 0;
        const sell = m.sellPricePerGram || m.pricePerGram || 0;
        const stock = m.currentStockGrams || 0;
        
        acc.totalValue += stock * sell;
        acc.totalInvestment += stock * cost;
        return acc;
      }, { totalValue: 0, totalInvestment: 0 });
  }, [materials]);

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
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
          <TrendingUp size={120} />
        </div>
        
        {isDemo && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-victoria-gold/20 backdrop-blur-md border border-victoria-gold/30 px-3 py-1 rounded-full flex items-center gap-2 z-20">
            <div className="w-1.5 h-1.5 bg-victoria-gold rounded-full animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-victoria-gold">Visualización Demo: Datos Seguros</span>
          </div>
        )}

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 md:mt-0">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <Package size={16} className="text-victoria-gold" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Puesta en Venta</span>
              <button 
                onClick={() => togglePrivacy('inventory')}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                {privacy.inventory ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter">
                {privacy.inventory ? '*****' : `$${inventoryStats.totalValue.toLocaleString('es-CL')}`}
              </h2>
              <p className="text-victoria-gold font-bold text-[9px] md:text-[10px] uppercase tracking-widest leading-none">Valor Estimado del Stock</p>
            </div>
          </div>
          
          <div className="space-y-6 md:border-l md:border-white/10 md:pl-8">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-xl">
                <TrendingUp size={16} className="text-green-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-300 opacity-60">Capital Invertido</span>
              <button 
                onClick={() => togglePrivacy('inventory')} // Tied to same section toggle for simplicity or can be unique
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-white/40 hover:text-white"
              >
                {privacy.inventory ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tighter text-green-50">
                {privacy.inventory ? '*****' : `$${inventoryStats.totalInvestment.toLocaleString('es-CL')}`}
              </h2>
              <p className="text-green-300/60 font-bold text-[9px] md:text-[10px] uppercase tracking-widest leading-none">Costo Real de Compra</p>
            </div>
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
            title="Ventas Hoy" 
            value={privacy.today ? '*****' : `$${stats.today.money.toLocaleString('es-CL')}`} 
            profit={stats.today.profit}
            unit={`${Number(stats.today.grams || 0).toFixed(1)}g`}
            icon={<Clock className="text-victoria-wine" size={20} />}
            isPrivate={privacy.today}
            onToggle={() => togglePrivacy('today')}
          />
          <StatCard 
            title="Ventas Semana" 
            value={privacy.week ? '*****' : `$${stats.week.money.toLocaleString('es-CL')}`} 
            profit={stats.week.profit}
            unit={`${Number(stats.week.grams || 0).toFixed(1)}g`}
            icon={<Calendar className="text-victoria-wine" size={20} />}
            isPrivate={privacy.week}
            onToggle={() => togglePrivacy('week')}
          />
          <StatCard 
            title="Ventas Mes" 
            value={privacy.month ? '*****' : `$${stats.month.money.toLocaleString('es-CL')}`} 
            profit={stats.month.profit}
            unit={`${Number(stats.month.grams || 0).toFixed(1)}g`}
            icon={<TrendingUp className="text-victoria-wine" size={20} />}
            isPrivate={privacy.month}
            onToggle={() => togglePrivacy('month')}
          />
        </div>
      </section>

      {/* User Breakdown Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-300">Ventas por Usuario (Hoy)</h2>
          <button 
            onClick={() => togglePrivacy('users')}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-300 hover:text-gray-500"
          >
            {privacy.users ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats.today.byUser).length > 0 ? Object.entries(stats.today.byUser).map(([user, amount]) => (
            <div key={user} className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center justify-between shadow-sm">
              <span className="text-sm font-bold text-gray-500">{user}</span>
              <span className="text-lg font-display font-bold text-victoria-red">
                {privacy.users ? '*****' : `$${amount.toLocaleString('es-CL')}`}
              </span>
            </div>
          )) : (
            <div className="col-span-full py-4 text-center text-[10px] text-gray-300 font-bold uppercase italic">Sin ventas hoy</div>
          )}
        </div>
      </section>

      {/* Stock Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-2 text-gray-800">
            <Package className="text-victoria-gold" size={20} />
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">Stock Crítico</h2>
          </div>
          <button 
            onClick={() => togglePrivacy('stock')}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-300 hover:text-gray-500"
          >
            {privacy.stock ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materials.filter(m => !m.deleted)
            .sort((a, b) => (a.currentStockGrams / a.minStockThreshold) - (b.currentStockGrams / b.minStockThreshold))
            .slice(0, 4)
            .map(material => (
            <StockCard 
              key={material.id}
              name={material.name}
              stock={material.currentStockGrams}
              initial={material.initialStockGrams}
              price={material.pricePerGram || 0}
              minThreshold={material.minStockThreshold}
              isPrivate={privacy.stock}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ title, value, profit, unit, icon, isPrivate, onToggle }) => (
  <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex flex-col gap-3 group hover:border-victoria-gold/20 transition-all">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{title}</span>
      <div className="flex items-center gap-2">
        <button 
          onClick={onToggle}
          className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors text-gray-300 hover:text-victoria-gold opacity-0 group-hover:opacity-100"
        >
          {isPrivate ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
        <div className="bg-gray-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-display font-bold text-victoria-wine">{value}</div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold text-victoria-gold uppercase tracking-tighter">{unit} vendidos</span>
        {profit !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${isPrivate ? 'bg-gray-100 text-transparent select-none' : 'bg-green-50 text-green-600'}`}>
            {isPrivate ? '*****' : `+$${profit.toLocaleString('es-CL')} Neto`}
          </span>
        )}
      </div>
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
            <span className="text-4xl font-display font-bold text-gray-800">{Number(stock || 0).toFixed(1)}</span>
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
