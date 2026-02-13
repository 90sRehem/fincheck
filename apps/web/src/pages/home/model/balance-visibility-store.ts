import { createStore } from "@/shared/lib/core/store/create-store";

type BalanceVisibilityState = {
  hideAmount: boolean;
};

const initialState: BalanceVisibilityState = {
  hideAmount: false,
};

export const balanceVisibilityStore = createStore(initialState);

export function toggleBalanceVisibility() {
  const { hideAmount } = balanceVisibilityStore.getState();
  balanceVisibilityStore.setState({ hideAmount: !hideAmount });
}

export function setBalanceVisibility(hideAmount: boolean) {
  balanceVisibilityStore.setState({ hideAmount });
}

// Hook para usar no React
export function useBalanceVisibility() {
  return balanceVisibilityStore.useSelector((state) => state.hideAmount);
}
