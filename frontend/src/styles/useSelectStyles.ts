import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

export const useSelectStyles = () => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const isMd = useMediaQuery(theme.breakpoints.between("sm", "lg"));

    let selectWidth = "13vw";
    if (isMd) selectWidth = "27vw";
    if (isXs) selectWidth = "36vw";
    return {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isDisabled
                ? theme.palette.mode === "light"
                    ? "#97979723"
                    : theme.palette.action.disabledBackground
                : theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontWeight: 500,
            minHeight: 55,
            height: 55,
            borderColor: state.isFocused
                ? theme.palette.info.main
                : theme.palette.divider,
            boxShadow: state.isFocused
                ? `0 0 0 1px ${theme.palette.info.main}`
                : "none",
            "&:hover": { borderColor: theme.palette.info.main },
            width: selectWidth,
        }),
        valueContainer: (provided: any) => ({
            ...provided,
            flexWrap: "nowrap",
            overflow: "hidden",
        }),
        menu: (provided: any) => ({
            ...provided,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            fontWeight: 500,
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused
                ? theme.palette.mode === "dark"
                    ? "#555555"
                    : "#e0e0e0"
                : theme.palette.background.paper,
            color: theme.palette.text.primary,
            cursor: "pointer",
        }),
        singleValue: (provided: any) => ({
            ...provided,
            color: theme.palette.text.primary,
        }),
        multiValue: (provided: any) => ({
            ...provided,
            backgroundColor:
                theme.palette.mode === "dark"
                    ? "#c5c5d18a"
                    : theme.palette.secondary.main,
        }),
        multiValueLabel: (provided: any) => ({
            ...provided,
            color: theme.palette.text.primary,
        }),
        input: (provided: any) => ({
            ...provided,
            color: theme.palette.text.primary,
        }),
        placeholder: (provided: any) => ({
            ...provided,
            color: theme.palette.text.secondary,
        }),
        dropdownIndicator: (provided: any) => ({
            ...provided,
            color: theme.palette.text.primary,
            "&:hover": { color: theme.palette.primary.main },
        }),
        indicatorSeparator: () => ({
            display: "none",
        }),
    };
};
