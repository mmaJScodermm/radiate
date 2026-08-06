import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";

import type {
  EqualityFn,
  SelectionOptions,
  SetStateOptions,
  StateUpdate,
  Store,
  StoreInitializer,
} from "./types";

const defaultEqualityFn = <TValue>(previous: TValue, next: TValue) =>
  Object.is(previous, next);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === "[object Object]";

const cloneInitialState = <TState>(state: TState): TState => {
  if (Array.isArray(state)) {
    return [...state] as TState;
  }

  if (isPlainObject(state)) {
    return { ...state } as TState;
  }

  return state;
};

const resolveInitializer = <TState>(
  initializer: StoreInitializer<TState>,
): TState =>
  typeof initializer === "function"
    ? (initializer as () => TState)()
    : cloneInitialState(initializer);

const resolveUpdate = <TState>(
  currentState: TState,
  update: StateUpdate<TState>,
  options?: SetStateOptions,
): TState => {
  const resolvedUpdate =
    typeof update === "function"
      ? (update as (previousState: TState) => TState | Partial<TState>)(
          currentState,
        )
      : update;

  if (
    options?.replace ||
    !isPlainObject(currentState) ||
    !isPlainObject(resolvedUpdate)
  ) {
    return resolvedUpdate as TState;
  }

  return {
    ...currentState,
    ...resolvedUpdate,
  } as TState;
};

export const createStore = <TState>(
  initializer: StoreInitializer<TState>,
): Store<TState> => {
  const subject = new BehaviorSubject<TState>(resolveInitializer(initializer));

  const setState = (
    update: StateUpdate<TState>,
    options?: SetStateOptions,
  ) => {
    const currentState = subject.getValue();
    const nextState = resolveUpdate(currentState, update, options);
    const emittedState = Object.is(currentState, nextState)
      ? cloneInitialState(nextState)
      : nextState;

    subject.next(emittedState);
    return emittedState;
  };

  const patchState = (partial: Partial<TState>) =>
    setState(partial as StateUpdate<TState>);

  const select = <TSelected>(
    selector: (state: TState) => TSelected,
    options?: SelectionOptions<TSelected>,
  ) =>
    subject.pipe(
      map(selector),
      distinctUntilChanged(
        options?.equalityFn ?? (defaultEqualityFn as EqualityFn<TSelected>),
      ),
    );

  const subscribe = (listener: (state: TState) => void) => {
    const subscription = subject.subscribe(listener);
    return () => subscription.unsubscribe();
  };

  const subscribeTo = <TSelected>(
    selector: (state: TState) => TSelected,
    listener: (selectedState: TSelected) => void,
    options?: SelectionOptions<TSelected>,
  ) => {
    const subscription = select(selector, options).subscribe(listener);
    return () => subscription.unsubscribe();
  };

  const reset = () => {
    const initialState = resolveInitializer(initializer);
    subject.next(initialState);
    return initialState;
  };

  const destroy = () => {
    subject.complete();
  };

  return {
    subject,
    state$: subject.asObservable(),
    getState: () => subject.getValue(),
    setState,
    patchState,
    select,
    subscribe,
    subscribeTo,
    reset,
    destroy,
  };
};
