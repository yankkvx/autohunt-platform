import { combineReducers } from "@reduxjs/toolkit";
import catalogReducer from "./slices/catalogSlice";

export const rootReducer = combineReducers({
    catalog: catalogReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
