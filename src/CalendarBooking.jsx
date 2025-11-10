import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarBooking.css";

const CalendarBooking = () => {
  const [selectedRange, setSelectedRange] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(1);

  // Cargar reservas desde backend
  useEffect(() => {
    // Usando ruta relativa para unificación: /appointments
    fetch("/appointments") 
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((error) => console.error("Error al cargar citas:", error)); 
  }, []);

  // *** NOTA: La función getDisabledDates ha sido eliminada. ***

  const handleBooking = () => {
    if (!selectedRange || selectedRange.length !== 2) {
      alert("Seleccione un rango de días primero");
      return;
    }

    const [startDate, endDate] = selectedRange;
    const newAppointment = {
      room: selectedRoom,
      start: startDate.toLocaleDateString("es-ES"),
      end: endDate.toLocaleDateString("es-ES"),
    };

    fetch("/appointments", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAppointment),
    })
      .then((res) => res.json())
      .then((data) => setAppointments([...appointments, data]))
      .catch((error) => console.error("Error al crear cita:", error));

    setSelectedRange(null);
  };

  const handleDelete = (id) => {
    fetch(`/appointments/${id}`, { method: "DELETE" }) 
      .then(() => setAppointments(appointments.filter((a) => a.id !== id)))
      .catch((error) => console.error("Error al eliminar cita:", error));
  };

  const handleEdit = (id) => {
    const appt = appointments.find((a) => a.id === id);
    if (!appt) return;

    const start = prompt("Nueva fecha de inicio (dd/mm/yyyy):", appt.start);
    const end = prompt("Nueva fecha de fin (dd/mm/yyyy):", appt.end);
    const room = prompt("Nueva habitación (1-8):", appt.room);

    if (!start || !end || !room) return;

    const updatedAppointment = { room: parseInt(room), start, end };

    fetch(`/appointments/${id}`, { 
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedAppointment),
    })
      .then(() => {
        setAppointments(
          appointments.map((a) => (a.id === id ? { id, ...updatedAppointment } : a))
        );
      })
      .catch((error) => console.error("Error al editar cita:", error));
  };

  return (
    <div className="calendar-container">
      <h2>Calendario de Reservas</h2>

      <Calendar
        selectRange={true}
        onChange={setSelectedRange}
        value={selectedRange}
        // *** IMPORTANTE: La propiedad tileDisabled ha sido eliminada por completo. ***
      />

      {selectedRange && selectedRange.length === 2 && (
        <div className="booking-section">
          <p>
            Reservar del <strong>{selectedRange[0].toDateString()}</strong> al{" "}
            <strong>{selectedRange[1].toDateString()}</strong>
          </p>

          <label>
            Seleccione habitación:
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(parseInt(e.target.value))}
            >
              {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  Habitación {num}
                </option>
              ))}
            </select>
          </label>

          <button onClick={handleBooking}>Agendar Reserva</button>
        </div>
      )}

      <h3>Turnos Agendados</h3>
      {appointments.length === 0 ? (
        <p>No hay turnos agendados.</p>
      ) : (
        <ul className="appointments-list">
          {appointments.map((appt) => (
            <li key={appt.id}>
              Habitación <strong>{appt.room}</strong>: del <strong>{appt.start}</strong> al{" "}
              <strong>{appt.end}</strong>{" "}
              <button onClick={() => handleEdit(appt.id)}>Editar</button>{" "}
              <button onClick={() => handleDelete(appt.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CalendarBooking;