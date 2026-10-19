
const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getRisks = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/api/risks`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch risks");
  }

  return response.json();
};
