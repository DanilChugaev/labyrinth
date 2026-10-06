const BASE64_CHUNK_SIZE = 0x8000;

export function encodeUint8Array(value: Uint8Array): string {
  let binary = '';

  for (let offset = 0; offset < value.length; offset += BASE64_CHUNK_SIZE) {
    binary += String.fromCharCode(...value.subarray(offset, offset + BASE64_CHUNK_SIZE));
  }

  return btoa(binary);
}

export function decodeUint8Array(value: string): Uint8Array | null {
  try {
    const binary = atob(value);
    const array = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index++) {
      array[index] = binary.charCodeAt(index);
    }

    return array;
  } catch {
    return null;
  }
}

export function encodeUint32Array(value: Uint32Array): string {
  return encodeUint8Array(new Uint8Array(value.buffer, value.byteOffset, value.byteLength));
}

export function decodeUint32Array(value: string): Uint32Array | null {
  const bytes = decodeUint8Array(value);
  if (!bytes || bytes.byteLength % Uint32Array.BYTES_PER_ELEMENT !== 0) return null;

  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  return new Uint32Array(buffer);
}
