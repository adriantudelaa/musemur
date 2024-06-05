import { Router } from "express";
import { getReservas, getReservasByUser, getReservasByAdmin, postReservas, updateReserva, deleteReservaByAdmin } from "../controllers/reservas.controllers.js";

const router = Router();

router.get("/reservas", getReservas);

router.post("/reservas/user", getReservasByUser);

router.post("/reservas/admin", getReservasByAdmin);

router.post("/reservas", postReservas);

router.put("/reservas", updateReserva);

router.delete("/reservas/admin", deleteReservaByAdmin);

export default router;
