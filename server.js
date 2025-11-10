// server.js

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require('path'); // ¡Necesitas importar 'path'!

const app = express();
app.use(cors());
app.use(express.json());

// Base de datos SQLite (sin cambios)
const db = new sqlite3.Database("reservas.db");

// Crear tabla si no existe (sin cambios)
db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room INTEGER,
    start TEXT,
    end TEXT
  )
`);

// Obtener todas las reservas (sin cambios)
app.get("/appointments", (req, res) => {
  db.all("SELECT * FROM appointments", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear nueva reserva (sin cambios)
app.post("/appointments", (req, res) => {
  const { room, start, end } = req.body;
  db.run(
    "INSERT INTO appointments (room, start, end) VALUES (?, ?, ?)",
    [room, start, end],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, room, start, end });
    }
  );
});

// Editar reserva (sin cambios)
app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { room, start, end } = req.body;
  db.run(
    "UPDATE appointments SET room = ?, start = ?, end = ? WHERE id = ?",
    [room, start, end, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, room, start, end });
    }
  );
});

// Eliminar reserva (sin cambios)
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM appointments WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});


// server.js (Sección de configuración del Frontend)

// ... todas tus rutas de API GET, POST, PUT, DELETE ...

// ----------------------------------------------------
// --- CONFIGURACIÓN PARA SERVIR EL FRONTEND COMPILADO ---
// ----------------------------------------------------

// 1. Sirve los archivos estáticos (JS, CSS, etc.)
app.use(express.static(path.join(__dirname, 'build')));

// 2. Maneja todas las demás peticiones GET (SPA - Usando un parámetro capturado)
// El '/*' o '*' suele fallar; esta es la solución más segura.
app.get('/:path', function (req, res) { 
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// ----------------------------------------------------

app.listen(5000, () => console.log("Servidor corriendo en puerto 5000"));

// server.js (casi al final)

// Usa la variable de entorno PORT si existe (lo que hace el servidor de hosting), sino usa 5000
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));