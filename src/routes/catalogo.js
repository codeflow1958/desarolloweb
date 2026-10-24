const express = require('express');
const db = require('../db');

function crearRouterCatalogo({ tabla, id, campos, obligatorios, etiqueta }) {
  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
      const [filas] = await db.query(`SELECT * FROM ${tabla} ORDER BY ${id}`);
      res.json(filas);
    } catch (err) {
      res.status(500).json({ error: `Error al listar ${etiqueta}` });
    }
  });

  router.get('/:id', async (req, res) => {
    try {
      const [filas] = await db.query(`SELECT * FROM ${tabla} WHERE ${id} = ?`, [req.params.id]);
      if (!filas[0]) return res.status(404).json({ error: `${etiqueta} no encontrado` });
      res.json(filas[0]);
    } catch (err) {
      res.status(500).json({ error: `Error al obtener ${etiqueta}` });
    }
  });

  router.post('/', async (req, res) => {
    const faltan = obligatorios.filter((c) => !req.body[c]);
    if (faltan.length) {
      return res.status(400).json({ error: `Campos obligatorios: ${faltan.join(', ')}` });
    }
    const valores = campos.map((c) => req.body[c] ?? null);
    try {
      const [resultado] = await db.query(
        `INSERT INTO ${tabla} (${campos.join(', ')}) VALUES (${campos.map(() => '?').join(', ')})`,
        valores
      );
      res.status(201).json({ [id]: resultado.insertId, ...Object.fromEntries(campos.map((c, i) => [c, valores[i]])) });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `Ya existe un registro con ese nombre` });
      }
      res.status(500).json({ error: `Error al crear ${etiqueta}` });
    }
  });

  router.put('/:id', async (req, res) => {
    const faltan = obligatorios.filter((c) => !req.body[c]);
    if (faltan.length) {
      return res.status(400).json({ error: `Campos obligatorios: ${faltan.join(', ')}` });
    }
    const valores = campos.map((c) => req.body[c] ?? null);
    try {
      const [resultado] = await db.query(
        `UPDATE ${tabla} SET ${campos.map((c) => `${c} = ?`).join(', ')} WHERE ${id} = ?`,
        [...valores, req.params.id]
      );
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: `${etiqueta} no encontrado` });
      }
      res.json({ [id]: Number(req.params.id), ...Object.fromEntries(campos.map((c, i) => [c, valores[i]])) });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ error: `Ya existe un registro con ese nombre` });
      }
      res.status(500).json({ error: `Error al actualizar ${etiqueta}` });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      const [resultado] = await db.query(`DELETE FROM ${tabla} WHERE ${id} = ?`, [req.params.id]);
      if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: `${etiqueta} no encontrado` });
      }
      res.json({ mensaje: `${etiqueta} eliminado` });
    } catch (err) {
      if (err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json({ error: `No se puede eliminar: tiene transacciones asociadas` });
      }
      res.status(500).json({ error: `Error al eliminar ${etiqueta}` });
    }
  });

  return router;
}

module.exports = crearRouterCatalogo;
