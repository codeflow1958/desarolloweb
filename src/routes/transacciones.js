const express = require('express');
const db = require('../db');

const router = express.Router();

const SELECT_BASE = `
  SELECT t.id_transaccion, t.monto, t.descripcion, t.fecha,
         t.id_categoria, c.nombre AS categoria,
         t.id_tipo, tp.nombre AS tipo
  FROM transacciones t
  JOIN categorias c ON c.id_categoria = t.id_categoria
  JOIN tipos_transaccion tp ON tp.id_tipo = t.id_tipo
`;

function validar(body) {
  const { id_categoria, id_tipo, monto, fecha } = body;
  if (!id_categoria || !id_tipo || monto === undefined || !fecha) {
    return 'id_categoria, id_tipo, monto y fecha son obligatorios';
  }
  if (isNaN(Number(monto)) || Number(monto) <= 0) {
    return 'El monto debe ser un número mayor a 0';
  }
  return null;
}

router.get('/', async (req, res) => {
  const { id_categoria, id_tipo, desde, hasta } = req.query;
  const condiciones = ['t.id_usuario = ?'];
  const params = [req.usuario.id];
  if (id_categoria) { condiciones.push('t.id_categoria = ?'); params.push(id_categoria); }
  if (id_tipo) { condiciones.push('t.id_tipo = ?'); params.push(id_tipo); }
  if (desde) { condiciones.push('t.fecha >= ?'); params.push(desde); }
  if (hasta) { condiciones.push('t.fecha <= ?'); params.push(hasta); }
  try {
    const [filas] = await db.query(
      `${SELECT_BASE} WHERE ${condiciones.join(' AND ')} ORDER BY t.fecha DESC, t.id_transaccion DESC`,
      params
    );
    res.json(filas);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar transacciones' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [filas] = await db.query(
      `${SELECT_BASE} WHERE t.id_transaccion = ? AND t.id_usuario = ?`,
      [req.params.id, req.usuario.id]
    );
    if (!filas[0]) return res.status(404).json({ error: 'Transacción no encontrada' });
    res.json(filas[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener transacción' });
  }
});

router.post('/', async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const { id_categoria, id_tipo, monto, descripcion, fecha } = req.body;
  try {
    const [resultado] = await db.query(
      `INSERT INTO transacciones (id_usuario, id_categoria, id_tipo, monto, descripcion, fecha)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.usuario.id, id_categoria, id_tipo, monto, descripcion || null, fecha]
    );
    const [filas] = await db.query(`${SELECT_BASE} WHERE t.id_transaccion = ?`, [resultado.insertId]);
    res.status(201).json(filas[0]);
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría o el tipo no existe' });
    }
    res.status(500).json({ error: 'Error al crear transacción' });
  }
});

router.put('/:id', async (req, res) => {
  const error = validar(req.body);
  if (error) return res.status(400).json({ error });
  const { id_categoria, id_tipo, monto, descripcion, fecha } = req.body;
  try {
    const [resultado] = await db.query(
      `UPDATE transacciones
       SET id_categoria = ?, id_tipo = ?, monto = ?, descripcion = ?, fecha = ?
       WHERE id_transaccion = ? AND id_usuario = ?`,
      [id_categoria, id_tipo, monto, descripcion || null, fecha, req.params.id, req.usuario.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    const [filas] = await db.query(`${SELECT_BASE} WHERE t.id_transaccion = ?`, [req.params.id]);
    res.json(filas[0]);
  } catch (err) {
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'La categoría o el tipo no existe' });
    }
    res.status(500).json({ error: 'Error al actualizar transacción' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [resultado] = await db.query(
      'DELETE FROM transacciones WHERE id_transaccion = ? AND id_usuario = ?',
      [req.params.id, req.usuario.id]
    );
    if (resultado.affectedRows === 0) {
      return res.status(404).json({ error: 'Transacción no encontrada' });
    }
    res.json({ mensaje: 'Transacción eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar transacción' });
  }
});

module.exports = router;
