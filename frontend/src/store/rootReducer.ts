import { combineReducers } from "@reduxjs/toolkit";
import catalogReducer from "./slices/catalogSlice";
import latestCarReducer from "./slices/latestCarSlice";

export const rootReducer = combineReducers({
    catalog: catalogReducer,
    latestCars: latestCarReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
