import { Router } from "express";
import { addExhibition, getExhibitionsByMuseum, updateExhibition, deleteExhibitionsByMuseum, deleteExhibition } from "../controllers/exposiciones.controller.js";

const router = Router();

router.post("/exposiciones", addExhibition);

router.get("/exposiciones/:id_museo", getExhibitionsByMuseum);

router.put("/exposiciones", updateExhibition);

router.delete("/exposiciones/:id_museo", deleteExhibitionsByMuseum);

router.delete("/exposicion/:id_expo", deleteExhibition);

export default router;
