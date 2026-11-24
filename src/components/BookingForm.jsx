
import { useState } from "react";

export function BookingForm({ match, onBook, onClose }) {
  const [userName, setUserName] = useState("");
  const [tickets, setTickets] = useState(1);

  const totalPrice = match.price * tickets;

  const handleSubmit = (e) => {
    e.preventDefault();

    onBook({
      match,
      userName,
      tickets,
      totalPrice,
    });
  };

  return (
    <div className="booking-form">
      <h2>Book Your Tickets</h2>

      <h3>
        {match.team1} vs {match.team2}
      </h3>

      <p>Venue: {match.venue}</p>
      <p>Price per ticket: ₹{match.price}</p>
      <p>Available seats: {match.availableSeats}</p>

      <form onSubmit={handleSubmit}>
        <label>Your Name</label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          required
        />

        <label>Number of Tickets</label>
        <input
          type="number"
          min="1"
          max={match.availableSeats}
          value={tickets}
          onChange={(e) => setTickets(Number(e.target.value))}
          required
        />

        <h3>Total: ₹{totalPrice}</h3>

        <button type="submit">Confirm Booking</button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
}
