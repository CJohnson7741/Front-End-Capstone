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
  updateTournamentStatus,
  fetchTournamentById, // new service function for updating tournament status
} from "../../services/tournamentService";
import { generateNextRoundMatches } from "./nextRound";

export const TournamentBracket = () => {
  const { tournamentName: initialTournamentName } = useParams();
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tournamentId, setTournamentId] = useState(null);
  const [tournamentName, setTournamentName] = useState(initialTournamentName);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

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
        const currentTournament = tournamentIdObj[0];
        setTournamentId(currentTournament.id);
        setIsStarted(currentTournament.isStarted); // Track if the tournament has started

        const allUsers = await fetchUsersForTournament(currentTournament.id);
        setUsers(allUsers);

        const allRounds = await generateTournamentBrackets(
          currentTournament.id,
          allUsers
        );
        setRounds(allRounds);
      } catch (error) {
        setError(`Error fetching tournament details: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (tournamentName) {
      fetchTournamentDetails();
    }
  }, [tournamentName]);

  const fetchUsersForTournament = async (tournamentId) => {
    try {
      const response = await fetch(
        `http://localhost:8088/Tournaments/${tournamentId}/users`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

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

  const handleEditTournamentName = async () => {
    const newName = prompt(
      "Enter a new name for the tournament:",
      tournamentName
    );
    if (newName && newName !== tournamentName) {
      setTournamentName(newName);
      try {
        await updateTournamentName(tournamentId, newName);
      } catch (error) {
        alert("Failed to update tournament name");
        setTournamentName(tournamentName);
      }
    }
  };

  const handleStartTournament = async () => {
    try {
      const updatedTournament = await updateTournamentStatus(
        tournamentId,
        true
      );
      setIsStarted(updatedTournament.isStarted);
      setTournamentName(updatedTournament.name);
      await saveGeneratedMatches();
      alert("Tournament started successfully!");
    } catch (error) {
      console.error("Error starting tournament:", error);
      alert("Failed to start tournament");
    }
  };

  const saveGeneratedMatches = async () => {
    try {
      const matches = rounds.flatMap((round) =>
        round.map((match) => ({
          tournamentId,
          participant1: match.user1.id,
          participant2: match.user2.id,
          round: match.round,
          winner: null,
        }))
      );

      await fetch("http://localhost:8088/TournamentMatches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(matches),
      });
    } catch (error) {
      console.error("Error saving generated matches:", error);
    }
  };

  const handleMatchWinner = async (roundIndex, matchIndex, winner) => {
    try {
      const updatedMatch = {
        ...rounds[roundIndex][matchIndex],
        winner: winner,
      };

      // Ensure the match ID exists and is not undefined
      if (!updatedMatch.id) {
        throw new Error("Match ID is missing");
      }

      // Update the match in the database
      const response = await fetch(
        `http://localhost:8088/TournamentMatches/${updatedMatch.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMatch),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update the match");
      }

      // Update rounds in the state
      const updatedRounds = [...rounds];
      updatedRounds[roundIndex][matchIndex] = updatedMatch;

      // Check if it's the last round
      if (isLastRoundInTournament(updatedRounds, roundIndex)) {
        const winners = updatedRounds[roundIndex].map((match) => match.winner);
        const nextRoundMatches = generateNextRoundMatches(
          winners,
          roundIndex + 1
        );
        updatedRounds.push(nextRoundMatches);
      }

      setRounds(updatedRounds);
      alert(`${winner} wins!`);
    } catch (error) {
      console.error("Error saving winner:", error);
      alert("Failed to save the winner.");
    }
  };

  const isLastRoundInTournament = (rounds, currentRoundIndex) => {
    return currentRoundIndex === rounds.length - 1;
  };

  if (loading) return <div>Loading bracket...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="theme theme-dark">
      {isAdmin && (
        <div className="admin-buttons">
          {!isStarted && (
            <button onClick={handleStartTournament} className="start-btn">
              Start Tournament
            </button>
          )}

          <div className="admin-actions">
            <button onClick={handleEditTournamentName} className="edit-btn">
              Edit Tournament Name
            </button>
            <button onClick={handleDeleteTournament} className="delete-btn">
              Delete Tournament
            </button>
          </div>
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
                  <div>Loading matches...</div>
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
