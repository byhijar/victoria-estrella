export const MOCK_MATERIALS = [
  { id: 'm1', name: 'Plata con Oro', currentStockGrams: 45.5, costPricePerGram: 4200, sellPricePerGram: 6500, minStockThreshold: 15, createdAt: new Date().toISOString() },
  { id: 'm2', name: 'Plata Italiana 925', currentStockGrams: 82.0, costPricePerGram: 3800, sellPricePerGram: 5800, minStockThreshold: 20, createdAt: new Date().toISOString() },
  { id: 'm3', name: 'Plata Nacional', currentStockGrams: 12.5, costPricePerGram: 3200, sellPricePerGram: 5200, minStockThreshold: 15, createdAt: new Date().toISOString() },
  { id: 'm4', name: 'Microcircon', currentStockGrams: 28.3, costPricePerGram: 8500, sellPricePerGram: 13500, minStockThreshold: 10, createdAt: new Date().toISOString() },
];

export const MOCK_SALES = [
  { 
    id: 's1', 
    materialId: 'm1', 
    materialName: 'Plata con Oro', 
    gramsSold: 5.2, 
    totalPrice: 33800, 
    sellerName: 'Romi', 
    type: 'sale', 
    costPriceAtTimeOfSale: 4200, 
    createdAt: new Date().toISOString(),
    note: 'Venta rápida cliente frecuente'
  },
  { 
    id: 's2', 
    materialId: 'm2', 
    materialName: 'Plata Italiana 925', 
    gramsSold: 12.0, 
    totalPrice: 69600, 
    sellerName: 'Patricia', 
    type: 'sale', 
    costPriceAtTimeOfSale: 3800, 
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    note: 'Promoción del día'
  },
  { 
    id: 's3', 
    materialId: 'm3', 
    materialName: 'Plata Nacional', 
    gramsSold: 8.5, 
    totalPrice: 44200, 
    sellerName: 'Romi', 
    type: 'sale', 
    costPriceAtTimeOfSale: 3200, 
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  { 
    id: 's4', 
    materialId: 'm2', 
    materialName: 'Plata Italiana 925', 
    gramsSold: 20.0, 
    type: 'restock', 
    sellerName: 'Admin', 
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
];
