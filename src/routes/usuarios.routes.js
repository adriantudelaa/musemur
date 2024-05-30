import { Router } from "express";
import {seeUsers, createUser,updateUserData,updateUserPswrd,deleteUser,loginUser, loginAdmin} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/User", seeUsers);

router.post("/User", createUser);

router.put("/UserData", updateUserData);

router.put("/UserPswrd", updateUserPswrd);

router.delete("/User", deleteUser);

router.get('/Userlogin', loginUser);

router.get('/AdminLogin', loginAdmin);

export default router;
