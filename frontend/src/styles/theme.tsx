import { createTheme, responsiveFontSizes } from "@mui/material";

declare module "@mui/material/styles" {
    interface Theme {
        header: {
            height: number;
        };
    }
    interface ThemeOptions {
        header?: {
            height?: number;
        };
    }
}

export const createMuiTheme = (mode: "light" | "dark") => {
    let theme = createTheme({
        typography: {
            fontFamily: "Source code pro, monospace",
            body1: {
                fontWeight: 600,
                letterSpacing: "-0.5px",
            },
            body2: {
                fontWeight: 600,
                fontSize: "16px",
                letterSpacing: "-0.5px",
            },
        },
        header: {
            height: 75,
        },
        palette: {
            mode,
            primary: {
                main: mode === "light" ? "#17212e" : "#8fa2b3",
            },
            info: {
                main: "#3881ff",
            },
            secondary: {
                main: "#e4eeff",
            },

            text: {
                primary: mode === "light" ? "#17212e" : "#ffffff",
                secondary: mode === "light" ? "#4f4a4aff" : "#aaaaaa",
            },
        },

        components: {
            MuiAppBar: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.primary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }),
                },
            },
        },
    });
    theme = responsiveFontSizes(theme);
    return theme;
};

export default createMuiTheme;
