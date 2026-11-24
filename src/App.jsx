
import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

import { Hero } from "./components/Hero.jsx";
import { NavBar } from "./components/NavBar.jsx";
import { MatchCard } from "./components/MatchCard.jsx";
import { BookingForm } from "./components/BookingForm.jsx";
import { Footer } from "./components/Footer.jsx";

function App() {
  const [matches, setMatches] = useState([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch matches from Supabase
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("id");

      if (error) {
        console.error("Fetch error:", error.message);
        setError(error.message);
      } else {
        const formattedMatches = data.map((match) => ({
          ...match,
          availableSeats: match.available_seats,
        }));

        setMatches(formattedMatches);
      }

      setLoading(false);
    };

    fetchMatches();
  }, []);

  // Save booking and update available seats
  const handleBooking = async (bookingDetails) => {
    const { match, userName, tickets, totalPrice } = bookingDetails;

    if (
      !userName.trim() ||
      !Number.isInteger(tickets) ||
      tickets < 1 ||
      tickets > match.availableSeats
    ) {
      alert("Please enter a valid name and ticket quantity.");
      return;
    }

    // Insert booking into Supabase
    const { error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          match_id: match.id,
          user_name: userName.trim(),
          match_title: `${match.team1} vs ${match.team2}`,
          tickets: tickets,
          total_price: totalPrice,
        },
      ]);

    if (bookingError) {
      console.error("Booking error:", bookingError.message);
      alert("Booking failed: " + bookingError.message);
      return;
    }

    // Update available seats in Supabase
    const newSeats = match.availableSeats - tickets;

    const { error: updateError } = await supabase
      .from("matches")
      .update({ available_seats: newSeats })
      .eq("id", match.id);

    if (updateError) {
      console.error("Seat update error:", updateError.message);
      alert(
        "Booking was saved, but seat update failed. Please contact the administrator."
      );
      return;
    }

    // Update React state
    setMatches((previousMatches) =>
      previousMatches.map((item) =>
        item.id === match.id
          ? {
              ...item,
              availableSeats: newSeats,
              available_seats: newSeats,
            }
          : item
      )
    );

    setTotalBookings((previous) => previous + 1);
    setSelectedMatch(null);

    alert("Booking successful!");
  };

  return (
    <div>
      <NavBar totalBookings={totalBookings} />

      <Hero />

      <main id="matches">
        <h2>Upcoming Matches</h2>

        {loading && <p>Loading matches...</p>}

        {error && <p>Error: {error}</p>}

        {!loading && !error && matches.length === 0 && (
          <p>No matches available.</p>
        )}

        <div className="matches-container">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSelectMatch={(selected) => setSelectedMatch(selected)}
            />
          ))}
        </div>

        {selectedMatch && (
          <BookingForm
            match={selectedMatch}
            onBook={handleBooking}
            onClose={() => setSelectedMatch(null)}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
