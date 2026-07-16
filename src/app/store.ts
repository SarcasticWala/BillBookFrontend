import { configureStore } from "@reduxjs/toolkit";
import { partyApi } from "../features/party/partyApiSlice";
import { itemApi } from "../features/item/itemApiSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { saleApi } from "../features/sales/saleApiSlice";
import { purchaseApi } from "../features/purchase/purchaseApiSlice";
import { authApi } from "../features/auth/authApiSlice";
import { documentApi } from "../features/document/documentApiSlice";
import { paymentApi } from "../features/payment/paymentApiSlice";
import { demoApi } from "../features/demo/demoApiSlice";
import { accountApi } from "../features/account/accountApiSlice";
import { authErrorMiddleware } from "./authErrorMiddleware";

export const store = configureStore({
  reducer: {
    [partyApi.reducerPath]: partyApi.reducer,
    [itemApi.reducerPath]: itemApi.reducer,
    [saleApi.reducerPath]: saleApi.reducer,
    [purchaseApi.reducerPath]: purchaseApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [documentApi.reducerPath]: documentApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [demoApi.reducerPath]: demoApi.reducer,
    [accountApi.reducerPath]: accountApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      partyApi.middleware,
      itemApi.middleware,
      saleApi.middleware,
      purchaseApi.middleware,
      authApi.middleware,
      documentApi.middleware,
      paymentApi.middleware,
      demoApi.middleware,
      accountApi.middleware,
      authErrorMiddleware,
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;