import { Router } from "express";
import { getAdmin, getAdminByMuseum, updateAdmin } from "../controllers/administradores.controllers.js";

const router = Router();

router.get("/admin", getAdmin);

router.put("/admin", updateAdmin);

router.get("/admin/museum", getAdminByMuseum);

export default router;
