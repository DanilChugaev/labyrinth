import { describe, expect, it } from 'vitest';
import {
  decodeUint8Array,
  decodeUint32Array,
  encodeUint8Array,
  encodeUint32Array,
} from './binaryStorage.ts';

describe('binaryStorage', () => {
  it('должен сериализовать и восстановить Uint8Array', () => {
    const source = new Uint8Array([0, 1, 15, 255]);

    expect(decodeUint8Array(encodeUint8Array(source))).toEqual(source);
  });

  it('должен сериализовать и восстановить Uint32Array', () => {
    const source = new Uint32Array([0, 1, 65_535, 4_294_967_295]);

    expect(decodeUint32Array(encodeUint32Array(source))).toEqual(source);
  });

  it('должен вернуть null для некорректной Base64-строки', () => {
    expect(decodeUint8Array('not base64!')).toBeNull();
  });

  it('должен вернуть null для Uint32Array с неполным числом байт', () => {
    const invalidValue = encodeUint8Array(new Uint8Array([1, 2, 3]));

    expect(decodeUint32Array(invalidValue)).toBeNull();
  });
});
