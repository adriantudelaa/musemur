import { Router } from "express";
import { createUser, updateUserData, updateUserPswrd, deleteUser, loginUser, loginAdmin, resetPassword, getUserProfile } from "../controllers/usuarios.controller.js";
import { verifyToken } from '../../middlewares/auth.js';

const router = Router();

router.post("/User", createUser);
router.put("/UserData", verifyToken, updateUserData);
router.put("/UserPswrd", verifyToken, updateUserPswrd);
router.delete("/User", verifyToken, deleteUser);
router.post('/Userlogin', loginUser);
router.post('/AdminLogin', loginAdmin);
router.post('/ResetPassword', resetPassword);
router.get('/UserProfile', verifyToken, getUserProfile);

export default router;
