import { Router } from "express";
import {seeUsers, createUser,updateUserData,updateUserPswrd,deleteUser,loginUser,logoutUser, loginAdmin, resetPassword, verifyAdminDni} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/User", seeUsers);

router.post("/User", createUser);

router.put("/UserData", updateUserData);

router.put("/UserPswrd", updateUserPswrd);

router.delete("/User", deleteUser);

router.post('/Userlogin', loginUser);

router.post('/AdminLogin', loginAdmin);

router.post('/ResetPassword', resetPassword);

router.post('/VerifyAdminDni', verifyAdminDni);

router.post('/UserLogout', logoutUser)


export default router;
