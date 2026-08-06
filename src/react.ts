import { useEffect, useRef, useState } from "react";

import { createStore } from "./store";
import type {
  BoundStore,
  Selector,
  Store,
  StoreInitializer,
  UseStoreOptions,
} from "./types";

const identity = <TValue,>(value: TValue) => value;

export const useRadiateState = <TState>(
  initializer: StoreInitializer<TState>,
): BoundStore<TState> => {
  const storeRef = useRef<Store<TState> | null>(null);

  if (!storeRef.current) {
    storeRef.current = createStore(initializer);
  }

  useEffect(() => {
    const store = storeRef.current;

    return () => {
      store?.destroy();
    };
  }, []);

  return useRadiateStore(storeRef.current);
};

export const useRadiateStore = <TState>(
  store: Store<TState>,
): BoundStore<TState> => {
  const [state, setState] = useState<TState>(() => store.getState());

  useEffect(() => {
    setState(store.getState());

    return store.subscribe((nextState) => {
      setState(nextState);
    });
  }, [store]);

  return {
    ...store,
    state,
  };
};

export const useRadiateValue = <TState, TSelected = TState>(
  store: Store<TState>,
  selector?: Selector<TState, TSelected>,
  options?: UseStoreOptions<TSelected>,
): TSelected => {
  const selectorRef = useRef<Selector<TState, TSelected>>(
    selector ?? (identity as Selector<TState, TSelected>),
  );
  const equalityFnRef = useRef(options?.equalityFn ?? Object.is);

  selectorRef.current = selector ?? (identity as Selector<TState, TSelected>);
  equalityFnRef.current = options?.equalityFn ?? Object.is;

  const [selectedState, setSelectedState] = useState<TSelected>(() =>
    selectorRef.current(store.getState()),
  );

  useEffect(() => {
    const syncSelection = (nextStoreState: TState) => {
      const nextSelectedState = selectorRef.current(nextStoreState);

      setSelectedState((currentState) =>
        equalityFnRef.current(currentState, nextSelectedState)
          ? currentState
          : nextSelectedState,
      );
    };

    syncSelection(store.getState());

    return store.subscribe(syncSelection);
  }, [store]);

  return selectedState;
};

export const useStore = useRadiateValue;
