#!/usr/bin/env node
/**
 * Shrinks the textures embedded in a binary glTF (.glb) and rebuilds the file.
 *
 * The Lanyard's card.glb ships a 1678² PNG atlas (~2.3 MB). The page paints its own front and
 * back art over that atlas, so only the card edges still sample it; a 1024² JPEG is plenty.
 * Every buffer view is copied across with fresh offsets and 4-byte alignment, and the JSON and
 * BIN chunks are padded as the GLB spec requires.
 *
 * Usage:
 *   node scripts/shrink-glb.mjs [in.glb] [out.glb] [--size 1024] [--format jpeg|png] [--quality 88]
 * Defaults: in = out = src/assets/lanyard/card.glb, size 1024, jpeg, quality 88.
 * Images that are already within --size and in the requested format are left untouched.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const args = process.argv.slice(2);
const positional = [];
const opts = {};
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) opts[args[i].slice(2)] = args[++i];
  else positional.push(args[i]);
}
const input = positional[0] ?? 'src/assets/lanyard/card.glb';
const output = positional[1] ?? input;
const size = Number(opts.size ?? 1024);
const format = opts.format === 'png' ? 'png' : 'jpeg';
const quality = Number(opts.quality ?? 88);
const mime = format === 'png' ? 'image/png' : 'image/jpeg';

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"
const CHUNK_BIN = 0x004e4942; // "BIN\0"
const align4 = (n) => (n + 3) & ~3;

// ---- read -----------------------------------------------------------------------------------
const glb = readFileSync(input);
if (glb.readUInt32LE(0) !== GLB_MAGIC) throw new Error(`${input} is not a GLB file`);
if (glb.readUInt32LE(4) !== 2) throw new Error('only glTF 2.0 GLB files are supported');

let json = null;
let bin = null;
for (let offset = 12; offset < glb.length; ) {
  const length = glb.readUInt32LE(offset);
  const type = glb.readUInt32LE(offset + 4);
  const data = glb.subarray(offset + 8, offset + 8 + length);
  if (type === CHUNK_JSON) json = JSON.parse(data.toString('utf8'));
  else if (type === CHUNK_BIN && !bin) bin = data;
  offset += 8 + length;
}
if (!json || !bin) throw new Error('GLB is missing its JSON or BIN chunk');
if ((json.buffers ?? []).some((b, i) => i > 0 || b.uri)) throw new Error('only a single embedded buffer is supported');

// ---- re-encode images -------------------------------------------------------------------------
const replaced = new Map(); // bufferView index -> new bytes
for (const [i, image] of (json.images ?? []).entries()) {
  if (image.bufferView === undefined) continue;
  const view = json.bufferViews[image.bufferView];
  const bytes = bin.subarray(view.byteOffset ?? 0, (view.byteOffset ?? 0) + view.byteLength);
  const meta = await sharp(bytes).metadata();
  if (meta.width <= size && meta.height <= size && image.mimeType === mime) {
    console.log(`image ${i}: ${meta.width}×${meta.height} ${image.mimeType} already small, kept`);
    continue;
  }
  // Square atlases stay square (UVs are normalised, so a uniform resize keeps the mapping).
  let pipeline = sharp(bytes).resize({ width: Math.min(size, meta.width), height: Math.min(size, meta.height), fit: 'fill' });
  // The card material is opaque, so the atlas alpha channel is never sampled; JPEG drops it.
  pipeline = format === 'png' ? pipeline.png({ compressionLevel: 9 }) : pipeline.removeAlpha().jpeg({ quality, mozjpeg: true });
  const out = await pipeline.toBuffer();
  const outMeta = await sharp(out).metadata();
  console.log(
    `image ${i}: ${meta.width}×${meta.height} ${image.mimeType} ${(bytes.length / 1024).toFixed(0)} KB -> ` +
      `${outMeta.width}×${outMeta.height} ${mime} ${(out.length / 1024).toFixed(0)} KB`
  );
  replaced.set(image.bufferView, out);
  image.mimeType = mime;
}

if (replaced.size === 0) {
  console.log('nothing to shrink');
  process.exit(0);
}

// ---- rebuild BIN with fresh, 4-byte-aligned buffer views ------------------------------------------
const parts = [];
let cursor = 0;
for (const [i, view] of json.bufferViews.entries()) {
  const start = view.byteOffset ?? 0;
  const bytes = replaced.get(i) ?? bin.subarray(start, start + view.byteLength);
  const padded = align4(cursor);
  if (padded > cursor) parts.push(Buffer.alloc(padded - cursor));
  view.byteOffset = padded;
  view.byteLength = bytes.length;
  parts.push(bytes);
  cursor = padded + bytes.length;
}
const binLength = align4(cursor);
if (binLength > cursor) parts.push(Buffer.alloc(binLength - cursor));
json.buffers[0].byteLength = binLength;
const newBin = Buffer.concat(parts, binLength);

// ---- write GLB ----------------------------------------------------------------------------
let jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
const jsonLength = align4(jsonBytes.length);
jsonBytes = Buffer.concat([jsonBytes, Buffer.alloc(jsonLength - jsonBytes.length, 0x20)]); // pad JSON with spaces

const total = 12 + 8 + jsonLength + 8 + binLength;
const header = Buffer.alloc(12);
header.writeUInt32LE(GLB_MAGIC, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(total, 8);
const chunkHead = (length, type) => {
  const b = Buffer.alloc(8);
  b.writeUInt32LE(length, 0);
  b.writeUInt32LE(type, 4);
  return b;
};

writeFileSync(output, Buffer.concat([header, chunkHead(jsonLength, CHUNK_JSON), jsonBytes, chunkHead(binLength, CHUNK_BIN), newBin]));
console.log(`${input} ${(glb.length / 1024).toFixed(0)} KB -> ${output} ${(total / 1024).toFixed(0)} KB`);
