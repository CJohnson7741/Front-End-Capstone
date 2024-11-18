import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import { getAllGames } from "../../services/game";
import "./createTournament.css";

// API call to create a new tournament
const createTournament = async (tournamentData) => {
  try {
    const response = await fetch("http://localhost:8088/Tournaments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(tournamentData),
    });

    if (!response.ok) {
      throw new Error("Failed to create tournament");
    }

    const newTournament = await response.json();
    console.log("Tournament created:", newTournament);
    return newTournament; // Return the created tournament data
  } catch (error) {
    console.error("Error creating tournament:", error);
  }
};

export const CreateTournament = () => {
  const [tournamentName, setTournamentName] = useState("");
  const [gameId, setGameId] = useState(""); // Store the selected gameId
  const [bracketSize, setBracketSize] = useState(16); // Default value for bracket size
  const [games, setGames] = useState([]); // Store games data
  const [loading, setLoading] = useState(true); // Loading state
  const navigate = useNavigate(); // Hook to navigate to different pages

  // Fetch games from the database
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const gameData = await getAllGames(); // Fetch all games data
        setGames(gameData); // Update state with the fetched games
      } catch (err) {
        console.error("Failed to fetch games:", err);
      } finally {
        setLoading(false); // Once games are fetched, stop loading
      }
    };

    fetchGames();
  }, []);

  const handleCreateTournament = async (e) => {
    e.preventDefault();

    // Check if gameId and tournament name are provided
    if (!gameId || !tournamentName) {
      alert("Please select a game and provide a tournament name.");
      return;
    }

    // Prepare the tournament data to be sent to the API
    const newTournament = {
      name: tournamentName,
      gameId: gameId, // Use the selected game's ID
      bracketSize: bracketSize,
      userId: 1, // This should be dynamic based on the logged-in user
      status: "Active", // Default status; this can be changed based on your logic
      round: "Round 1", // You can customize this based on the tournament's round
    };

    // Call the createTournament function to send data to the backend
    await createTournament(newTournament);

    // Reset the form after creating the tournament
    setTournamentName("");
    setGameId("");
    setBracketSize(16);

    // Redirect the user to the tournament list page
    navigate("/Tournaments"); // Replace with the correct route for the tournament list page
  };

  // If the games are still loading, show loading message
  if (loading) {
    return <div>Loading games...</div>;
  }

  return (
    <div>
      <h2>Create New Tournament</h2>
      <form onSubmit={handleCreateTournament}>
        <div>
          <label>Tournament Name</label>
          <input
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Game</label>
          <select
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a game
            </option>
            {games.map((gameItem) => (
              <option key={gameItem.id} value={gameItem.id}>
                {gameItem.gameName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Bracket Size</label>
          <input
            type="number"
            value={bracketSize}
            onChange={(e) => setBracketSize(e.target.value)}
            min="2" // Ensure that the bracket size is at least 2
            required
          />
        </div>

        <button type="submit">Create Tournament</button>
      </form>
    </div>
  );
};
