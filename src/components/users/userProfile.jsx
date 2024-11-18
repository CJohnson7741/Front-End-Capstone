import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // to get the userId from URL
import { getUserByUserName } from "../../services/userService";
import { getTournamentsByUserId } from "../../services/tournamentService";
import { getUserNameById } from "../../services/userService";
import "./user.css";
export const UserDetails = () => {
  const { userId } = useParams(); // Get userId from the URL params
  const [user, setUser] = useState(null); // Initially null, will be set after fetching user data
  const [userTournaments, setUserTournaments] = useState([]); // Initial empty array
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userName = await getUserNameById(userId);

        // Fetch the user details using the userName
        const userData = await getUserByUserName(userName);
        if (userData && userData.length > 0) {
          const userObject = userData[0];
          console.log(userData[0]);
          setUser(userObject);
        } else {
          console.error("No user found");
        }

        // Fetch the tournaments for the user using userId
        const tournamentsData = await getTournamentsByUserId(userId);
        setUserTournaments(tournamentsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]); // Re-run the effect when the `userId` changes

  if (loading) {
    return <div>Loading...</div>; // Show loading spinner or text while data is being fetched
  }

  return (
    <section className="user">
      {/* Display user header with user name */}
      <header className="user-header">
        {user ? user.userName : "No User Found"}
        {user?.isAdmin && (
          <>
            <button>Delete User</button>
          </>
        )}
      </header>

      <div>
        <span className="user-info">Tournaments:</span>
        <ul>
          {/* Check if user has tournaments and display them */}
          {userTournaments.length > 0 ? (
            userTournaments.map((tournament) => (
              <li key={tournament.id}>
                <Link to={`/tournaments/${tournament.name}`}>
                  {tournament.name}
                </Link>
                {/* Display edit/remove buttons if the user is admin */}
                {user?.isAdmin && (
                  <>
                    <button>Remove from Tournament</button>
                  </>
                )}
              </li>
            ))
          ) : (
            <span>No tournaments found for this user.</span>
          )}
        </ul>
      </div>
    </section>
  );
};
