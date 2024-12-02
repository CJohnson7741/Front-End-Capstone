import { shuffleArray } from "./matchShuffler";

// Function to generate tournament brackets
export const generateTournamentBrackets = async (tournamentId) => {
  if (!tournamentId) {
    console.error("Tournament ID not found!");
    return [];
  }

  try {
    // Fetch participants for the tournament
    const participants = await fetchTournamentParticipants(tournamentId);

    // Fetch user IDs from the participants and ensure they exist
    const userIds = participants.map(
      (participant) => participant.participantId
    );

    // Fetch users based on participant IDs
    const allUsers = await fetchUsersForParticipants(userIds);

    if (allUsers.length === 0) {
      console.error("No users found for the participants.");
      return [];
    }

    // Shuffle the users to randomize the pairings
    shuffleArray(allUsers);

    // Initialize an array to store all rounds' matches
    const rounds = [];
    let roundMatches = generateInitialRoundMatches(allUsers);

    rounds.push(roundMatches);

    let previousPairings = [];

    // Generate matches for further rounds until only one match is left (final)
    while (roundMatches.length > 1) {
      const winners = roundMatches
        .map((match) => match.winner)
        .filter((winner) => winner !== null);
      roundMatches = generateRoundMatches(winners, previousPairings); // Pass previous pairings
      rounds.push(roundMatches);
    }

    return rounds;
  } catch (error) {
    console.error("Error generating tournament brackets:", error);
    return [];
  }
};

// Function to generate matches for the initial round (ensures each participant has only one match)
export const generateInitialRoundMatches = (users) => {
  const matches = [];
  const usedParticipants = new Set();

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

  // Pair up users in matches, ensuring no participant is matched more than once
  while (users.length > 1) {
    let user1 = users.shift();
    let user2 = users.shift();

    // Ensure that user1 and user2 haven't been paired before in this round
    if (
      !usedParticipants.has(user1.userName) &&
      !usedParticipants.has(user2.userName)
    ) {
      const match = {
        user1: user1.userName,
        user2: user2.userName,
        score1: 0,
        score2: 0,
        winner: null, // The winner will be decided later
      };
      matches.push(match);

      // Mark these participants as used
      usedParticipants.add(user1.userName);
      usedParticipants.add(user2.userName);
    } else {
      // If either user has already been matched, push one back and select another user
      users.push(user2);
    }
  }

  return matches;
};

// Function to generate matches for a given round
export const generateRoundMatches = (users, previousPairings = []) => {
  const matches = [];

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

  // Helper function to check if a pairing already exists
  const isPairingUsed = (user1, user2) => {
    return previousPairings.some(
      (pair) =>
        (pair.user1 === user1 && pair.user2 === user2) ||
        (pair.user1 === user2 && pair.user2 === user1)
    );
  };

  // Pair up users in matches
  while (users.length > 1) {
    let user1 = users.shift();
    let user2 = users.shift();

    // Find a new pair if the combination has already been used
    while (isPairingUsed(user1.userName, user2.userName)) {
      // Move user2 back to the pool and reassign user2
      users.push(user2);
      user2 = users.shift();
    }

    const match = {
      user1: user1.userName,
      user2: user2.userName,
      score1: 0,
      score2: 0,
      winner: null, // The winner will be decided later
    };

    matches.push(match);

    // Add the new pairing to the list of previous pairings
    previousPairings.push({ user1: user1.userName, user2: user2.userName });
  }

  return matches;
};

// Function to fetch tournament participants (with participantId)
const fetchTournamentParticipants = async (tournamentId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/tournamentParticipants?tournamentId=${tournamentId}`
    );
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

// Function to fetch users for each participant based on participantId
const fetchUsersForParticipants = async (userIds) => {
  try {
    const usersPromises = userIds.map((userId) =>
      fetch(`http://localhost:8088/users?id=${userId}`)
    );

    const usersResults = await Promise.all(usersPromises);

    // Log the raw response body
    const rawUsersData = await Promise.all(
      usersResults.map((res) => res.text()) // Get raw response as text
    );

    // Now parse the response and handle errors
    const users = rawUsersData
      .map((data) => {
        try {
          return JSON.parse(data); // Attempt to parse the response to JSON
        } catch (error) {
          console.error("Failed to parse user data:", error, data);
          return null; // Return null if parsing fails
        }
      })
      .filter((user) => user !== null) // Filter out null responses (failed to parse)
      .flat(); // Flatten the array of arrays

    return users;
  } catch (error) {
    console.error("Error fetching users for participants:", error);
    return [];
  }
};
