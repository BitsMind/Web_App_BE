import { 
    loginService, 
    logoutService, 
    signupService,
    getMeService,
    getUserProfileService,
    updateUserService
} from "../service/auth.service.js";
import dotenv from "dotenv";
dotenv.config();

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(req.body)
        res.status(201).json(await signupService(name, email, password, res, req));
    } catch (error) {
        console.error("Signup error:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        res.status(201).json(await loginService(email, password, res, req));
    } catch (error) {
        console.error("Error in login controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};
  
export const logout = async (req, res) => {
    try {
        const response = await logoutService(req.cookies.refreshToken, res);
        return res.status(200).json(response)
 
    } catch (error) {
        console.error("Error in logout controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const getMe = async (req, res) => {
    try {
        res.status(200).json(await getMeService(req.user._id));
    } catch (error) {
        console.error("Error in getMe controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const all = req.query.all === 'true'; 
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        res.status(200).json(await getUserProfileService(req.user._id, page, limit, all));
    } catch (error) {
        console.error("Error in getUserProfile controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};


export const updateUserController = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?._id;
        const { updateData } = req.body;
        res.status(200).json(await updateUserService(userId, updateData, req));
    } catch (error) {
        console.error("Error in updateUserController controller:", error.message);
        if (error.status) {
            res.status(error.status).json({ error: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error!" });
        }
    }
};






