const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/totales-por-categoria', async (req, res) => {
  const { desde, hasta } = req.query;
  const condiciones = ['t.id_usuario = ?'];
  const params = [req.usuario.id];
  if (desde) { condiciones.push('t.fecha >= ?'); params.push(desde); }
  if (hasta) { condiciones.push('t.fecha <= ?'); params.push(hasta); }
  try {
    const [filas] = await db.query(
      `SELECT c.id_categoria, c.nombre AS categoria, tp.nombre AS tipo,
              SUM(t.monto) AS total, COUNT(*) AS cantidad
       FROM transacciones t
       JOIN categorias c ON c.id_categoria = t.id_categoria
       JOIN tipos_transaccion tp ON tp.id_tipo = t.id_tipo
       WHERE ${condiciones.join(' AND ')}
       GROUP BY c.id_categoria, c.nombre, tp.nombre
       ORDER BY total DESC`,
      params
    );
    res.json(filas);
  } catch (err) {
    res.status(500).json({ error: 'Error al generar el reporte' });
  }
});

router.get('/resumen', async (req, res) => {
  try {
    const [filas] = await db.query(
      `SELECT
         COALESCE(SUM(CASE WHEN tp.nombre = 'Ingreso' THEN t.monto END), 0) AS total_ingresos,
         COALESCE(SUM(CASE WHEN tp.nombre = 'Gasto' THEN t.monto END), 0) AS total_gastos
       FROM transacciones t
       JOIN tipos_transaccion tp ON tp.id_tipo = t.id_tipo
       WHERE t.id_usuario = ?`,
      [req.usuario.id]
    );
    const ingresos = Number(filas[0].total_ingresos);
    const gastos = Number(filas[0].total_gastos);
    res.json({ total_ingresos: ingresos, total_gastos: gastos, balance: ingresos - gastos });
  } catch (err) {
    res.status(500).json({ error: 'Error al generar el resumen' });
  }
});

module.exports = router;
