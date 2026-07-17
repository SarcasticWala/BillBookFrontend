import { store } from "./store";
import { partyApi } from "../features/party/partyApiSlice";
import { itemApi } from "../features/item/itemApiSlice";
import { saleApi } from "../features/sales/saleApiSlice";
import { purchaseApi } from "../features/purchase/purchaseApiSlice";
import { authApi } from "../features/auth/authApiSlice";
import { documentApi } from "../features/document/documentApiSlice";
import { paymentApi } from "../features/payment/paymentApiSlice";
import { demoApi } from "../features/demo/demoApiSlice";
import { accountApi } from "../features/account/accountApiSlice";
import { dashboardApi } from "../features/dashboard/dashboardApiSlice";
import { expenseApi } from "../features/expense/expenseApiSlice";

/**
 * Wipe every RTK Query cache. Call on logout / 401 so a different user (tenant)
 * signing in on the same tab never sees the previous session's cached data.
 */
export function resetAllApiCache(): void {
  [
    partyApi,
    itemApi,
    saleApi,
    purchaseApi,
    authApi,
    documentApi,
    paymentApi,
    demoApi,
    accountApi,
    dashboardApi,
    expenseApi,
  ].forEach((api) => store.dispatch(api.util.resetApiState()));
}
