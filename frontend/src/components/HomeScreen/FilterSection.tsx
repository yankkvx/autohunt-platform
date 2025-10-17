import { Box, Container, Grid, Button, Collapse } from "@mui/material";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCatalog } from "../../store/slices/catalogSlice";
import { useSelectStyles } from "../../styles/useSelectStyles";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import { useNavigate } from "react-router-dom";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => {
    const year = 1950 + i;
    return { value: year, label: year.toString() };
});

const mileages = Array.from({ length: 20 }, (_, i) => {
    const mileage = (i + 1) * 150;
    return { value: mileage, label: mileage.toString() };
});

const prices = Array.from({ length: 33 }, (_, i) => {
    const price = (i + 1) * 1000;
    return { value: price, label: price.toString() + " $" };
});

const powers = Array.from({ length: 20 }, (_, i) => {
    const power = (i + 1) * 10;
    return { value: power, label: power.toString() + " HP" };
});

const capacities = Array.from({ length: 20 }, (_, i) => {
    const capacity = (i + 1) * 10;
    return { value: capacity, label: capacity.toString() + " L" };
});

const batteryPowers = Array.from({ length: 20 }, (_, i) => {
    const batteryPower = (i + 1) * 10;
    return { value: batteryPower, label: batteryPower.toString() + " kW" };
});
const batteryCapacities = Array.from({ length: 20 }, (_, i) => {
    const batteryCapacity = (i + 1) * 10;
    return {
        value: batteryCapacity,
        label: batteryCapacity.toString() + " kWh",
    };
});

const FilterSection = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        loading,
    } = useAppSelector((state) => state.catalog);

    useEffect(() => {
        dispatch(fetchCatalog());
    }, [dispatch]);

    const selectStyles = useSelectStyles();

    const [showMore, setShowMore] = useState(false);

    const [filters, setFilters] = useState<any>({
        brand: null,
        model: null,
        yearFrom: null,
        yearTo: null,
        mileageFrom: null,
        mileageTo: null,
        fuelType: null,
        transmission: [],
        driveType: [],
        bodyType: [],
        priceFrom: null,
        priceTo: null,
        powerFrom: null,
        powerTo: null,
        capacityFrom: null,
        capacityTo: null,
        batteryPowerFrom: null,
        batteryPowerTo: null,
        batteryCapacityFrom: null,
        batteryCapacityTo: null,
    });

    const selectedFuel = fuelTypes.find(
        (ft) => ft.id === filters.fuelType?.value
    );
    const isElectricOrHybrid = selectedFuel
        ? selectedFuel.name === "Electric" || selectedFuel.name === "Hybrid"
        : false;
    const handleChange = (field: string, value: any) => {
        setFilters((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleMultiChange = (field: string, values: any) => {
        setFilters((prev: any) => ({
            ...prev,
            [field]: values ? values.map((v: any) => v.value) : [],
        }));
    };

    const brandOptions = brands.map((b: any) => ({
        value: b.id,
        label: b.name,
    }));

    const modelOptions = models
        .filter((m: any) =>
            m.brand ? m.brand.id === filters.brand?.value : true
        )
        .map((m: any) => ({ value: m.id, label: m.name }));

    const bodyTypeOptions = bodyTypes.map((bt: any) => ({
        value: bt.id,
        label: bt.name,
    }));

    const fuelTypeOptions = fuelTypes.map((ft: any) => ({
        value: ft.id,
        label: ft.name,
    }));

    const transmissionOptions = transmissions.map((t: any) => ({
        value: t.id,
        label: t.name,
    }));

    const driveTypeOptions = driveTypes.map((dt: any) => ({
        value: dt.id,
        label: dt.name,
    }));

    const handleSearch = () => {
        navigate("/ads", { state: { filters } });
    };

    if (loading) return <p>Loading...</p>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box
                sx={{
                    bgcolor: "background.paper",
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 2,
                }}
            >
                {/* Select Options */}
                <Grid container spacing={2} justifyContent="center">
                    {/* Brand */}
                    <Grid component="div">
                        <Select
                            options={brandOptions}
                            value={filters.brand}
                            onChange={(value) => handleChange("brand", value)}
                            placeholder="Brand"
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Model */}
                    <Grid component="div">
                        <Select
                            options={modelOptions}
                            value={filters.model}
                            onChange={(value) => handleChange("model", value)}
                            placeholder="Model"
                            isDisabled={!filters.brand}
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Year from */}
                    <Grid component="div">
                        <CreatableSelect
                            options={years}
                            value={filters.yearFrom}
                            onChange={(value) =>
                                handleChange("yearFrom", value)
                            }
                            placeholder="Year from"
                            isClearable
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Year to */}
                    <Grid component="div">
                        <CreatableSelect
                            options={years}
                            value={filters.yearTo}
                            onChange={(value) => handleChange("yearTo", value)}
                            placeholder="Year to"
                            isClearable
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Mileage from */}
                    <Grid component="div">
                        <CreatableSelect
                            options={mileages}
                            value={filters.mileageFrom}
                            onChange={(value) =>
                                handleChange("mileageFrom", value)
                            }
                            placeholder="Mileage from"
                            isClearable
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Mileage to */}
                    <Grid component="div">
                        <CreatableSelect
                            options={mileages}
                            value={filters.mileageTo}
                            onChange={(value) =>
                                handleChange("mileageTo", value)
                            }
                            placeholder="Mileage to"
                            isClearable
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Transmission */}
                    <Grid component="div">
                        <Select
                            options={transmissionOptions}
                            value={filters.transmission?.map((t: string) =>
                                transmissionOptions.find(
                                    (opt: any) => opt.value === t
                                )
                            )}
                            onChange={(value) =>
                                handleMultiChange("transmission", value)
                            }
                            isMulti
                            placeholder="Transmission"
                            styles={selectStyles}
                        />
                    </Grid>

                    {/* Fuel type */}
                    <Grid component="div">
                        <Select
                            options={fuelTypeOptions}
                            value={filters.fuelType}
                            onChange={(value) =>
                                handleChange("fuelType", value)
                            }
                            placeholder="Fuel type"
                            styles={selectStyles}
                        />
                    </Grid>
                    <Collapse in={showMore}>
                        <Grid container spacing={2} justifyContent="center">
                            {isElectricOrHybrid ? (
                                <>
                                    {/* Battery power  from*/}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={batteryPowers}
                                            value={filters.batteryPowerFrom}
                                            onChange={(value) =>
                                                handleChange(
                                                    "batteryPowerFrom",
                                                    value
                                                )
                                            }
                                            placeholder="Power from"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Battery power to */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={batteryPowers}
                                            value={filters.batteryPowerTo}
                                            onChange={(value) =>
                                                handleChange(
                                                    "batteryPowerTo",
                                                    value
                                                )
                                            }
                                            placeholder="Power to"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Battery capacity from */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={batteryCapacities}
                                            value={filters.batteryCapacityFrom}
                                            onChange={(value) =>
                                                handleChange(
                                                    "batteryCapacityFrom",
                                                    value
                                                )
                                            }
                                            placeholder="Capacity from"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Battery capacity to */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={batteryCapacities}
                                            value={filters.batteryCapacityTo}
                                            onChange={(value) =>
                                                handleChange(
                                                    "batteryCapacityTo",
                                                    value
                                                )
                                            }
                                            placeholder="Capacity to"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>
                                </>
                            ) : (
                                <>
                                    {/* Power from */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={powers}
                                            value={filters.powerFrom}
                                            onChange={(value) =>
                                                handleChange("powerFrom", value)
                                            }
                                            placeholder="Power from"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Power to */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={powers}
                                            value={filters.powerTo}
                                            onChange={(value) =>
                                                handleChange("powerTo", value)
                                            }
                                            placeholder="Power to"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Capacity from */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={capacities}
                                            value={filters.capacityFrom}
                                            onChange={(value) =>
                                                handleChange(
                                                    "capacityFrom",
                                                    value
                                                )
                                            }
                                            placeholder="Capacity from"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>

                                    {/* Capacity to */}
                                    <Grid component="div">
                                        <CreatableSelect
                                            options={capacities}
                                            value={filters.capacityTo}
                                            onChange={(value) =>
                                                handleChange(
                                                    "capacityTo",
                                                    value
                                                )
                                            }
                                            placeholder="Capacity to"
                                            isClearable
                                            isDisabled={!filters.fuelType}
                                            styles={selectStyles}
                                        />
                                    </Grid>
                                </>
                            )}

                            {/* Price from */}
                            <Grid component="div">
                                <CreatableSelect
                                    options={prices}
                                    value={filters.priceFrom}
                                    onChange={(value) =>
                                        handleChange("priceFrom", value)
                                    }
                                    placeholder="Price from"
                                    isClearable
                                    styles={selectStyles}
                                />
                            </Grid>

                            {/* Price to */}
                            <Grid component="div">
                                <CreatableSelect
                                    options={prices}
                                    value={filters.priceTo}
                                    onChange={(value) =>
                                        handleChange("priceTo", value)
                                    }
                                    placeholder="Price to"
                                    isClearable
                                    styles={selectStyles}
                                />
                            </Grid>

                            {/* Body type */}
                            <Grid component="div">
                                <Select
                                    options={bodyTypeOptions}
                                    value={filters.bodyType?.map((b: string) =>
                                        bodyTypeOptions.find(
                                            (opt: any) => opt.value === b
                                        )
                                    )}
                                    onChange={(value) =>
                                        handleMultiChange("bodyType", value)
                                    }
                                    isMulti
                                    closeMenuOnSelect={false}
                                    placeholder="Body"
                                    styles={selectStyles}
                                />
                            </Grid>

                            {/* Drive type */}
                            <Grid component="div">
                                <Select
                                    options={driveTypeOptions}
                                    value={filters.driveType?.map((d: string) =>
                                        driveTypeOptions.find(
                                            (opt: any) => opt.value === d
                                        )
                                    )}
                                    onChange={(value) =>
                                        handleMultiChange("driveType", value)
                                    }
                                    placeholder="Drive type"
                                    styles={selectStyles}
                                />
                            </Grid>
                        </Grid>
                    </Collapse>
                </Grid>
                {/* Search button */}
                <Box
                    mr={3}
                    ml={3}
                    mt={2}
                    display="flex"
                    justifyContent="space-between"
                    gap={2}
                >
                    <Button
                        size="large"
                        onClick={() => setShowMore((p) => !p)}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            boxShadow: "none",
                        }}
                    >
                        <TuneIcon sx={{ mr: 0.5 }} />{" "}
                        {showMore ? "Hide Filters" : "More Filters"}
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        color="info"
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            boxShadow: "none",
                        }}
                        onClick={handleSearch}
                    >
                        <SearchIcon />
                        Search
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default FilterSection;
