import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos,getMuseosImg } from "../controllers/museos.controllers.js";

const router = Router();

router.get("/museosCity", getMuseosCity);

router.get("/museosName", getMuseo);

router.get("/museos", getMuseos);

router.put("/museos", putMuseos);

router.get("/museosImg", getMuseosImg);

export default router;
