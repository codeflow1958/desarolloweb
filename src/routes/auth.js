const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verificarToken = require('../middleware/auth');

const router = express.Router();

function firmarToken(usuario) {
  return jwt.sign(
    { id: usuario.id_usuario, email: usuario.email },
    process.env.JWT_SECRET || 'cambia_este_secreto',
    { expiresIn: process.env.JWT_EXPIRES || '8h' }
  );
}

router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  try {
    const hash = await bcrypt.hash(password, 10);
    const [resultado] = await db.query(
      'INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)',
      [nombre, email, hash]
    );
    res.status(201).json({ id_usuario: resultado.insertId, nombre, email });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }
  try {
    const [filas] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    const usuario = filas[0];
    if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }
    res.json({
      token: firmarToken(usuario),
      usuario: { id_usuario: usuario.id_usuario, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const [filas] = await db.query(
      'SELECT id_usuario, nombre, email, fecha_registro FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id]
    );
    if (!filas[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(filas[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

module.exports = router;
