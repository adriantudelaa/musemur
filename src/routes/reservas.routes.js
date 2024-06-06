import { Router } from "express";
import { verifyToken } from "../../middlewares/auth.js";
import { getReservas, getReservasByUser, getReservasByAdmin, postReservas, putReservas, deleteReservaByAdmin, getUserReservations } from "../controllers/reservas.controllers.js";

const router = Router();

router.get('/reservas', verifyToken, getReservas);
router.post('/reservas/user', verifyToken, getReservasByUser);
router.post('/reservas/admin', verifyToken, getReservasByAdmin);
router.post('/reservas', verifyToken, postReservas);
router.put('/reservas', verifyToken, putReservas);
router.delete('/reservas/admin', verifyToken, deleteReservaByAdmin);
router.get('/reservas/user', verifyToken, getUserReservations);

export default router;
