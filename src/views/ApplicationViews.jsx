import { Outlet, Route, Routes } from "react-router-dom";
import { NavBar } from "../components/nav/NavBar";
import { useState, useEffect } from "react";
import { UserDetails } from "../components/users/userProfile";
import { TournamentBracket } from "../components/tournaments/tournamentDetails";
import { TournamentList } from "../components/tournaments/tournamentList";
import { CreateTournament } from "../components/tournaments/createTournament.jsx"; // Add this import

export const ApplicationViews = () => {
  const [currentUser, setCurrentUser] = useState({});

  useEffect(() => {
    const localHoneyUser = localStorage.getItem("user_data");
    const honeyUserObject = JSON.parse(localHoneyUser);

    setCurrentUser(honeyUserObject);
  }, []);

  // Check if the current user is an admin
  const isAdmin = currentUser && currentUser.isAdmin;

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
        {/* Define the profile route directly */}
        <Route path="profile/:userId" element={<UserDetails />} />

        {/* Other routes can go here */}
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
