import express from "express";

import { shortenPostRequestUrlSchema } from "../validation/request.validation.js";
import { db } from "../db/index.js";
import { urlsTable } from "../models/url.model.js";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { adminMiddleware } from "../middlewares/auth.middleware.js";
import {
  createShortUrl,
  getUrlByCode,
  getAllUrls,
} from "../services/user.services.js";

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

    const result = await createShortUrl(url, shortCode, req.user.id);

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

router.get("/getAllUrls", adminMiddleware, async (req, res) => {
  try {
    const urls = await getAllUrls(req.user.id);
    console.log("URLs:", urls);

    return res.status(200).json({
      status: "success",
      totalUrls: urls.length,
      urls: urls,
    });
  } catch (error) {
    console.error("Error fetching short URL:", error);
  }
});

router.delete("/:id", adminMiddleware, async (req, res) => {
  const id = req.params.id;

  try {
    const deletedData = await db
      .delete(urlsTable)
      .where(and(eq(urlsTable.id, id), eq(urlsTable.userId, req.user.id)));

    if (deletedData.rowCount === 0) {
      return res.status(404).json({
        status: "error",
        message: "URL not deleted",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "URL deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting URL:", error);

    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

router.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  try {
    const url = await getUrlByCode(shortCode);
    if (!url) {
      return res.status(404).json({
        status: "error",
        message: "URL not found",
      });
    }

    return res.redirect(url.targetUrl);
  } catch (error) {
    console.error("Error fetching short URL:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
