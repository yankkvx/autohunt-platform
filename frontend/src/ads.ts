export interface Brand {
    id: number;
    name: string;
}

export interface Model {
    id: number;
    name: string;
    brand: Brand;
}

export interface Feature {
    id: number;
    name: string;
}

export interface Image {
    id: number;
    image: string;
}

export interface Car {
    id: number;
    user: number;
    title: string;
    description: string;
    brand: Brand;
    model: Model;
    body_type: Feature;
    fuel_type: Feature;
    drive_type: Feature;
    transmission: Feature;
    exterior_color: Feature;
    interior_color: Feature;
    interior_material: Feature;
    year: number;
    mileage: number;
    power: number | null;
    capacity: number | null;
    battery_power: number | null;
    battery_capacity: string | null;
    price: string;
    vin: string;
    location: string;
    warranty: boolean;
    airbag: boolean;
    air_conditioning: boolean;
    number_of_seats: number;
    number_of_doors: number;
    condition: string;
    owner_count: number;
    is_first_owner: boolean;
    created_at: string;
    updated_at: string;
    images: Image[];
}

export const cars: Car[] = [
    {
        id: 29,
        user: 1,
        title: "Tesla Model S",
        description: "Fully electric sedan with autopilot features.",
        brand: { id: 1, name: "Tesla" },
        model: { id: 1, name: "Model S", brand: { id: 1, name: "Tesla" } },
        body_type: { id: 1, name: "Sedan" },
        fuel_type: { id: 2, name: "Electric" },
        drive_type: { id: 1, name: "AWD" },
        transmission: { id: 1, name: "Automatic" },
        exterior_color: { id: 1, name: "Black" },
        interior_color: { id: 2, name: "White" },
        interior_material: { id: 1, name: "Leather" },
        year: 2024,
        mileage: 5000,
        power: 670,
        capacity: null,
        battery_power: 14,
        battery_capacity: "100.00",
        price: "90000.00",
        vin: "TES123456789",
        location: "San Francisco, USA",
        warranty: true,
        airbag: true,
        air_conditioning: true,
        number_of_seats: 5,
        number_of_doors: 4,
        condition: "New",
        owner_count: 0,
        is_first_owner: true,
        created_at: "2025-09-10T15:27:56.539126Z",
        updated_at: "2025-09-10T15:27:56.539149Z",
        images: [
            { id: 101, image: "images/tesla.webp" },
            { id: 102, image: "images/SUV.png" },
        ],
    },
    {
        id: 30,
        user: 2,
        title: "BMW X5",
        description: "Luxury SUV with strong performance.",
        brand: { id: 2, name: "BMW" },
        model: { id: 2, name: "X5", brand: { id: 2, name: "BMW" } },
        body_type: { id: 2, name: "SUV" },
        fuel_type: { id: 1, name: "Petrol" },
        drive_type: { id: 1, name: "AWD" },
        transmission: { id: 1, name: "Automatic" },
        exterior_color: { id: 3, name: "Blue" },
        interior_color: { id: 1, name: "Black" },
        interior_material: { id: 1, name: "Leather" },
        year: 2023,
        mileage: 20000,
        power: 350,
        capacity: 3,
        battery_power: null,
        battery_capacity: null,
        price: "75000.00",
        vin: "BMW987654321",
        location: "Berlin, Germany",
        warranty: true,
        airbag: true,
        air_conditioning: true,
        number_of_seats: 5,
        number_of_doors: 5,
        condition: "Used",
        owner_count: 1,
        is_first_owner: false,
        created_at: "2025-09-11T10:10:56.539126Z",
        updated_at: "2025-09-11T10:10:56.539149Z",
        images: [
            { id: 201, image: "images/bmw.webp" },
            { id: 202, image: "images/Sedan.png" },
        ],
    },
    {
        id: 31,
        user: 3,
        title: "Toyota Corolla",
        description: "Reliable and fuel-efficient compact car.",
        brand: { id: 3, name: "Toyota" },
        model: { id: 3, name: "Corolla", brand: { id: 3, name: "Toyota" } },
        body_type: { id: 3, name: "Hatchback" },
        fuel_type: { id: 3, name: "Hybrid" },
        drive_type: { id: 2, name: "FWD" },
        transmission: { id: 1, name: "Automatic" },
        exterior_color: { id: 4, name: "Silver" },
        interior_color: { id: 5, name: "Gray" },
        interior_material: { id: 2, name: "Fabric" },
        year: 2021,
        mileage: 40000,
        power: 180,
        capacity: 1.8,
        battery_power: null,
        battery_capacity: null,
        price: "25000.00",
        vin: "TOY555555555",
        location: "Tokyo, Japan",
        warranty: false,
        airbag: true,
        air_conditioning: true,
        number_of_seats: 5,
        number_of_doors: 5,
        condition: "Used",
        owner_count: 2,
        is_first_owner: false,
        created_at: "2025-09-12T09:00:56.539126Z",
        updated_at: "2025-09-12T09:00:56.539149Z",
        images: [{ id: 301, image: "images/toyota.webp" }],
    },
    {
        id: 32,
        user: 4,
        title: "Mercedes-Benz E-Class",
        description: "Luxury sedan with advanced technology.",
        brand: { id: 4, name: "Mercedes-Benz" },
        model: {
            id: 4,
            name: "E-Class",
            brand: { id: 4, name: "Mercedes-Benz" },
        },
        body_type: { id: 1, name: "Sedan" },
        fuel_type: { id: 1, name: "Petrol" },
        drive_type: { id: 1, name: "AWD" },
        transmission: { id: 1, name: "Automatic" },
        exterior_color: { id: 6, name: "White" },
        interior_color: { id: 1, name: "Black" },
        interior_material: { id: 1, name: "Leather" },
        year: 2022,
        mileage: 15000,
        power: 400,
        capacity: 3,
        battery_power: null,
        battery_capacity: null,
        price: "68000.00",
        vin: "MBENZ999999",
        location: "Paris, France",
        warranty: true,
        airbag: true,
        air_conditioning: true,
        number_of_seats: 5,
        number_of_doors: 4,
        condition: "Used",
        owner_count: 1,
        is_first_owner: false,
        created_at: "2025-09-13T12:45:56.539126Z",
        updated_at: "2025-09-13T12:45:56.539149Z",
        images: [{ id: 401, image: "images/Mercedes.webp" }],
    },
];
