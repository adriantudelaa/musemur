import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos } from "../controllers/museos.controllers.js";

const router = Router();

router.get("/museos", getMuseos);

router.post("/museosCity", getMuseosCity);

router.post("/museosName", getMuseo);

router.put("/museos", putMuseos);

export default router;
