import { Router } from "express";
import { getMuseosCity, getMuseos, getMuseo, putMuseos, deleteMuseo, addMuseo } from "../controllers/museos.controllers.js";

const router = Router();

router.get("/museos", getMuseos);

router.post("/museosCity", getMuseosCity);

router.post("/museosName", getMuseo);

router.put("/museos", putMuseos);

router.delete("/museos", deleteMuseo);  // Cambiar a POST para eliminar museo usando una variable

router.post("/addMuseo", addMuseo);  // Ruta para añadir museo

export default router;
