import { shuffleArray } from "./matchSuffler";

export const generateTournamentBrackets = async (tournamentId) => {
  if (!tournamentId) {
    console.error("Tournament ID not found!");
    return [];
  }

  try {
    // Fetch participants for the tournament
    const participants = await fetchTournamentParticipants(tournamentId);
    console.log("Participants:", participants); // Debugging line

    // Fetch all users for participants concurrently
    const usersPromises = participants.map((participant) =>
      fetchUsersForParticipant(participant.participantId)
    );
    const usersResults = await Promise.all(usersPromises);

    // Flatten the results into a single array of users
    const allUsers = usersResults.flat();

    console.log("before shuffleArray", allUsers);

    // Shuffle the users to randomize the pairings
    shuffleArray(allUsers);
    console.log("Shuffled Users:", allUsers);

    // Initialize an array to store all rounds' matches
    const rounds = [];
    let roundMatches = generateRoundMatches(allUsers);

    rounds.push(roundMatches);

    // Generate matches for further rounds until only one match is left (final)
    while (roundMatches.length > 1) {
      const winners = roundMatches
        .map((match) => match.winner)
        .filter((winner) => winner !== null);
      roundMatches = generateRoundMatches(winners);
      rounds.push(roundMatches);
      console.log("Winners for the second round:", winners);
    }

    return rounds;
  } catch (error) {
    console.error("Error generating tournament brackets:", error);
    return [];
  }
};

// Function to generate matches for a given round
export const generateRoundMatches = (users) => {
  const matches = [];

  console.log("genereate round matches users", users);

  // Handle odd number of users (bye round)
  if (users.length % 2 !== 0) {
    const byeUser = users.pop(); // Remove one user for the bye round
    matches.push({
      user1: byeUser.userName,
      user2: null, // Bye means no match
      score1: null,
      score2: null,
      winner: byeUser.userName, // This user automatically advances
    });
  }

  // Pair up users in matches
  while (users.length > 1) {
    const user1 = users.shift();
    const user2 = users.shift();

    const match = {
      user1: user1.userName,
      user2: user2.userName,
      score1: 0,
      score2: 0,
      winner: null, // The winner will be decided later
    };

    matches.push(match);
  }

  return matches;
};

// Function to fetch tournament participants
const fetchTournamentParticipants = async (tournamentId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/tournamentParticipants?tournamentId=${tournamentId}`
    );

    if (!response.ok) {
      throw new Error(`Error fetching participants: ${response.statusText}`);
    }

    const participants = await response.json();

    if (!Array.isArray(participants)) {
      console.warn("Expected an array but got:", participants);
      return [];
    }

    return participants;
  } catch (error) {
    console.error("Error fetching tournament participants:", error);
    return [];
  }
};

// Function to fetch users for a given participant
const fetchUsersForParticipant = async (participantId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/users?participantId=${participantId}`
    );

    const users = await response.json();

    if (!Array.isArray(users)) {
      throw new Error(`Expected an array of users, but got: ${typeof users}`);
    }

    return users;
  } catch (error) {
    console.error("Error fetching users for participant:", error);
    return [];
  }
};
