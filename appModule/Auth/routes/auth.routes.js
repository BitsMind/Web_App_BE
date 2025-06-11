import express from "express";
import { signup, 
    login, 
    logout,
    getMe
} from "../../Auth/controllers/auth.controller.js";
import { protectRoute } from "../../utils/middleware/protectRoute.js";
import { ROLE_GROUPS } from "../../utils/middleware/role.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protectRoute(ROLE_GROUPS.ALL_USERS), getMe);
export default router;
