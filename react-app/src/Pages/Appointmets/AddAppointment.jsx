import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const AppointmentBooking = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState("");
  const [reason, setReason] = useState("");

  // Fetch available services
  useEffect(() => {
    fetch("http://localhost:8000/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data));
  }, []);

  // Fetch available doctors based on service
  useEffect(() => {
    if (!selectedService) return;
    fetch(`http://localhost:8000/api/doctors/available?specialization=${selectedService}`)
      .then((res) => res.json())
      .then((data) => setDoctors(data));
  }, [selectedService]);

  // Fetch available schedules based on doctor
  useEffect(() => {
    if (!selectedDoctor) return;
    fetch(`http://localhost:8000/api/doctor/${selectedDoctor}/available-schedules`)
      .then((res) => res.json())
      .then((data) => setSchedules(data));
  }, [selectedDoctor]);

  // Handle appointment booking
  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedSchedule || !reason) {
      alert("Please fill all fields!");
      return;
    }

    fetch("http://localhost:8000/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patient_id: 1, // Replace with actual logged-in patient ID
        doctor_id: selectedDoctor,
        schedule_id: selectedSchedule,
        reason,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Appointment booked successfully!");
        setSelectedService("");
        setSelectedDoctor("");
        setSelectedSchedule("");
        setReason("");
      })
      .catch((err) => console.error("Error:", err));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Book an Appointment</h1>

      {/* Service Selection */}
      <select
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        value={selectedService}
        onChange={(e) => setSelectedService(e.target.value)}
      >
        <option value="" disabled>Select Service</option>
        {services.map((service) => (
          <option key={service.id} value={service.name}>{service.name}</option>
        ))}
      </select>

      {/* Doctor Selection */}
      <select
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        value={selectedDoctor}
        onChange={(e) => setSelectedDoctor(e.target.value)}
      >
        <option value="" disabled>Select Doctor</option>
        {doctors.map((doctor) => (
          <option key={doctor.id} value={doctor.id}>
            {doctor.first_name} {doctor.last_name} - {doctor.specialization}
          </option>
        ))}
      </select>

      {/* Small Calendar for Available Days */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Available Slots</h2>
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          height="300px"
          events={schedules.map((slot) => ({
            id: slot.id,
            title: "Available",
            start: slot.start_time,
          }))}
          dateClick={(info) => {
            const selectedSlot = schedules.find((s) => s.start_time.startsWith(info.dateStr));
            if (selectedSlot) {
              setSelectedSchedule(selectedSlot.id);
              alert(`Selected slot: ${selectedSlot.start_time}`);
            } else {
              alert("No available slots on this day.");
            }
          }}
        />
      </div>

      {/* Reason Input */}
      <textarea
        className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        placeholder="Reason for Appointment"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
      />

      {/* Book Appointment Button */}
      <button
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        onClick={handleBookAppointment}
      >
        Book Appointment
      </button>
    </div>
  );
};

export default AppointmentBooking;