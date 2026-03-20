export const exportToCSV = (sales, materials = [], filters = {}, filename = 'reporte_victoria_estrella.csv') => {
  if (!sales || !sales.length) return;

  const validSales = sales.filter(s => !s.isVoided);
  const totalRevenue = validSales.reduce((sum, s) => sum + (Number(s.totalPrice) || 0), 0);
  const totalGrams = validSales.reduce((sum, s) => sum + (Number(s.gramsSold) || 0), 0);
  
  // Calculate total profit safely
  const totalProfit = validSales.reduce((sum, s) => {
    if (s.type !== 'sale') return sum;
    const cost = Number(s.costPriceAtTimeOfSale || 0);
    const sell = Number(s.sellPriceAtTimeOfSale || (s.totalPrice / s.gramsSold) || 0);
    const profitPerGram = sell - cost;
    return sum + (profitPerGram * Number(s.gramsSold || 0));
  }, 0);

  // 1. Create Summary Header
  const summaryRows = [
    ['REPORTE FINANCIERO - VICTORIA ESTRELLA'],
    ['Fecha de Generación', new Date().toLocaleString('es-CL')],
    ['Filtros Aplicados', `Vendedor: ${filters.seller || 'Todos'} | Tipo: ${filters.type || 'Todos'} | Joya: ${filters.material || 'Todas'}`],
    [],
    ['RESUMEN GENERAL (Solo registros válidos)'],
    ['Total Recaudado', `$${totalRevenue.toLocaleString('es-CL')}`],
    ['Total Ganancia Estimada', `$${totalProfit.toLocaleString('es-CL')}`],
    ['Total Gramos Vendidos', `${totalGrams.toFixed(2)}g`],
    [],
    ['DETALLE DE MOVIMIENTOS']
  ];

  // 2. Define Columns for Details
  const headers = [
    'Fecha', 
    'Hora',
    'Vendedor', 
    'Joya', 
    'Tipo', 
    'Gramos', 
    'P. Venta /g', 
    'P. Costo /g',
    'Total Venta', 
    'Ganancia Item',
    'Estado', 
    'Motivo Anulación/Edición', 
    'Nota'
  ];

  // 3. Map Sales to Rows
  const salesRows = sales.map(sale => {
    const dateObj = new Date(sale.createdAt || Date.now());
    const date = dateObj.toLocaleDateString('es-CL');
    const time = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    
    let typeLabel = 'Venta';
    if (sale.type === 'restock') typeLabel = 'Carga Stock';
    if (sale.type === 'new_material') typeLabel = 'Nueva Joya';
    if (sale.type === 'delete_material') typeLabel = 'Eliminar Joya';

    const costPerGram = Number(sale.costPriceAtTimeOfSale || 0);
    const sellPerGram = Number(sale.sellPriceAtTimeOfSale || (sale.totalPrice / sale.gramsSold) || 0);
    const profitItem = sale.type === 'sale' && !sale.isVoided ? (sellPerGram - costPerGram) * Number(sale.gramsSold) : 0;

    const statusLabel = sale.isVoided ? 'ANULADA' : sale.isEdited ? 'EDITADO' : 'VÁLIDA';

    return [
      date,
      time,
      sale.sellerName || 'Romi',
      sale.materialName || 'N/A',
      typeLabel,
      sale.gramsSold || 0,
      sellPerGram,
      costPerGram,
      sale.totalPrice || 0,
      profitItem,
      statusLabel,
      (sale.voidReason || 'Sin motivo').replace(/;/g, ','),
      (sale.note || '').replace(/;/g, ',')
    ];
  });

  // 4. Inventory Snapshot Section
  const inventoryHeader = [
    [],
    ['ESTADO DE INVENTARIO ACTUAL'],
    ['Joya', 'Stock Actual (g)', 'Costo Unitario', 'Valor total en stock (Costo)']
  ];

  const inventoryRows = materials.map(m => [
    m.name,
    m.currentStockGrams || 0,
    m.costPricePerGram || 0,
    (m.currentStockGrams * (m.costPricePerGram || 0))
  ]);

  // Combined Content
  const csvContent = [
    ...summaryRows.map(row => row.join(';')),
    headers.join(';'),
    ...salesRows.map(row => row.join(';')),
    ...inventoryHeader.map(row => row.join(';')),
    ...inventoryRows.map(row => row.join(';'))
  ].join('\n');

  // Add BOM for Excel UTF-8 recognition
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
