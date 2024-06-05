import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos, deleteMuseo, addMuseo } from "../controllers/museos.controllers.js";

const router = Router();

router.get("/museos", getMuseos);

router.post("/museosCity", getMuseosCity);

router.post("/museosName", getMuseo);

router.put("/museos", putMuseos);

router.delete("/museos", deleteMuseo);

router.post("/addMuseo", addMuseo);

export default router;
