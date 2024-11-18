import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  generateRoundMatches,
  generateTournamentBrackets,
} from "./tournamentMatches";
import "./tournament.css";
import {
  getTournamentByName,
  deleteTournament,
  updateTournamentName,
} from "../../services/tournamentService";
import { generateNextRoundMatches } from "./nextRound";

export const TournamentBracket = () => {
  const { tournamentName: initialTournamentName } = useParams();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentId, setTournamentId] = useState(null);
  const [tournamentName, setTournamentName] = useState(initialTournamentName); // State for tournament name
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("isAdmin updated:", isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    const userData = localStorage.getItem("user_data");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.isAdmin === true) {
        setIsAdmin(true);
      }
    }
  }, []);

  useEffect(() => {
    const fetchTournamentDetails = async () => {
      try {
        const tournamentIdObj = await getTournamentByName(tournamentName);
        if (!tournamentIdObj || tournamentIdObj.length === 0) {
          throw new Error("Tournament not found");
        }
        const currentTournamentId = tournamentIdObj[0]?.id;
        if (currentTournamentId) {
          setTournamentId(currentTournamentId);
        } else {
          setError("Tournament ID not found in response");
          return;
        }
        const allRounds = await generateTournamentBrackets(currentTournamentId);
        setRounds(allRounds);
      } catch (error) {
        setError("Error fetching tournament details or participants");
      } finally {
        setLoading(false);
      }
    };

    if (tournamentName) {
      fetchTournamentDetails();
    }
  }, [tournamentName]);

  const handleDeleteTournament = async () => {
    if (window.confirm("Are you sure you want to delete this tournament?")) {
      try {
        await deleteTournament(tournamentId);
        alert("Tournament deleted successfully");
        navigate("/tournaments");
      } catch (error) {
        alert("Failed to delete tournament");
      }
    }
  };

  // Function to handle editing the tournament name
  const handleEditTournamentName = async () => {
    const newName = prompt(
      "Enter a new name for the tournament:",
      tournamentName
    );
    if (newName && newName !== tournamentName) {
      try {
        // Update the tournament name via API
        await updateTournamentName(tournamentId, newName);
        setTournamentName(newName); // Update the local state with the new name
      } catch (error) {
        alert("Failed to update tournament name");
      }
    }
  };

  if (loading) return <div>Loading bracket...</div>;
  if (error) return <div>{error}</div>;

  const handleMatchWinner = (roundIndex, matchIndex, winner) => {
    setRounds((prevRounds) => {
      const newRounds = [...prevRounds];

      newRounds[roundIndex][matchIndex].winner = winner;

      const roundIsComplete = newRounds[roundIndex].every(
        (match) => match.winner !== null
      );

      if (roundIsComplete) {
        const winners = newRounds[roundIndex]
          .map((match) => match.winner)
          .filter((winner) => winner != null)
          .map((winner) => ({ userName: winner }));

        if (winners.length > 1) {
          const nextRound = generateRoundMatches(winners);
          if (newRounds.length === roundIndex + 1) {
            newRounds.push(nextRound);
          } else {
            newRounds[roundIndex + 1] = nextRound;
          }
        } else {
          console.log("Not enough winners to generate the next round.");
        }
      }

      return newRounds;
    });
  };

  return (
    <div className="theme theme-dark">
      {/* Admin-only Edit and Delete buttons moved to the top */}
      {isAdmin && (
        <div className="admin-buttons">
          <button onClick={handleEditTournamentName} className="edit-btn">
            Edit Tournament Name
          </button>
          <button onClick={handleDeleteTournament} className="delete-btn">
            Delete Tournament
          </button>
        </div>
      )}

      <h2>{tournamentName} Bracket</h2>
      <div className="bracket">
        {rounds.length === 0 ? (
          <div>No rounds available for this tournament</div>
        ) : (
          rounds.map((round, roundIndex) => (
            <div key={roundIndex} className="round">
              <h3 className="text">Round {roundIndex + 1}</h3>
              <div className="column one">
                {round.length === 0 ? (
                  <div>No matches for this round</div>
                ) : (
                  round.map((match, matchIndex) => (
                    <div key={matchIndex} className="match">
                      <div className="match-top team">
                        <span className="name">{match.user1}</span>
                        {match.score1 !== null && (
                          <span className="score">{match.score1}</span>
                        )}
                      </div>
                      <div className="match-bottom team">
                        <span className="name">{match.user2}</span>
                        {match.score2 !== null && (
                          <span className="score">{match.score2}</span>
                        )}
                      </div>
                      <div className="match-lines">
                        <div className="line one"></div>
                        <div className="line two"></div>
                      </div>
                      {match.user1 && match.user2 && !match.winner && (
                        <div className="match-actions">
                          <button
                            onClick={() =>
                              handleMatchWinner(
                                roundIndex,
                                matchIndex,
                                match.user1
                              )
                            }
                          >
                            {match.user1} Wins
                          </button>
                          <button
                            onClick={() =>
                              handleMatchWinner(
                                roundIndex,
                                matchIndex,
                                match.user2
                              )
                            }
                          >
                            {match.user2} Wins
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
