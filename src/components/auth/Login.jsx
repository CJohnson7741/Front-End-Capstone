import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { getUserByUserName } from "../../services/userService";

export const Login = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  // Handle the login when the form is submitted
  const handleLogin = (e) => {
    e.preventDefault();

    // Get user by userName (matching the field in the database)
    getUserByUserName(userName).then((foundUsers) => {
      if (foundUsers.length === 1) {
        const user = foundUsers[0];

        // Save user data to localStorage (use isAdmin instead of isStaff)
        localStorage.setItem(
          "user_data",
          JSON.stringify({
            id: user.id,
            isAdmin: user.isAdmin,
          })
        );

        // Redirect to the home page after successful login
        navigate("/");
      } else {
        // If no user is found or multiple are found, show an alert
        window.alert("Invalid login");
      }
    });
  };

  return (
    <main className="container-login">
      <section>
        <form className="form-login" onSubmit={handleLogin}>
          <h1>Tournaments</h1>
          <h2>Please sign in</h2>
          <fieldset>
            <div className="form-group">
              <input
                type="text"
                value={userName} // Bound to userName state
                onChange={(evt) => setUserName(evt.target.value)}
                className="form-control"
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
          </fieldset>
          <fieldset>
            <div className="form-group">
              <button className="login-btn btn-info" type="submit">
                Sign in
              </button>
            </div>
          </fieldset>
        </form>
      </section>
      <section>
        <Link to="/register">Not a member yet?</Link>
      </section>
    </main>
  );
};
