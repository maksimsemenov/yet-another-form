// MIT License

// Copyright (c) Diego Haz

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

// Most of those awsome typings was copied from a wonderful reakit package:
// https://github.com/reakit/reakit

/**
 * Creates an array like object with specified length
 * @template N Length
 */
export type ArrayWithLength<N extends number> = { [K in N]: any }

/**
 * ["foo", "bar", 0, "baz"]
 * @template T Object with keys { foo: { bar: [{ baz }] } }
 * @template P Path ["foo", "bar", 0, "baz"]
 */
export interface DeepPathArray<T, P> extends ReadonlyArray<any> {
  ['0']?: keyof T
  ['1']?: P extends {
    ['0']: infer K0
  }
    ? K0 extends keyof T
      ? keyof T[K0]
      : never
    : never
  ['2']?: P extends {
    ['0']: infer K0
    ['1']: infer K1
  }
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? keyof T[K0][K1]
        : never
      : never
    : never
  ['3']?: P extends {
    ['0']: infer K0
    ['1']: infer K1
    ['2']: infer K2
  }
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? keyof T[K0][K1][K2]
          : never
        : never
      : never
    : never
  ['4']?: P extends {
    ['0']: infer K0
    ['1']: infer K1
    ['2']: infer K2
    ['3']: infer K3
  }
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? keyof T[K0][K1][K2][K3]
            : never
          : never
        : never
      : never
    : never
  ['5']?: P extends {
    ['0']: infer K0
    ['1']: infer K1
    ['2']: infer K2
    ['3']: infer K3
    ['4']: infer K4
  }
    ? K0 extends keyof T
      ? K1 extends keyof T[K0]
        ? K2 extends keyof T[K0][K1]
          ? K3 extends keyof T[K0][K1][K2]
            ? K4 extends keyof T[K0][K1][K2][K3]
              ? keyof T[K0][K1][K2][K3][K4]
              : never
            : never
          : never
        : never
      : never
    : never
}

/**
 * Returns the value within T object based on given array path
 * @template T Object with keys { foo: { bar: [{ baz }] } }
 * @template P Path ["foo", "bar", 0, "baz"]
 */
export type DeepPathArrayValue<
  T,
  P extends DeepPathArray<T, P>
> = P extends ArrayWithLength<0 | 1 | 2 | 3 | 4 | 5 | 6>
  ? any
  : P extends ArrayWithLength<0 | 1 | 2 | 3 | 4 | 5>
  ? T[P[0]][P[1]][P[2]][P[3]][P[4]][P[5]]
  : P extends ArrayWithLength<0 | 1 | 2 | 3 | 4>
  ? T[P[0]][P[1]][P[2]][P[3]][P[4]]
  : P extends ArrayWithLength<0 | 1 | 2 | 3>
  ? T[P[0]][P[1]][P[2]][P[3]]
  : P extends ArrayWithLength<0 | 1 | 2>
  ? T[P[0]][P[1]][P[2]]
  : P extends ArrayWithLength<0 | 1>
  ? T[P[0]][P[1]]
  : P extends ArrayWithLength<0>
  ? T[P[0]]
  : never

/**
 * DeepPath argument
 * @template T Object with keys { foo: { bar: [{ baz }] } }
 * @template P ["foo", "bar", 0, "baz"] or "foo"
 */
export type DeepPath<T, P> = DeepPathArray<T, P> | keyof T

/**
 * DeepPath return
 * @template T Object with keys { foo: { bar: [{ baz }] } }
 * @template P ["foo", "bar", 0, "baz"] or "foo"
 */
export type DeepPathValue<
  T,
  P extends DeepPath<T, P>
> = P extends DeepPathArray<T, P>
  ? DeepPathArrayValue<T, P>
  : P extends keyof T
  ? T[P]
  : any

/**
 * @template T Object
 * @template V Value
 */
export type DeepMap<T, V> = {
  [K in keyof T]: T[K] extends Array<infer U> | undefined
    ? U extends object
      ? Array<DeepMap<U, V>>
      : object extends U
      ? Array<DeepMap<U, V>>
      : Array<V>
    : T[K] extends object
    ? DeepMap<T[K], V>
    : object extends T[K]
    ? DeepMap<T[K], V>
    : V
}

/**
 * @template T Object
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : T[P] extends string | number | boolean | Function
    ? T[P]
    : DeepPartial<T[P]>
}

export type Values<T> = T extends object ? T[keyof T] : never

export type DeepPathMap<T> = T extends object
  ? {
      [P in keyof T]: P extends string
        ? T[P] extends Array<infer U>
          ? `${P}.${number}` | `${P}.${number}.${Values<DeepPathMap<U>>}`
          : T[P] extends object
          ? P | `${P}.${Values<DeepPathMap<T[P]>>}`
          : P
        : never
    }
  : never

//
// WIP
export type DeepValueByPath<
  T extends object,
  P
> = P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}.${infer K5}.${infer K6}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? K2 extends keyof T[K0][K1]
        ? K3 extends keyof T[K0][K1][K2]
          ? K4 extends keyof T[K0][K1][K2][K3]
            ? K5 extends keyof T[K0][K1][K2][K3][K4]
              ? K6 extends keyof T[K0][K1][K2][K3][K4][K5]
                ? T[K0][K1][K2][K3][K4][K5][K6]
                : never
              : never
            : never
          : never
        : never
      : never
    : never
  : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}.${infer K5}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? K2 extends keyof T[K0][K1]
        ? K3 extends keyof T[K0][K1][K2]
          ? K4 extends keyof T[K0][K1][K2][K3]
            ? K5 extends keyof T[K0][K1][K2][K3][K4]
              ? T[K0][K1][K2][K3][K4][K5]
              : never
            : never
          : never
        : never
      : never
    : never
  : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}.${infer K4}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? K2 extends keyof T[K0][K1]
        ? K3 extends keyof T[K0][K1][K2]
          ? K4 extends keyof T[K0][K1][K2][K3]
            ? T[K0][K1][K2][K3][K4]
            : never
          : never
        : never
      : never
    : never
  : P extends `${infer K0}.${infer K1}.${infer K2}.${infer K3}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? K2 extends keyof T[K0][K1]
        ? K3 extends keyof T[K0][K1][K2]
          ? T[K0][K1][K2][K3]
          : never
        : never
      : never
    : never
  : P extends `${infer K0}.${infer K1}.${infer K2}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? K2 extends keyof T[K0][K1]
        ? T[K0][K1][K2]
        : never
      : never
    : never
  : P extends `${infer K0}.${infer K1}`
  ? K0 extends keyof T
    ? K1 extends keyof T[K0]
      ? T[K0][K1]
      : never
    : never
  : P extends keyof T
  ? T[P]
  : unknown

type RestrictName<P, T> = P extends { name: unknown }
  ? Omit<P, 'name'> & { name: Values<DeepPathMap<T>> }
  : P & { name: Values<DeepPathMap<T>> }
