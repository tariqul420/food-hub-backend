import app from "./app";
import { envVars } from "./config/env";

async function startServer() {
  const port = envVars.port;
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
