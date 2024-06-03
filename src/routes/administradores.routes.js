import { Router } from "express";
import { getAdmin, getAdminByMuseum, updateAdmin, createAdmin } from "../controllers/administradores.controllers.js";

const router = Router();

router.get("/admin", getAdmin);

router.put("/admin", updateAdmin);

router.post("/admin/museum", getAdminByMuseum);

router.post("/createAdmin", createAdmin);

export default router;
