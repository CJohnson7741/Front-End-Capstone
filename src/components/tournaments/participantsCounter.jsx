import { getTournamentParticipantsByTournamentId } from "../../services/tournamentService";

// Function to get the number of participants for a specific tournament
export const getParticipantsCount = async (tournamentId) => {
  try {
    // Fetch participants for the given tournamentId
    const tournamentParticipants =
      await getTournamentParticipantsByTournamentId(tournamentId);

    // Filter the TournamentParticipants by the given tournamentId
    const participantsForTournament = tournamentParticipants.filter(
      (participant) => participant.tournamentId === parseInt(tournamentId)
    );

    // Return the count of participants for the specific tournament
    return participantsForTournament.length;
  } catch (error) {
    console.error("Error fetching participants for tournament:", error);
    return 0; // Return 0 or some fallback value in case of error
  }
};
