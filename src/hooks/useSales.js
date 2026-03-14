import { useState, useEffect } from 'react';
import { subscribeToSales } from '../services/saleService';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
