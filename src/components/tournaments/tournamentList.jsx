import React, { useState, useEffect } from "react";
import { getAllTournaments } from "../../services/tournamentService";
import { getAllGames } from "../../services/game";
import { Link, useNavigate } from "react-router-dom";
import { getParticipantsCount } from "./participantsCounter";
import { updateTournamentName } from "../../services/tournamentService"; // Import the updateTournamentName function
import "./tournamentList.css";

export const TournamentList = () => {
  const [tournaments, setTournaments] = useState([]); // Initialize as an empty array
  const [games, setGames] = useState([]); // Store games data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [participantsCount, setParticipantsCount] = useState({}); // Store participant counts
  const navigate = useNavigate();

  // Get user data from localStorage and check if user is an admin
  const userData = JSON.parse(localStorage.getItem("user_data"));
  const isAdmin = userData && userData.isAdmin;

  // Fetch tournaments and games data when the component mounts
  useEffect(() => {
    const fetchTournamentsAndGames = async () => {
      try {
        const tournamentData = await getAllTournaments(); // Fetch tournaments data
        const gameData = await getAllGames(); // Fetch all games data

        setTournaments(tournamentData); // Update tournaments state
        setGames(gameData); // Update games state
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchTournamentsAndGames(); // Call the async function inside useEffect
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Fetch participants count for each tournament
  useEffect(() => {
    const fetchParticipantsCounts = async () => {
      const counts = {};
      for (const tournament of tournaments) {
        const count = await getParticipantsCount(tournament.id);
        counts[tournament.id] = count;
      }
      setParticipantsCount(counts);
    };

    if (tournaments.length > 0) {
      fetchParticipantsCounts(); // Call to fetch participant counts when tournaments are loaded
    }
  }, [tournaments]); // Runs when tournaments array is updated

  // If data is still loading, show loading message
  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  // If there was an error, show the error message
  if (error) {
    return <div>{error}</div>;
  }

  // If tournaments is not an array or is empty, show a no data message
  if (!Array.isArray(tournaments) || tournaments.length === 0) {
    return <div>No tournaments found.</div>;
  }

  // Navigate to the Create Tournament page
  const handleCreateTournamentClick = () => {
    navigate("/create-tournament");
  };

  // Function to handle the editing of a tournament's name
  const handleEditTournament = async (tournamentId, currentName) => {
    const newName = prompt("Enter a new name for the tournament:", currentName);
    if (newName && newName !== currentName) {
      try {
        // Update the tournament name on the server
        const updatedTournament = await updateTournamentName(
          tournamentId,
          newName
        );

        // Update the tournament list in local state
        setTournaments((prevTournaments) =>
          prevTournaments.map((tournament) =>
            tournament.id === tournamentId
              ? { ...tournament, name: newName }
              : tournament
          )
        );
      } catch (error) {
        alert("Failed to update tournament name");
      }
    }
  };

  return (
    <div className="theme-dark">
      <h2>Tournament List</h2>

      {/* Show the "Create New Tournament" button only if the user is an admin */}
      {isAdmin && (
        <button onClick={handleCreateTournamentClick}>
          Create New Tournament
        </button>
      )}

      <ul>
        {tournaments.map((tournament) => {
          // Find the corresponding game for the tournament
          const game = games.find((game) => game.id === tournament.gameId);

          // Ensure that 'game' is defined before accessing gameName
          return (
            <li key={tournament.id}>
              <strong>
                <Link to={`/tournaments/${tournament.name}`}>
                  {tournament.name}
                </Link>
              </strong>
              Status: {tournament.status} - Game:{" "}
              {game ? game.gameName : "Unknown Game"}
              <div>
                Participants: {participantsCount[tournament.id] || "Loading..."}
              </div>
              {/* Show Edit button only if the user is an admin */}
              {isAdmin && (
                <button
                  onClick={() =>
                    handleEditTournament(tournament.id, tournament.name)
                  }
                >
                  Edit Tournament
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
