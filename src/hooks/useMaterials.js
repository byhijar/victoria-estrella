import { useState, useEffect } from 'react';
import { subscribeToMaterials } from '../services/materialService';

export const useMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
