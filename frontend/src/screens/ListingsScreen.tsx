import {
    Box,
    Drawer,
    Grid,
    IconButton,
    Container,
    Button,
    Fade,
    Pagination,
} from "@mui/material";
import {
    Link as LinkRouter,
    useLocation,
    useNavigate,
    useSearchParams,
} from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ListingFilters from "../components/ListingsScreen/ListingFilters";
import AdCard from "../components/ListingsScreen/AdCard";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchAds } from "../store/slices/adsSlice";
import { fetchFavourites } from "../store/slices/favouriteSlice";
import CloseIcon from "@mui/icons-material/Close";
import { useRef } from "react";

type FilterType = "single" | "range" | "multiSelect" | "boolean" | "search";

interface FilterConfig {
    type: FilterType;
    urlParam: string;
    filterKey: string;
    suffix?: string;
    minParam?: string;
    maxParam?: string;
}

// Config discribing all filters and how the map to url params
const FILTER_CONFIGS: FilterConfig[] = [
    // Single filters
    { type: "single", urlParam: "brand", filterKey: "brand" },
    { type: "single", urlParam: "model", filterKey: "model" },
    { type: "single", urlParam: "fuel_type", filterKey: "fuelType" },
    { type: "single", urlParam: "condition", filterKey: "condition" },

    // Multi select filters
    { type: "multiSelect", urlParam: "body_type", filterKey: "bodyType" },
    {
        type: "multiSelect",
        urlParam: "transmission",
        filterKey: "transmission",
    },
    { type: "multiSelect", urlParam: "drive_type", filterKey: "driveType" },
    {
        type: "multiSelect",
        urlParam: "exterior_color",
        filterKey: "exteriorColor",
    },
    {
        type: "multiSelect",
        urlParam: "interior_color",
        filterKey: "interiorColor",
    },
    {
        type: "multiSelect",
        urlParam: "interior_materials",
        filterKey: "interiorMaterial",
    },
    { type: "multiSelect", urlParam: "conditions", filterKey: "conditions" },

    // Range filters
    {
        type: "range",
        urlParam: "year",
        filterKey: "year",
        minParam: "year_min",
        maxParam: "year_max",
    },
    {
        type: "range",
        urlParam: "price",
        filterKey: "price",
        minParam: "price_min",
        maxParam: "price_max",
    },
    {
        type: "range",
        urlParam: "mileage",
        filterKey: "mileage",
        minParam: "mileage_min",
        maxParam: "mileage_max",
    },
    {
        type: "range",
        urlParam: "power",
        filterKey: "power",
        minParam: "power_min",
        maxParam: "power_max",
    },
    {
        type: "range",
        urlParam: "capacity",
        filterKey: "capacity",
        minParam: "capacity_min",
        maxParam: "capacity_max",
    },
    {
        type: "range",
        urlParam: "battery_power",
        filterKey: "batteryPower",
        minParam: "battery_power_min",
        maxParam: "battery_power_max",
    },
    {
        type: "range",
        urlParam: "battery_capacity",
        filterKey: "batteryCapacity",
        minParam: "battery_capacity_min",
        maxParam: "battery_capacity_max",
    },

    // Boolean filters
    { type: "boolean", urlParam: "warranty", filterKey: "warranty" },
    { type: "boolean", urlParam: "airbag", filterKey: "airbag" },
    {
        type: "boolean",
        urlParam: "air_conditioning",
        filterKey: "air_conditioning",
    },
    {
        type: "boolean",
        urlParam: "is_first_owner",
        filterKey: "is_first_owner",
    },

    // SearchInput
    { type: "search", urlParam: "search", filterKey: "search" },
];

// Function to find catalog item id by its name
const findIdByName = (catalog: any[], name: string): number | null => {
    const item = catalog.find(
        (item) => item.name.toLowerCase() === name.toLowerCase()
    );
    return item ? item.id : null;
};

// Function to find catalog item name by its id
const findNameById = (catalog: any[], id: number): string | null => {
    const item = catalog.find((item) => item.id === id);
    return item ? item.name : null;
};

// Parese url params and covert into internal filter format
const parseFiltersFromURL = (
    searchParams: URLSearchParams,
    catalogState: any
) => {
    const filters: any = {};
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
    } = catalogState;

    // Iterate through filter config
    FILTER_CONFIGS.forEach((config) => {
        switch (config.type) {
            case "single": {
                const name = searchParams.get(config.urlParam);
                if (name) {
                    let id: number | null = null;
                    let catalog: any[] = [];

                    switch (config.urlParam) {
                        case "brand":
                            catalog = brands;
                            break;
                        case "model":
                            catalog = models;
                            break;
                        case "fuel_type":
                            catalog = fuelTypes;
                            break;

                        // condition store as string not ID
                        case "condition":
                            filters[config.filterKey] = {
                                value: name.toLowerCase(),
                                label: name,
                            };
                            return;
                    }

                    id = findIdByName(catalog, name);

                    // Save id + label
                    if (id) {
                        filters[config.filterKey] = {
                            value: id,
                            label: name,
                        };
                    }
                }
                break;
            }

            case "range": {
                const minValue = searchParams.get(config.minParam!);
                const maxValue = searchParams.get(config.maxParam!);

                // If min and max exists creating filter object
                if (minValue) {
                    filters[`${config.filterKey}From`] = {
                        value: Number(minValue),
                        label: minValue + (config.suffix || ""),
                    };
                }
                if (maxValue) {
                    filters[`${config.filterKey}To`] = {
                        value: Number(maxValue),
                        label: maxValue + (config.suffix || ""),
                    };
                }
                break;
            }

            case "multiSelect": {
                const names = searchParams.getAll(config.urlParam);
                if (names.length === 0) return;

                if (config.urlParam === "conditions") {
                    filters[config.filterKey] = names;
                    return;
                }

                let catalog: any[] = [];
                switch (config.urlParam) {
                    case "body_type":
                        catalog = bodyTypes;
                        break;
                    case "drive_type":
                        catalog = driveTypes;
                        break;
                    case "transmission":
                        catalog = transmissions;
                        break;
                    case "extrior_color":
                        catalog = colors;
                        break;
                    case "interior_color":
                        catalog = colors;
                        break;
                    case "interior_materials":
                        catalog = interiorMaterials;
                        break;
                }

                // Convers names to ids
                const ids = names
                    .map((name) => findIdByName(catalog, name))
                    .filter((id) => id !== null) as number[];

                if (ids.length > 0) {
                    filters[config.filterKey] = ids;
                }
                break;
            }

            case "boolean": {
                const value = searchParams.get(config.urlParam);
                if (value === "true") {
                    filters[config.filterKey] = true;
                }
                break;
            }

            case "search": {
                const value = searchParams.get(config.urlParam);
                if (value) {
                    filters[config.filterKey] = value;
                }
                break;
            }
        }
    });
    return filters;
};

// Convert filters to URLSearchParams
const filtersToURLParams = (filters: any, catalogState: any) => {
    const params = new URLSearchParams();
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
    } = catalogState;

    FILTER_CONFIGS.forEach((config) => {
        switch (config.type) {
            case "single": {
                const filter = filters[config.filterKey];
                if (filter?.label) {
                    params.set(config.urlParam, filter.label);
                }
                break;
            }
            case "range": {
                const fromFilter = filters[`${config.filterKey}From`];
                const toFilter = filters[`${config.filterKey}To`];

                if (fromFilter?.value !== undefined) {
                    params.set(config.minParam!, fromFilter.value.toString());
                }
                if (toFilter?.value !== undefined) {
                    params.set(config.maxParam!, toFilter.value.toString());
                }
                break;
            }
            case "multiSelect": {
                const ids = filters[config.filterKey];
                if (!ids?.length) return;

                if (config.urlParam === "condition") {
                    ids.forEach((value: string) =>
                        params.append(config.urlParam, value)
                    );
                    return;
                }

                let catalog: any[] = [];
                switch (config.urlParam) {
                    case "body_type":
                        catalog = bodyTypes;
                        break;
                    case "drive_type":
                        catalog = driveTypes;
                        break;
                    case "transmission":
                        catalog = transmissions;
                        break;
                    case "extrior_color":
                        catalog = colors;
                        break;
                    case "interior_color":
                        catalog = colors;
                        break;
                    case "interior_materials":
                        catalog = interiorMaterials;
                        break;
                }

                ids.forEach((id: number) => {
                    const name = findNameById(catalog, id);
                    if (name) {
                        params.append(config.urlParam, name);
                    }
                });
                break;
            }

            case "boolean": {
                if (filters[config.filterKey] === true) {
                    params.set(config.urlParam, "true");
                }
                break;
            }

            case "search": {
                if (filters[config.filterKey]) {
                    params.set(config.urlParam, filters[config.filterKey]);
                }
                break;
            }
        }
    });
    return params;
};

const ListingsScreen = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const catalogState = useAppSelector((state) => state.catalog);
    const { cars, loading, error, count, currentPage } = useAppSelector(
        (state) => state.ads
    );
    const { user } = useAppSelector((state) => state.auth);

    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({});
    const hasFetched = useRef(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const pageSize = 16;
    const totalPages = Math.ceil(count / pageSize);

    // When catalog loads first time initialize filters from url or navigation state
    useEffect(() => {
        if (catalogState.brands.length > 0 && !isInitialized) {
            const initialFilters =
                location.state?.filters ||
                parseFiltersFromURL(searchParams, catalogState);
            setFilters(initialFilters);
            setIsInitialized(true);
        }
    }, [catalogState.brands.length, isInitialized]);

    // If coming from homescreen or another page with filters in state
    useEffect(() => {
        if (location.state?.filters && location.state?.timestamp) {
            setFilters(location.state.filters);
            setPage(1);

            // Clean state to prevent reapply on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state?.timestamp]);

    // Synchronize filters with url
    useEffect(() => {
        if (catalogState.brands.length === 0 || !isInitialized) return;

        const params = filtersToURLParams(filters, catalogState);
        params.set("page", page.toString());

        const newSearch = `?${params.toString()}`;

        if (location.search !== newSearch) {
            navigate(newSearch, { replace: true });
        }
    }, [filters, page, catalogState.brands.length, isInitialized]);

    // Fetch ads when filters or page changes
    useEffect(() => {
        if (catalogState.brands.length === 0 || !isInitialized) return;

        hasFetched.current = false;

        if (!hasFetched.current) {
            hasFetched.current = true;
            dispatch(fetchAds({ page, filters }));
        }
    }, [dispatch, page, filters, catalogState.brands.length, isInitialized]);

    useEffect(() => {
        if (user) {
            dispatch(fetchFavourites(1));
        }
    }, []);

    const handleFiltersChange = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
    };

    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <MainLayout>
            <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
                <Grid container spacing={3}>
                    <Grid
                        size={{ xs: 0, md: 3 }}
                        sx={{
                            display: { xs: "none", md: "block", lg: "block" },
                        }}
                    >
                        <ListingFilters
                            filters={filters}
                            onChange={handleFiltersChange}
                        />
                    </Grid>
                    <Grid
                        size={{ xs: 12, md: 9 }}
                        sx={{ pt: { xs: "none", md: 4, lg: 4 } }}
                    >
                        <Box
                            sx={{
                                mb: 1,
                                display: {
                                    xs: "flex",
                                    md: "none",
                                    lg: "none",
                                    justifyContent: "flex-end",
                                },
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => setDrawerOpen(true)}
                            >
                                Filters
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            {cars.map((ad) => (
                                <Grid
                                    key={ad.id}
                                    size={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                                    component={LinkRouter}
                                    to={`${ad.id}`}
                                    sx={{ textDecoration: "none" }}
                                >
                                    <AdCard ad={ad} />
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
                <Drawer
                    anchor="top"
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    transitionDuration={300}
                    sx={{
                        "& .MuiDrawer-paper": {
                            width: "100vw",
                            height: "100vh",
                            display: "flex",
                            flexDirection: "column",
                            px: { xs: 2, sm: 3, md: 4 },
                            pt: { xs: 12, md: 16 },
                            overflowY: "auto",
                        },
                    }}
                >
                    <IconButton
                        onClick={() => setDrawerOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 80,
                            right: 15,
                            zIndex: 1201,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>

                    <Fade in={drawerOpen} timeout={300}>
                        <Box
                            sx={{
                                display: "flex",
                                mx: "auto",
                                width: { xs: "20rem", sm: "25rem" },
                            }}
                        >
                            <ListingFilters
                                filters={filters}
                                onChange={handleFiltersChange}
                            />
                        </Box>
                    </Fade>
                </Drawer>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                    />
                </Box>
            </Container>
        </MainLayout>
    );
};

export default ListingsScreen;
