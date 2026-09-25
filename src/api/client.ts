const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `API request failed: ${response.status} ${response.statusText}`,
      );
    }

    if (!text) {
      throw new Error("Backend returned an empty response.");
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      throw new Error(
        "Backend returned invalid JSON.",
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Unable to connect to backend at ${url}`,
      );
    }

    throw error;
  }
}

export { API_BASE_URL, apiRequest };