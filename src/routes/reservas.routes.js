import { Router } from "express";
import { getReservas, getReservasByUser, getReservasByAdmin, postReservas, putReservas, deleteReservaByAdmin } from "../controllers/reservas.controllers.js";

const router = Router();

router.get("/reservas", getReservas);

router.get("/reservas/user", getReservasByUser);

router.get("/reservas/admin", getReservasByAdmin);

router.post("/reservas", postReservas);

router.put("/reservas", putReservas);

router.delete("/reservas/admin", deleteReservaByAdmin);

export default router;
