import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarBooking.css";

const CalendarBooking = () => {
  const [selectedRange, setSelectedRange] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(1);

  // 🟢 Cargar reservas desde el backend al iniciar
  useEffect(() => {
    fetch("http://localhost:3001/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Error al cargar reservas:", err));
  }, []);

  // 🟢 Manejar selección de fechas
  const handleDateChange = (range) => {
    setSelectedRange(range);
  };

  // 🟢 Agendar reserva (enviar al backend)
  const handleAddAppointment = async () => {
    if (!selectedRange || !Array.isArray(selectedRange)) {
      alert("Selecciona un rango de fechas válido.");
      return;
    }

    const [start, end] = selectedRange;
    const startDate = start.toISOString().split("T")[0];
    const endDate = end.toISOString().split("T")[0];

    try {
      const res = await fetch("http://localhost:3001/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: selectedRoom,
          startDate,
          endDate,
        }),
      });

      if (!res.ok) throw new Error("Error al guardar la reserva");

      const newAppointment = await res.json();
      setAppointments((prev) => [...prev, newAppointment]);
      alert("✅ Reserva guardada con éxito!");
    } catch (error) {
      console.error("Error al agendar:", error);
      alert("❌ Error al agendar la reserva.");
    }
  };

  // 🟢 Eliminar reserva
  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("¿Eliminar esta reserva?")) return;

    try {
      await fetch(`http://localhost:3001/appointments/${id}`, {
        method: "DELETE",
      });
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  return (
    <div className="calendar-container">
      <h1>📅 Reservas del Hotel</h1>

      <div className="calendar-section">
        <Calendar
          onChange={handleDateChange}
          selectRange={true}
          value={selectedRange}
        />
      </div>

      <div className="controls">
        <label>
          Habitación:
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <button onClick={handleAddAppointment}>Agendar reserva</button>
      </div>

      <div className="appointments-list">
        <h2>Reservas existentes</h2>
        {appointments.length === 0 ? (
          <p>No hay reservas aún.</p>
        ) : (
          <ul>
            {appointments.map((a) => (
              <li key={a.id}>
                🏨 Habitación {a.room} — {a.startDate} → {a.endDate}
                <button onClick={() => handleDeleteAppointment(a.id)}>
                  ❌ Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarBooking;
