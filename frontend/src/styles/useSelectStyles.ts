import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

export const useSelectStyles = () => {
    const theme = useTheme();

    return {
        control: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isDisabled
                ? theme.palette.mode === "light"
                    ? "#97979723"
                    : theme.palette.action.disabledBackground
                : theme.palette.mode === "dark"
                ? "#232323"
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
            width: "100%",
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

export const useListingSelectStyle = () => {
    const theme = useTheme();

    const isXs = useMediaQuery(theme.breakpoints.down("sm"));
    const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

    let maxWidth = "100%";
    if (isMd) maxWidth = "400px";
    if (isSm) maxWidth = "300px";
    if (isXs) maxWidth = "100%";

    return {
        control: (provided: any, state: any) => ({
            ...provided,
            width: "100%",
            maxWidth: maxWidth,
            minHeight: 55,
            height: 55,
            fontWeight: 500,
            backgroundColor: state.isDisabled
                ? theme.palette.mode === "light"
                    ? "#97979723"
                    : theme.palette.action.disabledBackground
                : theme.palette.mode === "dark"
                ? "#232323"
                : theme.palette.background.paper,
            boxShadow: state.isFocused
                ? `0 0 0 1px ${theme.palette.info.main}`
                : "none",
            "&:hover": { borderColor: theme.palette.info.main },
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
