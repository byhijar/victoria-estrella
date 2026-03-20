export const exportToCSV = (data, filename = 'reporte_victoria_estrella.csv') => {
  if (!data || !data.length) return;

  // Define columns
  const headers = [
    'Fecha', 
    'Hora',
    'Vendedor', 
    'Joya', 
    'Tipo', 
    'Gramos', 
    'Precio Unitario', 
    'Total', 
    'Estado', 
    'Motivo Anulación', 
    'Nota'
  ];

  // Map data to rows
  const rows = data.map(sale => {
    const dateObj = new Date(sale.createdAt || Date.now());
    const date = dateObj.toLocaleDateString('es-CL');
    const time = dateObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    
    let typeLabel = 'Venta';
    if (sale.type === 'restock') typeLabel = 'Carga Stock';
    if (sale.type === 'new_material') typeLabel = 'Nueva Joya';
    if (sale.type === 'delete_material') typeLabel = 'Eliminar Joya';

    const statusLabel = sale.isVoided ? 'ANULADA' : 'VÁLIDA';

    return [
      date,
      time,
      sale.sellerName || 'Romi',
      sale.materialName || 'N/A',
      typeLabel,
      sale.gramsSold || 0,
      sale.sellPriceAtTimeOfSale || 0,
      sale.totalPrice || 0,
      statusLabel,
      (sale.voidReason || '').replace(/;/g, ','), // escape semicolon
      (sale.note || '').replace(/;/g, ',')        // escape semicolon
    ];
  });

  // Create CSV content
  // Using semicolon for Excel Spanish/Regional compatibility
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
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
