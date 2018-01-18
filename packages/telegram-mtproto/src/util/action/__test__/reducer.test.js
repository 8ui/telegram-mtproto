//@flow

import {combineReducers} from 'redux'
// import {from, Stream} from 'most'
import {createReducer, type ReduxReducer} from '..'
import {fooStore, fooAction, getSend} from './fixtures'

test('reducer.on', () => {
  const fn = jest.fn()
  const fnB = jest.fn(x => x.foo)
  const fnC = jest.fn(x => x.foo)
  const action = fooAction()
  const action1 = fooAction()
  const action2 = fooAction()
  const reducer: ReduxReducer<'bar'> = createReducer('bar')
    .on(action, (state: 'bar', payload) => fnB(payload))
    .on([action1, action2], (state, payload) => fnC(payload))
  const rootReducer = combineReducers({
    foo: reducer,
  })
  const store = fooStore(fn, rootReducer)
  const send = getSend(store)
  const payload = {foo: 'bar'}
  send(action(payload))
  send(action(payload))
  send(action1(payload))
  send(action2(payload))
  send(action2(payload))
  expect(fnC).toHaveBeenCalledTimes(3)
  expect(fnB).toHaveBeenCalledTimes(2)
  expect(fnB).toHaveBeenCalledWith(payload)
})

test('reducer.off', () => {
  const fn = jest.fn()
  const fnB = jest.fn(x => x.foo)
  const fnC = jest.fn(x => x.foo)
  const action = fooAction()
  const action1 = fooAction()
  const action2 = fooAction()
  const reducer: ReduxReducer<'bar'> = createReducer('bar')
    .on(action, (state: 'bar', payload) => fnB(payload))
    .on([action1, action2], (state, payload) => fnC(payload))
  const rootReducer = combineReducers({
    foo: reducer,
  })
  const store = fooStore(fn, rootReducer)
  const send = getSend(store)
  const payload = {foo: 'bar'}
  send(action(payload))
  send(action(payload))
  send(action1(payload))
  reducer
    .off(action1)
    .off([action2])
  send(action2(payload))
  send(action2(payload))
  expect(fnC).toHaveBeenCalledTimes(1)
  expect(fnB).toHaveBeenCalledTimes(2)
  expect(fnB).toHaveBeenCalledWith(payload)
})


test('reducer.off', () => {
  const fn = jest.fn()
  const fnB = jest.fn(x => x.foo)
  const fnC = jest.fn(x => x.foo)
  const action = fooAction()
  const action1 = fooAction()
  const reducer: ReduxReducer<'bar'> = createReducer('bar')
    .on(action, (state: 'bar', payload) => fnB(payload))

  const rootReducer = combineReducers({
    foo: reducer,
  })
  const store = fooStore(fn, rootReducer)
  const send = getSend(store)
  const payload = {foo: 'bar'}

  expect(reducer.has(action)).toBeTruthy()
  expect(reducer.has(action1)).toBeFalsy()

  send(action1(payload))

  reducer
    .on(action1, (state, payload) => fnC(payload))

  expect(reducer.has(action1)).toBeTruthy()
  expect(fnC).not.toHaveBeenCalled()

  send(action1(payload))

  reducer
    .off(action1)

  send(action1(payload))

  expect(fnC).toHaveBeenCalledTimes(1)
})
