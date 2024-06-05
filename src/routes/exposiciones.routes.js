import { Router } from "express";
import { getAllExposiciones, getExposicionesByMuseum, addExposicion, editExposicion, deleteExposicion } from "../controllers/exposiciones.controller";

const router = Router();

router.get("/exposiciones", getAllExposiciones);

router.post("/exposiciones/museum", getExposicionesByMuseum);

router.post("/exposiciones", addExposicion);

router.put("/exposiciones", editExposicion);

router.delete("/exposiciones", deleteExposicion);

export default router;
