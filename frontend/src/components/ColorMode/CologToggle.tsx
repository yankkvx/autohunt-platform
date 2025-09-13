import { CssBaseline, useMediaQuery } from "@mui/material";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import createMuiTheme from "../../styles/theme";
import { ThemeProvider } from "@emotion/react";
import { ColorModeContext } from "../../context/DarkModeContext";

interface ColorProps {
    children: ReactNode;
}

const ColorToggle: React.FC<ColorProps> = ({ children }) => {
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
    const storedMode = localStorage.getItem("colorMode") as "light" | "dark";
    const initialMode: "light" | "dark" =
        storedMode || prefersDarkMode ? "dark" : "light";
    const [mode, setMode] = useState<"light" | "dark">(initialMode);

    const toggleColorMode = React.useCallback(() => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    }, []);

    useEffect(() => {
        localStorage.setItem("colorMode", mode);
    });

    const colorMode = useMemo(() => ({ toggleColorMode }), [toggleColorMode]);
    const theme = useMemo(() => createMuiTheme(mode), [mode]);

    return (
        <ColorModeContext.Provider value={colorMode}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export default ColorToggle;
