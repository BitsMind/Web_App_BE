import { 
    loginService, 
    logoutService, 
    signupService
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







