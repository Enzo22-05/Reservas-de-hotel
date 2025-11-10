// server.js

const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require('path'); // ¡Necesitas importar 'path'!

const app = express();
app.use(cors());
app.use(express.json());

// Crear o conectar la base de datos SQLite
const db = new sqlite3.Database("reservas.db");

// Crear la tabla si no existe

db.run(`
  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room INTEGER,
    startDate TEXT,
    endDate TEXT
  )
`);

// Obtener todas las reservas
app.get("/appointments", (req, res) => {
  db.all("SELECT * FROM appointments", [], (err, rows) => {
    if (err) {
      console.error("Error al obtener reservas:", err);
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Crear una nueva reserva
app.post("/appointments", (req, res) => {
  const { room, startDate, endDate } = req.body;
  if (!room || !startDate || !endDate) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  db.run(
    "INSERT INTO appointments (room, startDate, endDate) VALUES (?, ?, ?)",
    [room, startDate, endDate],
    function (err) {
      if (err) {
        console.error("Error al guardar reserva:", err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ id: this.lastID, room, startDate, endDate });
      }
    }
  );
});

// Editar una reserva existente
app.put("/appointments/:id", (req, res) => {
  const { id } = req.params;
  const { room, startDate, endDate } = req.body;

  db.run(
    "UPDATE appointments SET room = ?, startDate = ?, endDate = ? WHERE id = ?",
    [room, startDate, endDate, id],
    function (err) {
      if (err) {
        console.error("Error al actualizar reserva:", err);
        res.status(500).json({ error: err.message });
      } else {
        res.json({ updated: this.changes });
      }
    }
  );
});

// Eliminar una reserva
app.delete("/appointments/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM appointments WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error al eliminar reserva:", err);
      res.status(500).json({ error: err.message });
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

// Iniciar el servidor en el puerto 3001
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
