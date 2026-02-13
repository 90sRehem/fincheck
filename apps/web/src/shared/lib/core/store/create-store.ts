import { useStore } from "./use-store";

type Selector<T, S> = (state: T) => S;
type Listener<S> = (slice: S) => void;
type EqualityFn<S> = (a: S, b: S) => boolean;

export interface Store<T> {
  getState(): T;

  subscribe<S>(
    selector: Selector<T, S>,
    listener: Listener<S>,
    isEqual?: EqualityFn<S>,
  ): () => void;
  setState(partial: Partial<T> | ((state: T) => Partial<T>)): void;
  useSelector<S>(selector: Selector<T, S>): S;
}

type Subscriber<T> = {
  selector: (state: T) => unknown;
  listener: (slice: unknown) => void;
  isEqual: (a: unknown, b: unknown) => boolean;
  lastSlice: unknown;
};

export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;

  const subscribers = new Set<Subscriber<T>>();

  const getState = () => state;

  const subscribe = <S>(
    selector: Selector<T, S>,
    listener: Listener<S>,
    isEqual: EqualityFn<S> = Object.is,
  ) => {
    const sub: Subscriber<T> = {
      selector,
      listener: listener as (slice: unknown) => void,
      isEqual: isEqual as (a: unknown, b: unknown) => boolean,
      lastSlice: selector(state),
    };

    subscribers.add(sub);

    return () => {
      subscribers.delete(sub);
    };
  };

  function setState(updater: Partial<T> | ((state: T) => Partial<T>)) {
    const partial = typeof updater === "function" ? updater(state) : updater;

    state = { ...state, ...partial };

    for (const sub of subscribers) {
      const nextSlice = sub.selector(state);

      if (!sub.isEqual(sub.lastSlice, nextSlice)) {
        sub.lastSlice = nextSlice;
        sub.listener(nextSlice);
      }
    }
  }

  const storeBase = {
    getState,
    subscribe,
    setState,
  };

  const useSelector = <S>(selector: Selector<T, S>): S => {
    return useStore(storeBase as Store<T>, selector);
  };

  return {
    getState,
    subscribe,
    setState,
    useSelector,
  };
}
