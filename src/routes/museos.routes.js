import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos,getMuseosImg } from "../controllers/museos.controllers.js";

const router = Router();

router.get("/museosCity", getMuseosCity);

router.get("/museosName", getMuseos);

router.get("/museos", getMuseo);

router.put("/museos", putMuseos);

router.get("/museosImg", getMuseosImg);

export default router;
