import { useState, useEffect } from 'react';
import { subscribeToMaterials } from '../services/materialService';
import { MOCK_MATERIALS } from '../services/mockData';

export const useMaterials = () => {
  const isDemo = localStorage.getItem('victoria_demo_mode') === 'true';
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo) {
      try {
        const stored = localStorage.getItem('victoria_demo_sales');
        const demoSales = stored ? JSON.parse(stored) : [];
        const safeDemoSales = Array.isArray(demoSales) ? demoSales : [];
        
        const adjustedMaterials = (MOCK_MATERIALS || []).map(m => {
          const soldInDemo = safeDemoSales
            .filter(s => s.materialId === m.id && s.type === 'sale')
            .reduce((acc, s) => acc + parseFloat(s.gramsSold || 0), 0);
          return { ...m, currentStockGrams: (m.currentStockGrams || 0) - soldInDemo };
        });
        setMaterials(adjustedMaterials);
      } catch (e) {
        console.error("Error loading demo materials:", e);
        setMaterials(MOCK_MATERIALS || []);
      }
      setLoading(false);
      return;
    }
    let timeoutId;

    try {
      const unsubscribe = subscribeToMaterials((data) => {
        setMaterials(data);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });

      // Safety timeout: 10 seconds
      timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("No se pudo conectar con la base de datos. Verifica la configuración de Firebase.");
        }
      }, 10000);

      return () => {
        unsubscribe();
        if (timeoutId) clearTimeout(timeoutId);
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return () => {};
    }
  }, []);

  return { materials, loading, error };
};
