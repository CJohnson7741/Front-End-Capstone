import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { createUser, getUserByUserName } from "../../services/userService";

export const Register = (props) => {
  const [user, setUser] = useState({
    userName: "",
    isAdmin: false,
  });

  let navigate = useNavigate();

  // Update the state with the new user data
  const registerNewUser = () => {
    // Send the user data to the backend or mock service
    createUser(user).then((createdUser) => {
      if (createdUser.hasOwnProperty("id")) {
        localStorage.setItem(
          "user_data", // Store user info in localStorage
          JSON.stringify({
            id: createdUser.id,
            isAdmin: createdUser.isAdmin,
          })
        );

        navigate("/"); // Navigate to homepage after registration
      }
    });
  };

  // Handle the registration form submission
  const handleRegister = (e) => {
    e.preventDefault();

    // Check if the userName already exists in the database
    getUserByUserName(user.userName).then((response) => {
      if (response.length > 0) {
        // If the username exists, show an alert
        window.alert(
          "Username is already taken. Please choose a different username."
        );
      } else {
        // If the username is unique, create the new user
        registerNewUser();
      }
    });
  };

  // Update the state when input fields change
  const updateUser = (evt) => {
    const { id, value } = evt.target; // Destructure event target
    setUser((prevUser) => ({
      ...prevUser, // Spread previous state to preserve other fields
      [id]: value, // Update the changed field
    }));
  };

  return (
    <main style={{ textAlign: "center" }}>
      <form className="form-login" onSubmit={handleRegister}>
        <h1>Tournament Management</h1>
        <h2>Please Register</h2>
        <fieldset>
          <div className="form-group">
            <input
              onChange={updateUser}
              type="text"
              id="userName"
              className="form-control"
              placeholder="Enter your username"
              required
              autoFocus
            />
          </div>
        </fieldset>
        <fieldset>
          <div className="form-group">
            <label>
              <input
                onChange={(evt) => {
                  setUser((prevUser) => ({
                    ...prevUser, // Keep other fields unchanged
                    isAdmin: evt.target.checked, // Update only the isAdmin field
                  }));
                }}
                type="checkbox"
                id="isAdmin" // Updated to isAdmin
              />
              I am an admin{" "}
            </label>
          </div>
        </fieldset>
        <fieldset>
          <div className="form-group">
            <button className="login-btn btn-info" type="submit">
              Register
            </button>
          </div>
        </fieldset>
      </form>
    </main>
  );
};
