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
  const [tournamentName, setTournamentName] = useState(initialTournamentName);
  const [isAdmin, setIsAdmin] = useState(false);
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
        const currentTournamentId = tournamentIdObj[0]?.id;
        setTournamentId(currentTournamentId);

        const allUsers = await fetchUsersForTournament(currentTournamentId);
        setUsers(allUsers);

        const allRounds = await generateTournamentBrackets(
          currentTournamentId,
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
          alert(`Tournament winner: ${winners[0].userName}`);
        }
      }

      return newRounds;
    });
  };

  return (
    <div className="theme theme-dark">
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
