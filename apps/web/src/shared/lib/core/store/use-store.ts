import { useSyncExternalStore, useCallback } from "react";
import type { Store } from "./create-store";

export function useStore<T, S>(store: Store<T>, selector: (state: T) => S): S {
	const getSnapshot = useCallback(
		() => selector(store.getState()),
		[store, selector],
	);

	const subscribe = useCallback(
		(onStoreChange: () => void) =>
			store.subscribe(selector, () => {
				onStoreChange();
			}),
		[store, selector],
	);

	return useSyncExternalStore(subscribe, getSnapshot);
}
