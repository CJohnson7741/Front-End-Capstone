import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

export const NavBar = () => {
  const navigate = useNavigate();

  // Get the user data from localStorage
  const userData = JSON.parse(localStorage.getItem("user_data"));

  return (
    <ul className="navbar">
      {/* Link to Profile page */}
      <li className="navbar-item">
        {userData ? (
          // If the user is logged in, redirect to their profile page
          <Link to={`/profile/${userData.id}`}>Profile</Link>
        ) : (
          // Otherwise, direct to a generic profile page
          <Link to="/profile">Profile</Link>
        )}
      </li>

      {/* Link to Tournaments page */}
      <li className="navbar-item">
        <Link to="/Tournaments">Tournaments</Link>
      </li>

      {/* Link to Users page */}
      <li className="navbar-item">
        <Link to="/user">Users</Link>
      </li>

      {userData ? (
        <li className="navbar-item navbar-logout">
          <Link
            className="navbar-link"
            to=""
            onClick={() => {
              localStorage.removeItem("user_data");
              navigate("/", { replace: true });
            }}
          >
            Logout
          </Link>
        </li>
      ) : (
        ""
      )}
    </ul>
  );
};
