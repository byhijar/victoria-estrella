import React from 'react';
import { useSales } from '../hooks/useSales';
import { Loader2, ArrowDownCircle, Search, Calendar } from 'lucide-react';

const History = () => {
  const { sales, loading } = useSales();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-victoria-red" size={48} />
      </div>
    );
  }

  const groupedSales = sales.reduce((groups, sale) => {
    const date = new Date(sale.createdAt).toLocaleDateString('es-CL', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    });
    if (!groups[date]) groups[date] = [];
    groups[date].push(sale);
    return groups;
  }, {});

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('es-CL', { 
      hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-victoria-wine tracking-tight">Historial</h2>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Registros de movimientos</p>
        </div>
      </div>

      <div className="space-y-10">
        {Object.keys(groupedSales).length > 0 ? Object.entries(groupedSales).map(([date, items]) => (
          <div key={date} className="space-y-4">
            <div className="sticky top-0 z-10 py-2 bg-gray-50/80 backdrop-blur-sm -mx-4 px-4 flex items-center gap-3">
              <span className="text-[10px] font-bold text-victoria-gold uppercase tracking-[0.2em] whitespace-nowrap">{date}</span>
              <div className="h-[1px] w-full bg-gray-100" />
            </div>
            
            <div className="space-y-3">
              {items.map((sale) => {
                const isRestock = sale.type === 'restock';
                return (
                  <div key={sale.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${isRestock ? 'bg-green-50 text-green-600' : 'bg-victoria-wine/5 text-victoria-wine'}`}>
                        {isRestock ? <ArrowDownCircle size={20} /> : <Search size={20} className="rotate-180" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm capitalize leading-tight">{sale.materialName}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                            {isRestock ? 'Stock' : `${sale.sellerName || 'Romi'}`}
                          </span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[10px] font-bold text-gray-300 tracking-tighter">{formatTime(sale.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                      <span className={`text-lg font-display font-bold ${isRestock ? 'text-green-600' : 'text-victoria-red'}`}>
                        {isRestock ? '+' : '-'}{sale.gramsSold}g
                      </span>
                      {sale.totalPrice && (
                        <span className="text-[10px] font-bold text-gray-400">
                          ${sale.totalPrice.toLocaleString('es-CL')}
                        </span>
                      )}
                    </div>
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
