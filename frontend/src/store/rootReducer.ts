import { combineReducers } from "@reduxjs/toolkit";
import catalogReducer from "./slices/catalogSlice";
import latestCarReducer from "./slices/latestCarSlice";
import adsReducer from "./slices/adsSlice";
import authReducer from "./slices/authSlice";

export const rootReducer = combineReducers({
    catalog: catalogReducer,
    latestCars: latestCarReducer,
    ads: adsReducer,
    auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
