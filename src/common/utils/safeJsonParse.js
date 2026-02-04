export function safeJsonParse(data, fallback = []) {
    try {
      return data ? JSON.parse(data) : fallback;
    } catch (error) {
      return fallback;
    }
  }