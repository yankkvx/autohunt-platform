import {
    Box,
    Container,
    Button,
    Collapse,
    Checkbox,
    FormControlLabel,
    FormGroup,
    Paper,
    CircularProgress,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
    fetchCatalog,
    fetchExtendedFilters,
} from "../../store/slices/catalogSlice";
import { useListingSelectStyle } from "../../styles/useSelectStyles";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import TuneIcon from "@mui/icons-material/Tune";

interface ListingFiltersProps {
    filters: any;
    onChange: (filters: any) => void;
}

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

const numberOfSeats = Array.from({ length: 10 }, (_, i) => {
    const numberOfSeat = i + 1;
    return {
        value: numberOfSeat,
        label: numberOfSeat.toString(),
    };
});

const numberOfDoors = Array.from({ length: 6 }, (_, i) => {
    const numberOfDoor = i + 1;
    return {
        value: numberOfDoor,
        label: numberOfDoor.toString(),
    };
});

const ListingFilters = ({ filters, onChange }: ListingFiltersProps) => {
    const dispatch = useAppDispatch();
    const {
        brands,
        models,
        bodyTypes,
        fuelTypes,
        driveTypes,
        transmissions,
        colors,
        interiorMaterials,
        conditions,
        loading,
    } = useAppSelector((state) => state.catalog);

    useEffect(() => {
        if (brands.length === 0) {
            dispatch(fetchCatalog());
        }
        if (colors.length === 0 || interiorMaterials.length === 0) {
            dispatch(fetchExtendedFilters());
        }
    }, []);

    const selectStyles = useListingSelectStyle();
    const [showMore, setShowMore] = useState(false);

    const selectedFuel = fuelTypes.find(
        (ft) => ft.id === filters.fuelType?.value
    );
    const isElectricOrHybrid = selectedFuel
        ? selectedFuel.name === "Electric" || selectedFuel.name === "Hybrid"
        : false;

    const handleChange = (field: string, value: any) => {
        onChange({ ...filters, [field]: value });
    };

    const handleMultiChange = (field: string, values: any) => {
        onChange({
            ...filters,
            [field]: values ? values.map((v: any) => v.value) : [],
        });
    };

    const brandOptions = useMemo(
        () => brands.map((b: any) => ({ value: b.id, label: b.name })),
        [brands]
    );
    const modelOptions = useMemo(
        () =>
            models
                .filter((m: any) =>
                    m.brand ? m.brand.id === filters.brand?.value : true
                )
                .map((m: any) => ({ value: m.id, label: m.name })),
        [models, filters.brand]
    );
    const bodyTypeOptions = useMemo(
        () => bodyTypes.map((bt: any) => ({ value: bt.id, label: bt.name })),
        [bodyTypes]
    );
    const fuelTypeOptions = useMemo(
        () => fuelTypes.map((ft: any) => ({ value: ft.id, label: ft.name })),
        [fuelTypes]
    );
    const transmissionOptions = useMemo(
        () => transmissions.map((t: any) => ({ value: t.id, label: t.name })),
        [transmissions]
    );
    const driveTypeOptions = useMemo(
        () => driveTypes.map((dt: any) => ({ value: dt.id, label: dt.name })),
        [driveTypes]
    );

    const exteriorColorsOptions = useMemo(
        () => colors.map((ec: any) => ({ value: ec.id, label: ec.name })),
        [colors]
    );

    const interiorColorsOptions = useMemo(
        () => colors.map((ic: any) => ({ value: ic.id, label: ic.name })),
        [colors]
    );

    const interiorMaterialsOptions = useMemo(
        () =>
            interiorMaterials.map((im: any) => ({
                value: im.id,
                label: im.name,
            })),
        [interiorMaterials]
    );

    const conditionOptions = useMemo(
        () => conditions.map((c: any) => ({ value: c.value, label: c.label })),
        [conditions]
    );

    if (loading)
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "30vh",
                }}
            >
                <CircularProgress />
            </Box>
        );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper
                sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: 2,
                }}
            >
                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Brand */}
                    <Select
                        key={`brand-${filters.brand?.value || "empty"}`}
                        options={brandOptions}
                        value={filters.brand}
                        onChange={(value) => handleChange("brand", value)}
                        placeholder="Brand"
                        styles={selectStyles}
                    />

                    {/* Model */}
                    <Select
                        key={`model-${filters.model?.value || "empty"}`}
                        options={modelOptions}
                        value={filters.model}
                        onChange={(value) => handleChange("model", value)}
                        placeholder="Model"
                        isDisabled={!filters.brand}
                        styles={selectStyles}
                    />

                    {/* Year from */}
                    <CreatableSelect
                        key={`yearFrom-${filters.yearFrom?.value || "empty"}`}
                        options={years}
                        value={filters.yearFrom}
                        onChange={(value) => handleChange("yearFrom", value)}
                        placeholder="Year from"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Year to */}
                    <CreatableSelect
                        key={`yearTo-${filters.yearTo?.value || "empty"}`}
                        options={years}
                        value={filters.yearTo}
                        onChange={(value) => handleChange("yearTo", value)}
                        placeholder="Year to"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Mileage from */}
                    <CreatableSelect
                        key={`mileageFrom-${
                            filters.mileageFrom?.value || "empty"
                        }`}
                        options={mileages}
                        value={filters.mileageFrom}
                        onChange={(value) => handleChange("mileageFrom", value)}
                        placeholder="Mileage from"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Mileage to */}
                    <CreatableSelect
                        key={`mileageTo-${filters.mileageTo?.value || "empty"}`}
                        options={mileages}
                        value={filters.mileageTo}
                        onChange={(value) => handleChange("mileageTo", value)}
                        placeholder="Mileage to"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Transmission */}
                    <Select
                        key={`transmission-${
                            filters.transmission?.value || "empty"
                        }`}
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

                    {/* Fuel type */}
                    <Select
                        key={`fuelType-${filters.fuelType?.value || "empty"}`}
                        options={fuelTypeOptions}
                        value={filters.fuelType}
                        onChange={(value) => handleChange("fuelType", value)}
                        placeholder="Fuel type"
                        styles={selectStyles}
                    />

                    {/* Дополнительные */}
                    <Collapse in={showMore}>
                        <Box display="flex" flexDirection="column" gap={2}>
                            {isElectricOrHybrid ? (
                                <>
                                    {/* Battery power */}
                                    <CreatableSelect
                                        key={`batteryPowerFrom-${
                                            filters.batteryPowerFrom?.value ||
                                            "empty"
                                        }`}
                                        options={batteryPowers}
                                        value={filters.batteryPowerFrom}
                                        onChange={(value) =>
                                            handleChange(
                                                "batteryPowerFrom",
                                                value
                                            )
                                        }
                                        placeholder="Battery power from"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    <CreatableSelect
                                        key={`batteryPowerTo-${
                                            filters.batteryPowerTo?.value ||
                                            "empty"
                                        }`}
                                        options={batteryPowers}
                                        value={filters.batteryPowerTo}
                                        onChange={(value) =>
                                            handleChange(
                                                "batteryPowerTo",
                                                value
                                            )
                                        }
                                        placeholder="Battery power to"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    {/* Battery capacity */}
                                    <CreatableSelect
                                        key={`batteryCapacityFrom-${
                                            filters.batteryCapacityFrom
                                                ?.value || "empty"
                                        }`}
                                        options={batteryCapacities}
                                        value={filters.batteryCapacityFrom}
                                        onChange={(value) =>
                                            handleChange(
                                                "batteryCapacityFrom",
                                                value
                                            )
                                        }
                                        placeholder="Battery capacity from"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    <CreatableSelect
                                        key={`batteryCapacityTo-${
                                            filters.batteryCapacityTo?.value ||
                                            "empty"
                                        }`}
                                        options={batteryCapacities}
                                        value={filters.batteryCapacityTo}
                                        onChange={(value) =>
                                            handleChange(
                                                "batteryCapacityTo",
                                                value
                                            )
                                        }
                                        placeholder="Battery capacity to"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </>
                            ) : (
                                <>
                                    {/* Power */}
                                    <CreatableSelect
                                        key={`powerFrom-${
                                            filters.powerFrom?.value || "empty"
                                        }`}
                                        options={powers}
                                        value={filters.powerFrom}
                                        onChange={(value) =>
                                            handleChange("powerFrom", value)
                                        }
                                        placeholder="Power from"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    <CreatableSelect
                                        key={`powerTo-${
                                            filters.powerTo?.value || "empty"
                                        }`}
                                        options={powers}
                                        value={filters.powerTo}
                                        onChange={(value) =>
                                            handleChange("powerTo", value)
                                        }
                                        placeholder="Power to"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    {/* Capacity */}
                                    <CreatableSelect
                                        key={`capacityFrom-${
                                            filters.capacityFrom?.value ||
                                            "empty"
                                        }`}
                                        options={capacities}
                                        value={filters.capacityFrom}
                                        onChange={(value) =>
                                            handleChange("capacityFrom", value)
                                        }
                                        placeholder="Capacity from"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                    <CreatableSelect
                                        key={`capacityTo-${
                                            filters.capacityTo?.value || "empty"
                                        }`}
                                        options={capacities}
                                        value={filters.capacityTo}
                                        onChange={(value) =>
                                            handleChange("capacityTo", value)
                                        }
                                        placeholder="Capacity to"
                                        isClearable
                                        styles={selectStyles}
                                    />
                                </>
                            )}

                            {/* Price */}
                            <CreatableSelect
                                key={`priceFrom-${
                                    filters.priceFrom?.value || "empty"
                                }`}
                                options={prices}
                                value={filters.priceFrom}
                                onChange={(value) =>
                                    handleChange("priceFrom", value)
                                }
                                placeholder="Price from"
                                isClearable
                                styles={selectStyles}
                            />
                            <CreatableSelect
                                key={`priceTo-${
                                    filters.priceTo?.value || "empty"
                                }`}
                                options={prices}
                                value={filters.priceTo}
                                onChange={(value) =>
                                    handleChange("priceTo", value)
                                }
                                placeholder="Price to"
                                isClearable
                                styles={selectStyles}
                            />

                            {/* Body type */}
                            <Select
                                key={`bodyType-${
                                    filters.bodyType?.value || "empty"
                                }`}
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
                                placeholder="Body type"
                                styles={selectStyles}
                            />

                            {/* Drive type */}
                            <Select
                                key={`driveType-${
                                    filters.driveType?.value || "empty"
                                }`}
                                options={driveTypeOptions}
                                value={filters.driveType?.map((d: string) =>
                                    driveTypeOptions.find(
                                        (opt: any) => opt.value === d
                                    )
                                )}
                                onChange={(value) =>
                                    handleMultiChange("driveType", value)
                                }
                                isMulti
                                placeholder="Drive type"
                                styles={selectStyles}
                            />

                            {/* Exterior color */}
                            <Select
                                key={`exteriorColor-${
                                    filters.exteriorColor?.value || "empty"
                                }`}
                                options={exteriorColorsOptions}
                                value={filters.exteriorColor?.map((e: string) =>
                                    exteriorColorsOptions.find(
                                        (opt: any) => opt.value === e
                                    )
                                )}
                                onChange={(value) =>
                                    handleMultiChange("exteriorColor", value)
                                }
                                isMulti
                                placeholder="Exterior color"
                                styles={selectStyles}
                            />

                            {/* Interior color */}
                            <Select
                                key={`interiorColor-${
                                    filters.interiorColor?.value || "empty"
                                }`}
                                options={interiorColorsOptions}
                                value={filters.interiorColor?.map((i: string) =>
                                    interiorColorsOptions.find(
                                        (opt: any) => opt.value === i
                                    )
                                )}
                                onChange={(value) =>
                                    handleMultiChange("interiorColor", value)
                                }
                                isMulti
                                placeholder="Interior color"
                                styles={selectStyles}
                            />

                            {/* Interior materials */}
                            <Select
                                key={`interiorMaterial-${
                                    filters.interiorMaterial?.value || "empty"
                                }`}
                                options={interiorMaterialsOptions}
                                value={filters.interiorMaterial?.map(
                                    (im: string) =>
                                        interiorMaterialsOptions.find(
                                            (opt: any) => opt.value === im
                                        )
                                )}
                                onChange={(value) =>
                                    handleMultiChange("interiorMaterial", value)
                                }
                                isMulti
                                placeholder="Interior material"
                                styles={selectStyles}
                            />

                            {/* Number of doors */}
                            <CreatableSelect
                                key={`numberOfDoors-${
                                    filters.numberOfDoors?.value || "empty"
                                }`}
                                options={numberOfDoors}
                                value={filters.numberOfDoors}
                                onChange={(value) =>
                                    handleChange("numberOfDoors", value)
                                }
                                placeholder="Doors"
                                isClearable
                                styles={selectStyles}
                            />

                            {/* Number of seats */}
                            <CreatableSelect
                                key={`numberOfSeats-${
                                    filters.numberOfSeats?.value || "empty"
                                }`}
                                options={numberOfSeats}
                                value={filters.numberOfSeats}
                                onChange={(value) =>
                                    handleChange("numberOfSeats", value)
                                }
                                placeholder="Seats"
                                isClearable
                                styles={selectStyles}
                            />

                            <Select
                                key={`conditions-${
                                    filters.conditions?.value || "empty"
                                }`}
                                options={conditionOptions}
                                value={filters.conditions?.map((c: string) =>
                                    conditionOptions.find(
                                        (opt: any) => opt.value === c
                                    )
                                )}
                                onChange={(value) =>
                                    handleMultiChange("conditions", value)
                                }
                                isMulti
                                placeholder="Conditions"
                                styles={selectStyles}
                            />

                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.warranty || false}
                                            onChange={(e) =>
                                                handleChange(
                                                    "warranty",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="Warranty"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filters.airbag || false}
                                            onChange={(e) =>
                                                handleChange(
                                                    "airbag",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="Airbag"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                filters.air_conditioning ||
                                                false
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "air_conditioning",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="Air Conditioning"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                filters.is_first_owner || false
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "is_first_owner",
                                                    e.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label="First Owner"
                                />
                            </FormGroup>
                        </Box>
                    </Collapse>
                </Box>

                <Box
                    mt={3}
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
                        <TuneIcon sx={{ mr: 0.5 }} />
                        {showMore ? "Hide Filters" : "More Filters"}
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ListingFilters;
