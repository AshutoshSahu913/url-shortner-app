import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if the Authorization header is present
    if (!authHeader) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if the Authorization header starts with "Bearer "
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token format",
      });
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(" ")[1];
    // Verify the token and decode it
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    // Attach the decoded token to the request object for use in subsequent middleware or route handlers
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized Access" });
  }
  next();
};
