// Default config for local development (npm start).
// Overwritten at deploy time by the CI/CD pipeline per environment.
// In local Docker it is regenerated at container start from environment variables.
window.__CONFIG__ = {
  BFF_HOST: "https://localhost"
};
