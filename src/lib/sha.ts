interface Hash {
  blockSize: number;
  size: number;
  update: (data: Uint8Array) => void;
  digest: () => Uint8Array;
}

function rotr32(x: number, n: number): number {
  return ((x << (32 - n)) | (x >>> n)) >>> 0;
}

export function rotl32(x: number, n: number): number {
  return ((x << n) | (x >>> (32 - n))) >>> 0;
}

class BigEndian implements ByteOrder {
  public uint8(data: Uint8Array, offset: number): number {
    if (data.byteLength < offset + 1) {
      throw new TypeError("Insufficient bytes");
    }
    return data[offset];
  }

  public uint16(data: Uint8Array, offset: number): number {
    if (data.byteLength < offset + 2) {
      throw new TypeError("Insufficient bytes");
    }
    return (data[offset] << 8) | data[offset + 1];
  }

  public uint32(data: Uint8Array, offset: number): number {
    if (data.byteLength < offset + 4) {
      throw new TypeError("Insufficient bytes");
    }
    let result = 0;
    for (let i = 0; i < 4; i++) {
      result |= data[offset + i] << (24 - i * 8);
    }
    return result;
  }

  public uint64(data: Uint8Array, offset: number): bigint {
    if (data.byteLength < offset + 8) {
      throw new TypeError("Insufficient bytes");
    }
    let result = 0n;
    for (let i = 0; i < 8; i++) {
      result |= BigInt(data[offset + i]) << BigInt(56 - i * 8);
    }
    return result;
  }

  public putUint8(target: Uint8Array, value: number, offset: number): void {
    if (target.length < offset + 1) {
      throw new TypeError("Not enough space");
    }
    if (value < 0 || value > 255) {
      throw new TypeError("Invalid uint8 value");
    }
    target[offset] = value;
  }

  public putUint16(target: Uint8Array, value: number, offset: number): void {
    if (target.length < offset + 2) {
      throw new TypeError("Not enough space");
    }
    if (value < 0 || value > 65535) {
      throw new TypeError("Invalid uint16 value");
    }
    target[offset] = value >> 8;
    target[offset + 1] = value & 0xff;
  }

  public putUint32(target: Uint8Array, value: number, offset: number): void {
    if (target.length < offset + 4) {
      throw new TypeError("Not enough space");
    }
    if (value < 0 || value > 4294967295) {
      throw new TypeError("Invalid uint32 value");
    }
    for (let i = 0; i < 4; i++) {
      target[offset + i] = (value >> ((3 - i) * 8)) & 0xff;
    }
  }

  public putUint64(target: Uint8Array, value: bigint, offset: number): void {
    if (target.length < offset + 8) {
      throw new TypeError("Not enough space");
    }
    if (value < 0 || value > 18446744073709551615n) {
      throw new TypeError("Invalid uint64 value");
    }
    for (let i = 0; i < 8; i++) {
      target[offset + i] = Number((value >> BigInt((7 - i) * 8)) & 0xffn);
    }
  }
}

const bigEndian = new BigEndian();

interface ByteOrder {
  uint8(data: Uint8Array, offset: number): number;
  uint16(data: Uint8Array, offset: number): number;
  uint32(data: Uint8Array, offset: number): number;
  uint64(data: Uint8Array, offset: number): bigint;
  putUint8(target: Uint8Array, value: number, offset: number): void;
  putUint16(target: Uint8Array, value: number, offset: number): void;
  putUint32(target: Uint8Array, value: number, offset: number): void;
  putUint64(target: Uint8Array, value: bigint, offset: number): void;
}

class SHA256 implements Hash {
  public blockSize = 64;
  public size = 32;

  private blocks = new Uint8Array(64);
  private currentBlockSize = 0;
  private H = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c,
    0x1f83d9ab, 0x5be0cd19,
  ]);
  private l = 0n;
  private w = new Uint32Array(64);

  public update(data: Uint8Array): void {
    this.l += BigInt(data.byteLength) * 8n;
    if (this.currentBlockSize + data.byteLength < 64) {
      this.blocks.set(data, this.currentBlockSize);
      this.currentBlockSize += data.byteLength;
      return;
    }
    let processed = 0;
    if (this.currentBlockSize > 0) {
      const next = data.slice(0, 64 - this.currentBlockSize);
      this.blocks.set(next, this.currentBlockSize);
      this.process();
      processed += next.byteLength;
      this.currentBlockSize = 0;
    }
    while (processed + 64 <= data.byteLength) {
      const next = data.slice(processed, processed + 64);
      this.blocks.set(next);
      this.process();
      processed += 64;
    }
    if (data.byteLength - processed > 0) {
      const remaining = data.slice(processed);
      this.blocks.set(remaining);
      this.currentBlockSize = remaining.byteLength;
    }
  }

  public digest(): Uint8Array {
    this.blocks[this.currentBlockSize] = 0x80;
    this.currentBlockSize += 1;
    if (64 - this.currentBlockSize < 8) {
      this.blocks.fill(0, this.currentBlockSize);
      this.process();
      this.currentBlockSize = 0;
    }
    this.blocks.fill(0, this.currentBlockSize);
    bigEndian.putUint64(this.blocks, this.l, this.blockSize - 8);
    this.process();
    const result = new Uint8Array(32);
    for (let i = 0; i < 8; i++) {
      bigEndian.putUint32(result, this.H[i], i * 4);
    }
    return result;
  }

  private process(): void {
    for (let t = 0; t < 16; t++) {
      this.w[t] =
        ((this.blocks[t * 4] << 24) |
          (this.blocks[t * 4 + 1] << 16) |
          (this.blocks[t * 4 + 2] << 8) |
          this.blocks[t * 4 + 3]) >>>
        0;
    }
    for (let t = 16; t < 64; t++) {
      const sigma1 =
        (rotr32(this.w[t - 2], 17) ^
          rotr32(this.w[t - 2], 19) ^
          (this.w[t - 2] >>> 10)) >>>
        0;
      const sigma0 =
        (rotr32(this.w[t - 15], 7) ^
          rotr32(this.w[t - 15], 18) ^
          (this.w[t - 15] >>> 3)) >>>
        0;
      this.w[t] = (sigma1 + this.w[t - 7] + sigma0 + this.w[t - 16]) | 0;
    }
    let a = this.H[0];
    let b = this.H[1];
    let c = this.H[2];
    let d = this.H[3];
    let e = this.H[4];
    let f = this.H[5];
    let g = this.H[6];
    let h = this.H[7];
    for (let t = 0; t < 64; t++) {
      const sigma1 = (rotr32(e, 6) ^ rotr32(e, 11) ^ rotr32(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const t1 = (h + sigma1 + ch + K[t] + this.w[t]) | 0;
      const sigma0 = (rotr32(a, 2) ^ rotr32(a, 13) ^ rotr32(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const t2 = (sigma0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    this.H[0] = (a + this.H[0]) | 0;
    this.H[1] = (b + this.H[1]) | 0;
    this.H[2] = (c + this.H[2]) | 0;
    this.H[3] = (d + this.H[3]) | 0;
    this.H[4] = (e + this.H[4]) | 0;
    this.H[5] = (f + this.H[5]) | 0;
    this.H[6] = (g + this.H[6]) | 0;
    this.H[7] = (h + this.H[7]) | 0;
  }
}

class SHA1 implements Hash {
  public blockSize = 64;
  public size = 20;

  private blocks = new Uint8Array(64);
  private currentBlockSize = 0;
  private H = new Uint32Array([
    0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0,
  ]);
  private l = 0;
  private w = new Uint32Array(80);

  public update(data: Uint8Array): void {
    this.l += data.byteLength * 8;
    if (this.currentBlockSize + data.byteLength < 64) {
      this.blocks.set(data, this.currentBlockSize);
      this.currentBlockSize += data.byteLength;
      return;
    }
    let processed = 0;
    if (this.currentBlockSize > 0) {
      const next = data.slice(0, 64 - this.currentBlockSize);
      this.blocks.set(next, this.currentBlockSize);
      this.process();
      processed += next.byteLength;
      this.currentBlockSize = 0;
    }
    while (processed + 64 <= data.byteLength) {
      const next = data.slice(processed, processed + 64);
      this.blocks.set(next);
      this.process();
      processed += 64;
    }
    if (data.byteLength - processed > 0) {
      const remaining = data.slice(processed);
      this.blocks.set(remaining);
      this.currentBlockSize = remaining.byteLength;
    }
  }

  public digest(): Uint8Array {
    this.blocks[this.currentBlockSize] = 0x80;
    this.currentBlockSize += 1;
    if (64 - this.currentBlockSize < 8) {
      this.blocks.fill(0, this.currentBlockSize);
      this.process();
      this.currentBlockSize = 0;
    }
    this.blocks.fill(0, this.currentBlockSize);
    bigEndian.putUint64(this.blocks, BigInt(this.l), this.blockSize - 8);
    this.process();
    const result = new Uint8Array(20);
    for (let i = 0; i < 5; i++) {
      bigEndian.putUint32(result, this.H[i], i * 4);
    }
    return result;
  }

  private process(): void {
    for (let t = 0; t < 16; t++) {
      this.w[t] =
        ((this.blocks[t * 4] << 24) |
          (this.blocks[t * 4 + 1] << 16) |
          (this.blocks[t * 4 + 2] << 8) |
          this.blocks[t * 4 + 3]) >>>
        0;
    }
    for (let t = 16; t < 80; t++) {
      this.w[t] = rotl32(
        (this.w[t - 3] ^ this.w[t - 8] ^ this.w[t - 14] ^ this.w[t - 16]) >>> 0,
        1,
      );
    }
    let a = this.H[0];
    let b = this.H[1];
    let c = this.H[2];
    let d = this.H[3];
    let e = this.H[4];
    for (let t = 0; t < 80; t++) {
      let F: number, K: number;
      if (t < 20) {
        F = ((b & c) ^ (~b & d)) >>> 0;
        K = 0x5a827999;
      } else if (t < 40) {
        F = (b ^ c ^ d) >>> 0;
        K = 0x6ed9eba1;
      } else if (t < 60) {
        F = ((b & c) ^ (b & d) ^ (c & d)) >>> 0;
        K = 0x8f1bbcdc;
      } else {
        F = (b ^ c ^ d) >>> 0;
        K = 0xca62c1d6;
      }
      const T = (rotl32(a, 5) + e + F + this.w[t] + K) | 0;
      e = d;
      d = c;
      c = rotl32(b, 30);
      b = a;
      a = T;
    }
    this.H[0] = (this.H[0] + a) | 0;
    this.H[1] = (this.H[1] + b) | 0;
    this.H[2] = (this.H[2] + c) | 0;
    this.H[3] = (this.H[3] + d) | 0;
    this.H[4] = (this.H[4] + e) | 0;
  }
}

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export function sha256(data: Uint8Array): Uint8Array {
  const hash = new SHA256();
  hash.update(data);
  return hash.digest();
}

export function sha1(data: Uint8Array): Uint8Array {
  const hash = new SHA1();
  hash.update(data);
  return hash.digest();
}
