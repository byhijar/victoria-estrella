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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
       date: date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }),
       time: date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-display font-bold text-victoria-wine">Historial</h2>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Registros de movimientos</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-50 shadow-sm text-gray-400">
           <Calendar size={18} />
           <span className="text-xs font-bold uppercase tracking-tight">Todas las fechas</span>
        </div>
      </div>

      <div className="space-y-4">
        {sales.map((sale) => {
          const { date, time } = formatDate(sale.createdAt);
          return (
            <div key={sale.id} className="bg-white p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-gray-50 flex items-center justify-between group hover:border-victoria-gold/30 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="bg-gray-50 p-3 rounded-2xl text-victoria-gold group-hover:bg-victoria-wine group-hover:text-white transition-all">
                  <ArrowDownCircle size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 tracking-tight">{sale.materialName}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    <span>{date}</span>
                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                    <span>{time}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-victoria-red">-{sale.gramsSold}g</div>
                <div className="text-[10px] font-bold text-victoria-gold uppercase tracking-widest">Descontado</div>
              </div>
            </div>
          );
        })}
        {sales.length === 0 && (
          <div className="text-center py-20 px-4 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
             <Search className="mx-auto text-gray-200 mb-4" size={48} />
             <p className="text-gray-400 font-medium italic">No se han registrado ventas aún.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
