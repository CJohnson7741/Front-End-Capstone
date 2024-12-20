export const generateNextRoundMatches = (winners, round) => {
  // If there's an odd number of winners, one will have a "bye"
  const matches = [];
  if (winners.length % 2 !== 0) {
    const bye = winners.pop();
    matches.push({
      id: `${round}-${matches.length}`, // Generate a unique ID
      team1: bye,
      team2: null,
      score1: null,
      score2: null,
      winner: null,
    });
  }

  // Pair up the remaining winners
  for (let i = 0; i < winners.length; i += 2) {
    const match = {
      id: `${round}-${i / 2}`, // Generate a unique ID
      team1: winners[i],
      team2: winners[i + 1],
      score1: null,
      score2: null,
      winner: null,
    };
    matches.push(match);
  }

  return matches;
};
