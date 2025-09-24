import {
    Box,
    Container,
    Button,
    Collapse,
    Checkbox,
    FormControlLabel,
    FormGroup,
} from "@mui/material";
import { useState, useEffect } from "react";
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
        dispatch(fetchCatalog());
        dispatch(fetchExtendedFilters());
    }, [dispatch]);

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

    const exteriorColorsOptions = colors.map((ec: any) => ({
        value: ec.id,
        label: ec.name,
    }));

    const interiorColorsOptions = colors.map((ic: any) => ({
        value: ic.id,
        label: ic.name,
    }));

    const interiorMaterialsOptions = interiorMaterials.map((im: any) => ({
        value: im.id,
        label: im.name,
    }));

    const conditionOptions = conditions.map((c: any) => ({
        value: c.value,
        label: c.label,
    }));

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
                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Brand */}
                    <Select
                        options={brandOptions}
                        value={filters.brand}
                        onChange={(value) => handleChange("brand", value)}
                        placeholder="Brand"
                        styles={selectStyles}
                    />

                    {/* Model */}
                    <Select
                        options={modelOptions}
                        value={filters.model}
                        onChange={(value) => handleChange("model", value)}
                        placeholder="Model"
                        isDisabled={!filters.brand}
                        styles={selectStyles}
                    />

                    {/* Year from */}
                    <CreatableSelect
                        options={years}
                        value={filters.yearFrom}
                        onChange={(value) => handleChange("yearFrom", value)}
                        placeholder="Year from"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Year to */}
                    <CreatableSelect
                        options={years}
                        value={filters.yearTo}
                        onChange={(value) => handleChange("yearTo", value)}
                        placeholder="Year to"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Mileage from */}
                    <CreatableSelect
                        options={mileages}
                        value={filters.mileageFrom}
                        onChange={(value) => handleChange("mileageFrom", value)}
                        placeholder="Mileage from"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Mileage to */}
                    <CreatableSelect
                        options={mileages}
                        value={filters.mileageTo}
                        onChange={(value) => handleChange("mileageTo", value)}
                        placeholder="Mileage to"
                        isClearable
                        styles={selectStyles}
                    />

                    {/* Transmission */}
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

                    {/* Fuel type */}
                    <Select
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
                                options={interiorMaterialsOptions}
                                value={filters.interiorMaterial?.map(
                                    (im: string) =>
                                        interiorMaterials.find(
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
                                options={numberOfDoors}
                                value={filters.numberOfDoor}
                                onChange={(value) =>
                                    handleChange("numberOfDoors", value)
                                }
                                placeholder="Doors"
                                isClearable
                                styles={selectStyles}
                            />

                            {/* Number of seats */}
                            <CreatableSelect
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
            </Box>
        </Container>
    );
};

export default ListingFilters;
