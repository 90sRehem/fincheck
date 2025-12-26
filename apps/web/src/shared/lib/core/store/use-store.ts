import { useSyncExternalStore } from "react";
import type { Store } from "./create-store";

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
  const getSnapshot = () => selector(store.getState());

  const subscribe = (onStoreChange: () => void) =>
    store.subscribe(
      selector,
      () => {
        onStoreChange();
      }
    );

  return useSyncExternalStore(subscribe, getSnapshot);
}
