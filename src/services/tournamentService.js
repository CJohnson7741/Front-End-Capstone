import { getUserByParticipantID } from "./userService";

export const getAllTournaments = () => {
  return fetch("http://localhost:8088/tournaments").then((res) => res.json());
};

export const getTournamentById = (tournamentId) => {
  return fetch(`http://localhost:8088/tournamnets?${tournamentId}`).then(
    (res) => res.json()
  );
};

export const getTournamentByName = async (name) => {
  const response = await fetch(
    `http://localhost:8088/tournaments?name=${name}`
  );
  const data = await response.json();
  return data;
};

// Function to get tournaments the user is part of
export const getTournamentsByUserId = (userId) => {
  return fetch("http://localhost:8088/tournamentParticipants")
    .then((res) => res.json())
    .then((participantsData) => {
      // Filter participants by the userId
      const userTournaments = participantsData.filter(
        (participant) => participant.participantId === parseInt(userId)
      );

      // Extract the tournamentIds
      const tournamentIds = userTournaments.map(
        (participant) => participant.tournamentId
      );

      // Fetch the corresponding tournaments
      return fetch("http://localhost:8088/tournaments")
        .then((res) => res.json())
        .then((tournamentsData) => {
          // Filter tournaments by the tournamentIds the user is part of
          return tournamentsData.filter((tournament) =>
            tournamentIds.includes(tournament.id)
          );
        });
    });
};

// Function to fetch both user data and their tournaments
export const getUserWithTournaments = (userId) => {
  return fetch(
    `http://localhost:8088/Users?_expand=tournaments&id=${userId}`
  ).then((res) => res.json());
};

// Service function to get participants and users for a given tournamentId
export const getTournamentParticipantsByTournamentId = async (tournamentId) => {
  try {
    // Fetch the tournament participants with expanded tournament info
    const response = await fetch(
      `http://localhost:8088/TournamentParticipants?_expand=tournament&_expand=participant`
    );
    const participants = await response.json();

    // Filter the participants by tournamentId (if not already filtered)
    const filteredParticipants = participants.filter(
      (participant) => participant.tournamentId === tournamentId
    );

    // Fetch users associated with these participants
    const users = await Promise.all(
      filteredParticipants.map(async (participant) => {
        const user = await getUserByParticipantID(participant.participantId);
        return { ...participant, user }; // Merge user data with participant data
      })
    );

    return users; // Return the participants with user data
  } catch (error) {
    console.error("Error fetching tournament participants:", error);
    return [];
  }
};

export const createTournament = async (tournamentData) => {
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
  } catch (error) {
    console.error("Error creating tournament:", error);
  }
};

// tournamentService.js

export const deleteTournament = async (tournamentId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/Tournaments/${tournamentId}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to delete tournament");
    }
  } catch (error) {
    console.error("Error deleting tournament:", error);
    throw error; // Re-throw error to be caught in the calling function
  }
};

export const updateTournamentName = async (tournamentId, newName) => {
  try {
    // Fetch the current tournament data
    const response = await fetch(
      `http://localhost:8088/Tournaments/${tournamentId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch tournament data");
    }
    const tournamentData = await response.json();

    // Update only the name, preserving the rest of the tournament data
    const updatedTournament = { ...tournamentData, name: newName };

    // Send the updated tournament object back to the server
    const updateResponse = await fetch(
      `http://localhost:8088/Tournaments/${tournamentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTournament),
      }
    );

    if (!updateResponse.ok) {
      throw new Error("Failed to update tournament");
    }

    // Return the updated tournament object
    return await updateResponse.json();
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update tournament name");
  }
};
