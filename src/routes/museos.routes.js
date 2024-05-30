import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos } from "../controllers/museos.controllers.js";

const router = Router();

router.post("/museosCity", getMuseosCity);

router.post("/museosName", getMuseo);

router.post("/museos", getMuseos);

router.put("/museos", putMuseos);

export default router;
