/**
 * Browser-compatible STL volume calculation.
 * Uses ArrayBuffer directly — no Node Buffer dependency.
 *
 * Divergence theorem: for each triangle (A, B, C):
 *   signedVol = (A · (B × C)) / 6
 * Sum and abs() → total solid volume in mm³.
 */

function signedTriVolume(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number
): number {
  return (
    ax * (by * cz - bz * cy) +
    ay * (bz * cx - bx * cz) +
    az * (bx * cy - by * cx)
  ) / 6;
}

export type ClientMeshData = { volumeMm3: number; widthMm: number; depthMm: number; heightMm: number };

// ── Binary STL ───────────────────────────────────────────────────────────────
function meshDataFromBinarySTL(ab: ArrayBuffer): ClientMeshData {
  const view = new DataView(ab);
  const triCount = view.getUint32(80, true);
  let vol = 0;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  let offset = 84;
  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip normal
    const ax = view.getFloat32(offset,      true); const ay = view.getFloat32(offset + 4,  true); const az = view.getFloat32(offset + 8,  true);
    const bx = view.getFloat32(offset + 12, true); const by = view.getFloat32(offset + 16, true); const bz = view.getFloat32(offset + 20, true);
    const cx = view.getFloat32(offset + 24, true); const cy = view.getFloat32(offset + 28, true); const cz = view.getFloat32(offset + 32, true);
    offset += 36 + 2;
    vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
    if (ax < minX) minX = ax; if (ax > maxX) maxX = ax;
    if (bx < minX) minX = bx; if (bx > maxX) maxX = bx;
    if (cx < minX) minX = cx; if (cx > maxX) maxX = cx;
    if (ay < minY) minY = ay; if (ay > maxY) maxY = ay;
    if (by < minY) minY = by; if (by > maxY) maxY = by;
    if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
    if (az < minZ) minZ = az; if (az > maxZ) maxZ = az;
    if (bz < minZ) minZ = bz; if (bz > maxZ) maxZ = bz;
    if (cz < minZ) minZ = cz; if (cz > maxZ) maxZ = cz;
  }
  return {
    volumeMm3: Math.abs(vol),
    widthMm: isFinite(maxX) ? maxX - minX : 0,
    depthMm: isFinite(maxY) ? maxY - minY : 0,
    heightMm: isFinite(maxZ) ? maxZ - minZ : 0,
  };
}

function volumeFromBinarySTL(ab: ArrayBuffer): number {
  return meshDataFromBinarySTL(ab).volumeMm3;
}

// ── ASCII STL ────────────────────────────────────────────────────────────────
function meshDataFromASCIISTL(text: string): ClientMeshData {
  const re = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  while ((m = re.exec(text)) !== null) {
    const x = parseFloat(m[1]), y = parseFloat(m[2]), z = parseFloat(m[3]);
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
    if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    verts.push([x, y, z]);
  }
  let vol = 0;
  for (let i = 0; i + 2 < verts.length; i += 3) {
    const [ax, ay, az] = verts[i];
    const [bx, by, bz] = verts[i + 1];
    const [cx, cy, cz] = verts[i + 2];
    vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
  }
  return {
    volumeMm3: Math.abs(vol),
    widthMm: isFinite(maxX) ? maxX - minX : 0,
    depthMm: isFinite(maxY) ? maxY - minY : 0,
    heightMm: isFinite(maxZ) ? maxZ - minZ : 0,
  };
}

function volumeFromASCIISTL(text: string): number {
  return meshDataFromASCIISTL(text).volumeMm3;
}

/**
 * Calculate volume from an STL file's ArrayBuffer.
 * Works in the browser — no Node dependencies.
 */
export function extractVolumeMm3FromArrayBuffer(ab: ArrayBuffer, filename: string): number {
  return extractMeshDataFromArrayBuffer(ab, filename).volumeMm3;
}

/**
 * Calculate volume + bounding box dimensions from an STL ArrayBuffer.
 * Works in the browser — no Node dependencies.
 */
export function extractMeshDataFromArrayBuffer(ab: ArrayBuffer, filename: string): ClientMeshData {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (ext === "stl") {
    const view = new DataView(ab);
    const triCount = view.getUint32(80, true);
    const expectedBinarySize = 84 + triCount * 50;
    const isBinary = Math.abs(ab.byteLength - expectedBinarySize) < 100;

    return isBinary
      ? meshDataFromBinarySTL(ab)
      : meshDataFromASCIISTL(new TextDecoder().decode(ab));
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

/**
 * Calculate volume from a File object (async — reads file first).
 */
export async function extractVolumeMm3FromFile(file: File): Promise<number> {
  const ab = await file.arrayBuffer();
  return extractVolumeMm3FromArrayBuffer(ab, file.name);
}
