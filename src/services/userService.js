export const getAllUsers = () => {
  return fetch("http://localhost:8088/users")
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error fetching all users:", error);
      throw error; // Propagate the error to be handled elsewhere
    });
};

export const getUserByUserName = (userName) => {
  const url = `http://localhost:8088/users?userName=${userName}`;
  console.log("Fetching user data from:", url); // Log the URL to check
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch user: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Response data:", data); // Log the data from the API
      return data;
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
    });
};

export const getUserNameById = async (userId) => {
  const url = `http://localhost:8088/users?id=${userId}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch user with ID: ${userId}`);
  }
  const usersData = await response.json();
  const user = usersData.length > 0 ? usersData[0] : null;
  return user ? user.userName : null;
};

export const createUser = (customer) => {
  return fetch("http://localhost:8088/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error creating user:", error);
      throw error; // Propagate the error to be handled elsewhere
    });
};

export const getUserByParticipantID = async (participantId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/users?participantId=${participantId}`
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch user with participantId: ${participantId}`
      );
    }

    const data = await response.json();

    if (data.length === 0) {
      console.warn(`No user found for participantId: ${participantId}`);
      return null;
    }

    // If multiple users are returned, log this for debugging
    if (data.length > 1) {
      console.warn(`Multiple users found for participantId: ${participantId}`);
    }

    return data[0]; // Assuming the first user is the correct one
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Propagate the error to be caught in the calling function
  }
};

export const getUserWithTournaments = (userId) => {
  return fetch(`http://localhost:8088/Users?_expand=tournaments&id=${userId}`)
    .then((res) => {
      if (!res.ok) {
        console.error(
          `Failed to fetch user with tournaments for ID: ${userId}`
        );
        throw new Error("Failed to fetch user with tournaments");
      }
      return res.json();
    })
    .then((data) => {
      console.log("User with Tournaments Data:", data);
      return data;
    })
    .catch((error) => {
      console.error("Error fetching user with tournaments:", error);
    });
};
