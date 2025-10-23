import { combineReducers } from "@reduxjs/toolkit";
import catalogReducer from "./slices/catalogSlice";
import latestCarReducer from "./slices/latestCarSlice";
import adsReducer from "./slices/adsSlice";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import favouritesReduces from "./slices/favouriteSlice";
import chatReducer from "./slices/chatSlice";

export const rootReducer = combineReducers({
    catalog: catalogReducer,
    latestCars: latestCarReducer,
    ads: adsReducer,
    auth: authReducer,
    admin: adminReducer,
    favourites: favouritesReduces,
    chat: chatReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
