import {
    Box,
    TextField,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    InputAdornment,
    IconButton,
    CircularProgress,
} from "@mui/material";
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CloseIcon from "@mui/icons-material/Close";
import { MAIN_URL } from "../../api-config";

interface LocationSuggestion {
    type: "location";
    display_name: string;
    city?: string;
    state?: string;
    country?: string;
}

interface CarSuggestion {
    type: "car";
    id: number;
    title: string;
    brand: string;
    model: string;
    year: number;
    price: number;
}

type Suggestion = LocationSuggestion | CarSuggestion;

interface SearchInputProps {
    onMobileClose?: () => void;
}

const SearchInput = ({ onMobileClose }: SearchInputProps) => {
    const [searchValue, setSearchValue] = useState("");
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [error, setError] = useState<string | null>(null);
    const debounceTImer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close on click outside the search area
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setSelectedIndex(-1);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTImer.current) {
                clearTimeout(debounceTImer.current);
            }
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    // Fetch suggestions (locations + cars)
    const fetchSuggestions = useCallback(async (query: string) => {
        // If input shorts - clear suggestions
        if (!query || query.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        // Cancel previous request if it's still in progress
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();
        setIsLoading(true);
        setError(null);

        try {
            // Requests for locaitons and ads in parallel

            const [locationsResponse, adsResponse] = await Promise.allSettled([
                fetch(
                    `${MAIN_URL}/locations/search/?q=${encodeURIComponent(
                        query
                    )}`,
                    { signal: abortControllerRef.current.signal }
                ).then((res) => (res.ok ? res.json() : { results: [] })),

                fetch(`${MAIN_URL}/ads/?search=${encodeURIComponent(query)}`, {
                    signal: abortControllerRef.current.signal,
                }).then((res) => (res.ok ? res.json() : { results: [] })),
            ]);

            // Extract location results
            const locationData =
                locationsResponse.status === "fulfilled"
                    ? locationsResponse.value
                    : { results: [] };
            // Transform location results into typed objects
            const locationSuggestion: LocationSuggestion[] = (
                locationData.results || []
            )
                .slice(0, 3)
                .map((item: any) => ({
                    type: "location" as const,
                    display_name: item.display_name,
                    city:
                        item.address?.city ||
                        item.address?.town ||
                        item.address?.village,
                    state: item.address?.state,
                    country: item.address?.country,
                }));

            // Extract ads results
            const adsData =
                adsResponse.status === "fulfilled"
                    ? adsResponse.value
                    : { results: [] };
            // Trabsfrom ads results into typed objects
            const adsSuggestion: CarSuggestion[] = (adsData.results || [])
                .slice(0, 5)
                .map((item: any) => ({
                    type: "car" as const,
                    id: item.id,
                    title: item.title,
                    brand: item.brand,
                    model: item.model,
                    year: item.year,
                    price: item.price,
                }));

            // Merge both lists
            setSuggestions([...locationSuggestion, ...adsSuggestion]);
        } catch (error: any) {
            // Ignore abort error
            if (error.name !== "AbortError") {
                setError("Failed to load suggestions.");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Update search input and debounce api calls
    const handleInputChange = (value: string) => {
        setSearchValue(value);
        setIsOpen(true);
        setSelectedIndex(-1);
        setError(null);

        // Cancel previous debounce timeoits
        if (debounceTImer.current) {
            clearTimeout(debounceTImer.current);
        }

        if (value.length < 3) {
            setSuggestions([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        debounceTImer.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    // Main search - redirects to ads page
    const handleSearch = useCallback(
        (searchTerm?: string) => {
            const term = searchTerm || searchValue;
            if (!term.trim()) return;

            // Navigate to ads screen with search filter
            navigate("/ads", {
                state: {
                    filters: { search: term },
                    timestamp: Date.now(), // ensures reload
                },
            });

            setIsOpen(false);
            setSearchValue("");
            setSelectedIndex(-1);
            setSuggestions([]);
            onMobileClose?.();
        },
        [searchValue, navigate, onMobileClose]
    );

    // Handles ckicking on suggestions
    const handleSuggestionClick = useCallback(
        (suggestion: Suggestion) => {
            if (suggestion.type === "location") {
                // Construct a readable search query from multiple fieilds
                const locationQuery = [
                    suggestion.city,
                    suggestion.state,
                    suggestion.country,
                ]
                    .filter(Boolean)
                    .join(", ");
                handleSearch(locationQuery);
            } else {
                // Navigate to a specific ad
                navigate(`/ads/${suggestion.id}`);
                setIsOpen(false);
                setSearchValue("");
                setSelectedIndex(-1);
                setSuggestions([]);
                onMobileClose?.();
            }
        },
        [handleSearch, navigate, onMobileClose]
    );

    const handleClear = () => {
        setSearchValue("");
        setSuggestions([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        setIsLoading(false);
        setError(null);

        if (debounceTImer.current) {
            clearTimeout(debounceTImer.current);
        }
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen || suggestions.length === 0) {
            if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
            }
            return;
        }

        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;

            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
                break;

            case "Enter":
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
                break;

            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                setSelectedIndex(-1);
                break;
        }
    };

    return (
        <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Search by brand, model, location..."
                value={searchValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (searchValue.length >= 3) {
                        setIsOpen(true);
                    }
                }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            {isLoading && <CircularProgress size={20} />}
                            {searchValue && !isLoading && (
                                <IconButton
                                    size="small"
                                    onClick={handleClear}
                                    edge="end"
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            )}
                        </InputAdornment>
                    ),
                }}
            />
            {/* Dropdown with suggestions */}
            {isOpen && (suggestions.length > 0 || error) && (
                <Paper
                    elevation={0}
                    sx={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        mr: 1,
                        maxHeight: 400,
                        overflow: "auto",
                        zIndex: 1300,
                    }}
                >
                    {error ? (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="body2" color="error">
                                {error}
                            </Typography>
                        </Box>
                    ) : (
                        <List disablePadding>
                            {suggestions.map((suggestion, index) => (
                                <ListItem key={index} disablePadding>
                                    <ListItemButton
                                        selected={index === selectedIndex}
                                        onClick={() =>
                                            handleSuggestionClick(suggestion)
                                        }
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                                width: "100%",
                                            }}
                                        >
                                            {suggestion.type === "location" ? (
                                                <LocationOnIcon
                                                    sx={{
                                                        color: "primary.main",
                                                        fontSize: 20,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            ) : (
                                                <DirectionsCarIcon
                                                    sx={{
                                                        color: "primary.main",
                                                        fontSize: 20,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                            )}
                                            <ListItemText
                                                primary={
                                                    suggestion.type ===
                                                    "location"
                                                        ? suggestion.display_name
                                                        : `${suggestion.brand} ${suggestion.model} ${suggestion.year}`
                                                }
                                                secondary={
                                                    suggestion.type === "car" &&
                                                    `$${suggestion.price}`
                                                }
                                                slotProps={{
                                                    primary: {
                                                        fontSize: "0.9rem",
                                                        noWrap: true,
                                                    },
                                                    secondary: {
                                                        fontSize: "0.8rem",
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}
            {isOpen &&
                searchValue.length >= 3 &&
                suggestions.length === 0 &&
                !isLoading &&
                !error && (
                    <Paper
                        elevation={8}
                        sx={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            mt: 0.5,
                            p: 2,
                            zIndex: 1300,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            No suggestion found
                        </Typography>
                    </Paper>
                )}
        </Box>
    );
};

export default SearchInput;
