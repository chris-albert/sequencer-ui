import React from 'react'
import update from 'immutability-helper'
import {Repository} from "./Repository";

export type State<A> = {
  value: A
  set: (f: (a: A) => A) => void
  remove: () => void
  focus: <B extends keyof A>(b: B) => A[B] extends Array<infer C> ? ArrayState<C> : State<A[B]>
  type: 'value'
}

export type ArrayState<A> = {
  values: Array<A>
  create: (from: number | undefined) => void
  append: (a: A) => void
  remove: (index: number) => void
  removeAll: () => void
  set: (index: number, value: A) => void
  swap: (from: number, to: number) => void
  isEmpty: boolean
  focus: (index: number) => State<A>
  map: <B>(f: (s: State<A>, i: number) => B) => Array<B>
  type: 'arrayValue'
}

export const State = {
  array: function <A>(impl: Omit<ArrayState<A>, 'type'>): ArrayState<A> {
    return {
      ...impl,
      type: 'arrayValue'
    }
  },
  value: function <A>(impl: Omit<State<A>, 'type' | 'focus'>): State<A> {
    const state: State<A> = {
      ...impl,
      focus: <B extends keyof A>(b: B): A[B] extends Array<infer C> ? ArrayState<C> : State<A[B]> => {
        const s = focus<A, B>(state, b)
        if(Array.isArray(s.value)) {
          return focusArray(s as unknown as State<Array<any>>, emptyStoreStateArrayOps()) as A[B] extends Array<infer C> ? ArrayState<C> : State<A[B]>
        } else {
          return s as A[B] extends Array<infer C> ? ArrayState<C> : State<A[B]>
        }
      },
      type: 'value'
    }

    return state
  }
}

export const useStoreState: <A>(repo: Repository<A>) => State<A> =
  <A>(repo: Repository<A>) => {

    const { get, set, remove } = repo

    const [state, setState] = React.useState<State<A>>(State.value({
      value: get(),
      set: setV,
      remove: removeV
    }))

    function setV(func: (a: A) => A): void {

      const newResult = func(get())
      set(newResult)
      setState(State.value({value: newResult, set: setV, remove: removeV}))
    }

    function removeV(): void {
      remove()
      setState({...state, value: get()})
    }

    return state
  }


export const focus: <A, B extends keyof A>(state: State<A>, k: B) => State<A[B]> =
  <A, B extends keyof A>(stateA: State<A>, key: B) => {

    const value = stateA.value[key]
    const set: (f: (a: A[B]) => A[B]) => void = func => {
      stateA.set(a => {
        const newB = func(a[key])
        return {
          ...a,
          [key]: newB
        }
      })
    }
    const remove: () => void = () => {
    }

    return State.value<A[B]>({value, set, remove})
  }

export const useStoreStateObject: <A, B extends keyof A>(state: State<A>, k: B) => State<A[B]> = focus

export type StoreStateArrayOpts<A> = {
  create: () => A
  clone: (a: A) => A
}

export const emptyStoreStateArrayOps = <A>(): StoreStateArrayOpts<A> => ({
  create: () => {
    throw new Error("Can't create empty stores")
  },
  clone: a => {
    throw new Error("Can't clone empty stores")
  }
})

export const focusArray: <A>(state: State<Array<A>>, opts: StoreStateArrayOpts<A>) => ArrayState<A> =
  <A>(stateA: State<Array<A>>, opts: StoreStateArrayOpts<A>) => {
    const values: Array<A> = stateA.value

    const create: (from: number | undefined) => void = (from: number | undefined) => {
      if (from === undefined) {
        stateA.set(prev => [...prev, opts.create()])
      } else {
        stateA.set(prev => [...prev, opts.clone(prev[from])])
      }
    }

    const remove: (index: number) => void = (index) => {
      stateA.set(prev => update(prev, {
        $splice: [[index, 1]]
      }))
    }

    const removeAll: () => void = () => {
      stateA.set(__ => [])
    }

    const set: (index: number, value: A) => void = (index, value) => {
      stateA.set(prev => update(prev, {
        $splice: [[index, 1, value]]
      }))
    }

    const swap: (from: number, to: number) => void = (from, to) => {
      stateA.set(prev => update(prev, {
        $splice: [
          [from, 1],
          [to, 0, prev[from]]
        ]
      }))
    }

    const append: (a: A) => void = a => {
      stateA.set(prev => [...prev, a])
    }

    const focus: (index: number) => State<A> = index => {

      return State.value({
        value: values[index],
        set: (f: (a: A) => A) => {
          set(index, f(values[index]))
        },
        remove: () => {
          remove(index)
        }
      })
    }

    const map = <B>(f: (s: State<A>, i: number) => B): Array<B> => {
      return values.map((value, i) => f(focus(i), i))
    }


    const isEmpty: boolean = values.length === 0

    return State.array({
      values,
      create,
      remove,
      append,
      removeAll,
      set,
      swap,
      isEmpty,
      map,
      focus
    })
  }

export const useStoreStateArray: <A>(state: State<Array<A>>, opts: StoreStateArrayOpts<A>) => ArrayState<A> =
  focusArray
