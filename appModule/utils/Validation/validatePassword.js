export const validatePassword = (password) => {
    if (password.length < 8)         
        return { 
        isValid: false, 
        message: "Password must be at least 8 characters long" 
    };

    // Check for complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
        return {
            isValid: false,
            message: "Password must include uppercase, lowercase letters and numbers"
        };
    }
    
    return { isValid: true };
}