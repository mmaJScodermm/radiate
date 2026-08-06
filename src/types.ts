import type { BehaviorSubject, Observable } from "rxjs";

export type EqualityFn<TValue> = (previous: TValue, next: TValue) => boolean;

export type Selector<TState, TSelected> = (state: TState) => TSelected;

export type StateUpdate<TState> =
  | TState
  | Partial<TState>
  | ((previousState: TState) => TState | Partial<TState>);

export type StoreInitializer<TState> = TState | (() => TState);

export type Unsubscribe = () => void;

export interface SetStateOptions {
  replace?: boolean;
}

export interface SelectionOptions<TValue> {
  equalityFn?: EqualityFn<TValue>;
}

export interface Store<TState> {
  readonly subject: BehaviorSubject<TState>;
  readonly state$: Observable<TState>;
  getState(): TState;
  setState(update: StateUpdate<TState>, options?: SetStateOptions): TState;
  patchState(partial: Partial<TState>): TState;
  select<TSelected>(
    selector: Selector<TState, TSelected>,
    options?: SelectionOptions<TSelected>,
  ): Observable<TSelected>;
  subscribe(listener: (state: TState) => void): Unsubscribe;
  subscribeTo<TSelected>(
    selector: Selector<TState, TSelected>,
    listener: (selectedState: TSelected) => void,
    options?: SelectionOptions<TSelected>,
  ): Unsubscribe;
  reset(): TState;
  destroy(): void;
}

export interface UseStoreOptions<TSelected> extends SelectionOptions<TSelected> {}

export interface BoundStore<TState> extends Store<TState> {
  readonly state: TState;
}
