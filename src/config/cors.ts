import createCors from "cors";

const origin = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://foodhubx.vercel.app",
  "https://foodhub.tariqul.dev",
];

const cors = createCors({
  origin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

export { cors };
