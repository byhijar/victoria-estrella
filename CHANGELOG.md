# Changelog - Victoria Estrella (Romi Joyería)

Todas las versiones notables de este proyecto serán documentadas en este archivo.

## [1.3.0] - 2026-03-20
### Añadido
- **Reporte Financiero Profesional**: El Excel exportado ahora es un reporte completo con:
    - Encabezado con totales de Recaudación, Ganancia y Gramos.
    - Cálculo de Ganancia neta por cada ítem vendido.
    - Sección de Inventario con el valor actual de joyas en stock.
- **Formato Excel Amigable**: Optimización de columnas y cabeceras para una lectura profesional en hojas de cálculo.

## [1.2.0] - 2026-03-20
### Añadido
- **Edición Premium de Ventas**: Nuevo modal moderno y responsive que permite corregir gramos o precio de cualquier venta.
- **Ajuste Automático de Stock**: Al editar los gramos de una venta, el sistema recalcula y ajusta el inventario de la joya automáticamente.
- **Historial de Auditoría**: Las ventas corregidas ahora guardan un registro de quién hizo el cambio, cuándo y cuáles eran los valores originales.

## [1.1.0] - 2026-03-19
### Añadido
- **Sistema de Anulaciones**: Capacidad para anular ventas con errores, restaurando automáticamente el stock y registrando el motivo por trazabilidad.
- **Exportación a Excel**: Botón en el Historial para descargar reportes en formato CSV (compatible con Excel/Google Sheets) respetando los filtros aplicados.
- **Detección de Ganancia**: Mejora visual en el historial para ver la ganancia por ítem (precio de venta - costo).

### Cambiado
- El Dashboard ahora excluye automáticamente las ventas anuladas de los totales diarios, semanales y mensuales.
- Refactorización de la lógica de filtrado en el Historial para soportar exportaciones dinámicas.

## [1.0.0] - 2026-03-14
### Añadido
- Versión inicial lanzada.
- Registro de ventas e inventario de joyas de plata.
- Dashboard de rendimiento y stock crítico.
- Modo Demo para presentaciones.
