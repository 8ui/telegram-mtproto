//@flow

import type {Action} from './action'
import {assignInstance} from './fixtures'
import {getReducerId} from './register'

type RawAction<A = mixed> = string | Action<A> | {getType(): string}


declare
class ReduxField<S> {
    (state: S, action: any): S,
    on<P, A/*::: Action<P> | $ReadOnlyArray<Action<P>>*/>
        ( actions: A, reducer: (state: S, payload: P) => S ): ReduxReducer<S>
  }

export class ReduxReducer<State = mixed> /*::extends ReduxField<State>*/ {
  /*::+*/reducer: this
  defaultState: State
  types: Map<string, Function> = new Map()
  reducerId: number = getReducerId()
  constructor(defaultState: State) {
    /*::super()*/
    this.defaultState = defaultState
    //$off
    this.on = this.on.bind(this)
    //$off
    this.off = this.off.bind(this)
  }
  has(value: any) {
    return this.types.has(normalizeType(value))
  }

  reduce<P, M>(state: State, action: {
    type: string,
    payload: P,
    meta: M,
  }): State {
    const handler = this.types.get(action.type)
    if (action && handler) {
      const result = handler(state || this.defaultState, action.payload, action.meta)
      if (result !== undefined) return result
    }
    return state || this.defaultState
  }

  on<P, A/*::: Action<P> | $ReadOnlyArray<Action<P>>*/>(
    typeOrActionCreator: A,
    handler: (state: State, payload: P) => State
  ): ReduxReducer<State> {
    if (Array.isArray(typeOrActionCreator)) {
      typeOrActionCreator.forEach(action => {
        this.on(action, handler)
      })
    } else {
      this.types.set(normalizeType(typeOrActionCreator), handler)
    }

    return this.reducer
  }

  off(typeOrActionCreator: RawAction<*> | $ReadOnlyArray<RawAction<*>>) {
    if (Array.isArray(typeOrActionCreator)) {
      typeOrActionCreator.forEach(this.off)
    } else {
      this.types.delete(normalizeType(typeOrActionCreator))
    }
    return this.reducer
  }
  manual(fn: (on: $PropertyType<this, 'on'>, off: $PropertyType<this, 'off'>) => void) {
    fn(this.on, this.off)
    return this.reducer
  }

}

export function createReducer<State>(defaultState: State): ReduxReducer<State> {
  const reducerObject: ReduxReducer<State> = new ReduxReducer(defaultState)
  function reduce<P, M>(state: State = this.defaultState, action: {
    type: string,
    payload: P,
    meta: M,
  }): State {
    return this.reduce(state, action)
  }
  const binded = reduce.bind(reducerObject)
  //$off
  reducerObject.reducer = binded
  const result = Object.setPrototypeOf(binded, reducerObject)

  return result
}

function normalizeType(typeOrActionCreator: RawAction<*>) {
  if (typeof typeOrActionCreator === 'string') return typeOrActionCreator
  if (typeof typeOrActionCreator.getType === 'function' || typeof typeOrActionCreator.toString === 'function') {
    return typeOrActionCreator.toString()
  }
  return String(typeOrActionCreator)
}
