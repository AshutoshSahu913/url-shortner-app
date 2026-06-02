import express from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import urlRoutes from "./routes/urls.routes.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Start the server
app.use(express.json());

//auth routes
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);

app.use("/api/urls", authMiddleware, urlRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
