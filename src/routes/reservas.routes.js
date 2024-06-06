import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.js";
import { getReservas, getReservasByUser, getReservasByAdmin, postReservas, putReservas, deleteReservaByAdmin, getUserReservations } from "../controllers/reservas.controllers.js";

const router = Router();

router.get("/reservas", getReservas);

router.post("/reservas/user", getReservasByUser);

router.post("/reservas/admin", getReservasByAdmin);

router.post("/reservas", verifyToken, postReservas);

router.put("/reservas", putReservas);

router.delete("/reservas/admin", deleteReservaByAdmin);

router.get('/reservas/user', verifyToken, getUserReservations);

export default router;
