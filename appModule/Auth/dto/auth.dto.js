export const tokenDTO = ( accessToken, refreshToken) => ({
        accessToken,
        refreshToken,
});


export const userDTO = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    accountId: user.accountId
});


export const accountDTO = (account) => ({
    id: account._id,
    email: account.email,
    isVerified: account.isVerified,
    lastLogin: account.lastLogin,
    userType: account.userType,
});


export const verificationDTO = (message, user, account) => ({
    success: true,
    message,
    user,
    account
});


export const resendVerificationEmailDTO = (message, accessToken) => ({
    success: true,
    message,
    accessToken
});


export const forgotPasswordDTO = (message) => ({
    success: true,
    message,
});


export const resetPasswordDTO = (message) => ({
    success: true,
    message,
});


export const logoutDTO = (message) => ({
    success: true,
    message,
});


export const refreshTokenDTO = (accessToken, message) => ({
    success: true,
    accessToken,
    message,
});
