import { useState, useEffect } from 'react';
import { subscribeToSales } from '../services/saleService';
import { MOCK_SALES } from '../services/mockData';

export const useSales = () => {
  const isDemo = localStorage.getItem('victoria_demo_mode') === 'true';
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo) {
      try {
        const stored = localStorage.getItem('victoria_demo_sales');
        const demoSales = stored ? JSON.parse(stored) : [];
        const safeDemoSales = (Array.isArray(demoSales) ? demoSales : [])
          .filter(s => s && s.materialId)
          .map(s => ({ 
            ...s, 
            createdAt: s.createdAt || new Date().toISOString(),
            gramsSold: Number(s.gramsSold || 0),
            totalPrice: Number(s.totalPrice || 0)
          }));
        setSales([...safeDemoSales, ...(MOCK_SALES || [])]);
      } catch (e) {
        console.error("Error loading demo sales:", e);
        setSales(MOCK_SALES || []);
      }
      setLoading(false);
      return;
    }
    let timeoutId;

    try {
      const unsubscribe = subscribeToSales((data) => {
        setSales(data);
        setLoading(false);
        if (timeoutId) clearTimeout(timeoutId);
      });

      // Safety timeout
      timeoutId = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setError("Timeout al cargar ventas.");
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

  return { sales, loading, error };
};
