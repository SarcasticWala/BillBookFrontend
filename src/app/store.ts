import { configureStore } from "@reduxjs/toolkit";
import { partyApi } from "../features/party/partyApiSlice";
import { itemApi } from "../features/item/itemApiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { saleApi } from "../features/sales/saleApiSlice";
import { purchaseApi } from "../features/purchase/purchaseApiSlice";

export const store = configureStore({
  reducer: {
    [partyApi.reducerPath]: partyApi.reducer,
    [itemApi.reducerPath]: itemApi.reducer,
    [saleApi.reducerPath]: saleApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      partyApi.middleware,
      itemApi.middleware,
      saleApi.middleware,
      purchaseApi.middleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;