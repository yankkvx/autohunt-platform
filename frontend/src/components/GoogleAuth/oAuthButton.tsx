import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Box, Typography } from "@mui/material";

interface GoogleOAuthButtonProps {
    mode: "login" | "register";
    onSuccess: (credentialResponse: any) => void;
    onError: () => void;
    additionalData?: {
        account_type?: string;
        phone_number?: string;
        company_name?: string;
    };
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const GoogleOAuthButton = ({
    onSuccess,
    onError,
}: GoogleOAuthButtonProps) => {
    if (!GOOGLE_CLIENT_ID) {
        return (
            <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="body2" color="error">
                    Google OAuth is not configured
                </Typography>
            </Box>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <Box sx={{ display: "flex", justifyContent: "center", my: 1 }}>
                <GoogleLogin
                    onSuccess={onSuccess}
                    onError={onError}
                    useOneTap={false}
                    text='continue_with'
                    width="100%"
                />
            </Box>
        </GoogleOAuthProvider>
    );
};

export default GoogleOAuthButton;
