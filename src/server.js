require('dotenv').config();
const express = require('express');
const cors = require('cors');
const verificarToken = require('./middleware/auth');
const crearRouterCatalogo = require('./routes/catalogo');
const authRoutes = require('./routes/auth');
const transaccionesRoutes = require('./routes/transacciones');
const reportesRoutes = require('./routes/reportes');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Control de Gastos Personales' });
});

app.use('/api/auth', authRoutes);

app.use(
  '/api/categorias',
  verificarToken,
  crearRouterCatalogo({
    tabla: 'categorias',
    id: 'id_categoria',
    campos: ['nombre', 'descripcion'],
    obligatorios: ['nombre'],
    etiqueta: 'Categoría'
  })
);

app.use(
  '/api/tipos-transaccion',
  verificarToken,
  crearRouterCatalogo({
    tabla: 'tipos_transaccion',
    id: 'id_tipo',
    campos: ['nombre'],
    obligatorios: ['nombre'],
    etiqueta: 'Tipo de transacción'
  })
);

app.use('/api/transacciones', verificarToken, transaccionesRoutes);
app.use('/api/reportes', verificarToken, reportesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
