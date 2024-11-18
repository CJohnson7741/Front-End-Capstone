import { Outlet, Route, Routes, Navigate } from "react-router-dom";
import { NavBar } from "../components/nav/NavBar";
import { useState, useEffect } from "react";
import { UserDetails } from "../components/users/userProfile";
import { TournamentBracket } from "../components/tournaments/tournamentDetails";
import { TournamentList } from "../components/tournaments/tournamentList";
import { CreateTournament } from "../components/tournaments/createTournament.jsx"; // Add this import

export const ApplicationViews = () => {
  const [currentUser, setCurrentUser] = useState(null); // Set default to null

  useEffect(() => {
    const localHoneyUser = localStorage.getItem("user_data");
    const honeyUserObject = JSON.parse(localHoneyUser);

    if (honeyUserObject) {
      setCurrentUser(honeyUserObject);
    }
  }, []); // Only run once when the component mounts

  // Check if the current user is an admin
  const isAdmin = currentUser && currentUser.isAdmin;

  // Render nothing until we have the current user
  if (currentUser === null) {
    return <div>Loading...</div>; // Or redirect to a login page or show a loading spinner
  }

  // If there's a logged-in user, default to their profile page
  const defaultRoute = currentUser ? `profile/${currentUser.id}` : "/";

  return (
    <Routes>
      {/* Define the root route with a NavBar */}
      <Route
        path="/"
        element={
          <>
            <NavBar />
            <Outlet />
          </>
        }
      >
        {/* Default route for logged-in users (redirects to profile page) */}
        <Route path="/" element={<Navigate to={defaultRoute} />} />

        {/* Define the profile route directly */}
        <Route path="profile/:userId" element={<UserDetails />} />

        {/* Other routes */}
        <Route path="tournaments" index element={<TournamentList />} />
        <Route
          path="tournaments/:tournamentName"
          element={<TournamentBracket />}
        />

        {/* Route for creating a new tournament (admin-only) */}
        {isAdmin && (
          <Route path="create-tournament" element={<CreateTournament />} />
        )}
      </Route>
    </Routes>
  );
};
