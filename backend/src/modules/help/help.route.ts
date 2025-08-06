import { Router } from "express";
import helpController from "./help.controller";

const {
    listTitles,
    getById
} = helpController;

const router = Router();

router.get("/", listTitles);
router.get("/:id", getById);

export default router;
