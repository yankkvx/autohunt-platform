import {
    Avatar,
    Box,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as LinkRouter } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import Logout from "@mui/icons-material/Logout";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

const UserMenu = () => {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const user = useAppSelector((state) => state.auth.user);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        handleClose();
    };
    return (
        <>
            <IconButton onClick={handleClick}>
                <Avatar src={user?.profile_image} />
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                slotProps={{
                    paper: {
                        elevation: 0,
                        sx: {
                            mt: 1.5,
                            overflow: "visible",
                            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                            "& .MuiAvatar-root": {
                                width: 32,
                                height: 32,
                                ml: -0.5,
                                mr: 1,
                            },
                        },
                    },
                }}
            >
                <Box
                    sx={{
                        px: 2,
                        py: 2,
                        display: "flex",
                        gap: 1.5,
                        backgroundColor: theme.palette.action.hover,
                        alignItems: 'center'
                    }}
                >
                    <Avatar
                        src={user?.profile_image}
                        sx={{ width: 58, height: 58 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {user?.account_type === "company" ? (
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.company_name}
                            </Typography>
                        ) : (
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 600,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {user?.first_name} {user?.last_name}
                            </Typography>
                        )}
                        <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", display: "block" }}
                        >
                            {user?.email}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                    component={LinkRouter}
                    to="/profile"
                    sx={{
                        gap: 2,
                        fontWeight: "500",
                        py: 1.5,
                        px: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            pl: 2.5,
                        },
                    }}
                >
                    <PersonIcon /> Profile
                </MenuItem>
                <MenuItem
                    component={LinkRouter}
                    to="/favourites"
                    sx={{
                        gap: 2,
                        fontWeight: "500",
                        py: 1.5,
                        px: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                            backgroundColor: theme.palette.action.hover,
                            pl: 2.5,
                        },
                    }}
                >
                    <BookmarkIcon /> Favourites
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        color: theme.palette.error.main,
                        gap: 2,
                        fontWeight: "500",
                        py: 1.5,
                        px: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                            backgroundColor: "rgba(206, 28, 28, 0.08)",
                            pl: 2.5,
                        },
                    }}
                >
                    <Logout /> Logout
                </MenuItem>
            </Menu>
        </>
    );
};

export default UserMenu;
