export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function formatError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    return `Server responded with status ${error.response.status}: ${error.response.data}`;
  } else if (error.request) {
    // The request was made but no response was received
    return "No response received from server";
  } else {
    // Something happened in setting up the request
    return `Error: ${error.message}`;
  }
}