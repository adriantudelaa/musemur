import { Router } from "express";
import { getReservas, getUserReservations, getReservasByAdmin, postReservas, updateReserva, deleteReservaByAdmin } from "../controllers/reservas.controllers.js";
import { verifyToken } from '../../middlewares/auth.js';


const router = Router();

router.get("/reservas", getReservas);

router.get("/reservas/user", verifyToken, getUserReservations);

router.post("/reservas/admin", getReservasByAdmin);

router.post("/reservas", postReservas);

router.put("/reservas", updateReserva);

router.delete("/reservas/admin", deleteReservaByAdmin);

export default router;
