import { combineReducers } from "@reduxjs/toolkit";
import catalogReducer from "./slices/catalogSlice";
import latestCarReducer from "./slices/latestCarSlice";
import adsReducer from "./slices/adsSlice";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";

export const rootReducer = combineReducers({
    catalog: catalogReducer,
    latestCars: latestCarReducer,
    ads: adsReducer,
    auth: authReducer,
    admin: adminReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
