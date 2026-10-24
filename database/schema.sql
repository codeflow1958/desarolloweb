CREATE DATABASE IF NOT EXISTS gastos_personales CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gastos_personales;

CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_transaccion (
  id_tipo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS categorias (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(150) NULL
);

CREATE TABLE IF NOT EXISTS transacciones (
  id_transaccion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_categoria INT NOT NULL,
  id_tipo INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  descripcion VARCHAR(200) NULL,
  fecha DATE NOT NULL,
  CONSTRAINT fk_trans_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_trans_categoria FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  CONSTRAINT fk_trans_tipo FOREIGN KEY (id_tipo) REFERENCES tipos_transaccion(id_tipo)
);

INSERT IGNORE INTO tipos_transaccion (id_tipo, nombre) VALUES (1, 'Ingreso'), (2, 'Gasto');

INSERT IGNORE INTO categorias (nombre, descripcion) VALUES
  ('Salario', 'Ingresos por trabajo'),
  ('Alimentación', 'Comida y supermercado'),
  ('Transporte', 'Gasolina, bus, taxi'),
  ('Servicios', 'Luz, agua, internet, teléfono'),
  ('Entretenimiento', 'Salidas, streaming, juegos'),
  ('Salud', 'Medicinas y consultas'),
  ('Educación', 'Cursos, libros, matrícula');
