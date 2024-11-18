export const getAllUsers = () => {
  return fetch("http://localhost:8088/users").then((res) => res.json());
};
export const getUserByUserName = (userName) => {
  const url = `http://localhost:8088/users?userName=${userName}`;
  console.log("Fetching user data from:", url); // Log the URL to check
  return fetch(url)
    .then((res) => res.json())
    .then((data) => {
      console.log("Response data:", data); // Log the data from the API
      return data;
    })
    .catch((error) => {
      console.error("Error fetching user:", error);
    });
};

export const getUserNameById = async (userId) => {
  const users = await fetch("http://localhost:8088/users");
  const usersData = await users.json();
  const user = usersData.find((user) => user.id === parseInt(userId));
  return user ? user.userName : null;
};

export const createUser = (customer) => {
  return fetch("http://localhost:8088/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customer),
  }).then((res) => res.json());
};

export const getUserByParticipantID = async (participantId) => {
  try {
    const response = await fetch(
      `http://localhost:8088/users?participantId=${participantId}`
    );

    // Check if the response is OK (status 200)
    if (!response.ok) {
      throw new Error(
        `Failed to fetch user with participantId: ${participantId}`
      );
    }

    // Parse the response as JSON
    const data = await response.json();

    // Assuming your API returns an array, pick the first item
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error; // Propagate the error so it can be caught in the calling function
  }
};
