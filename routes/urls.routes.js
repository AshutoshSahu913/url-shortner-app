import express from "express";

import { shortenPostRequestUrlSchema } from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminMiddleware } from "../middlewares/auth.middleware.js";
import {createShortUrl} from "../services/user.services.js";

const router = express.Router();

router.post("/shorten", adminMiddleware, async (req, res) => {
  try {
    const validationResult = await shortenPostRequestUrlSchema.safeParseAsync(
      req.body,
    );

    if (validationResult.error) {
      return res.status(400).json({
        errors: validationResult.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }
    const { url, code } = validationResult.data;

    const shortCode = code ?? nanoid(6);

    const result = await createShortUrl(url,shortCode,req.user.id);
   
    console.log("Shortened URL:", result);
    console.log(result);
    return res.status(201).json({
      status: "success",
      data: {
        id: result?.id,
        shortUrl: result?.code,
        targetUrl: result?.targetUrl,
      },
    });
  } catch (error) {
    console.error("Error shortening URL:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
