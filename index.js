import express from "express";
import 'dotenv/config';
import userRoutes from "./routes/user.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Start the server
app.use(express.json());

//user routes
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});




