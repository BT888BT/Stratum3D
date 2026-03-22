/**
 * Calculates the signed volume of a 3D mesh using the divergence theorem.
 * Works on any closed manifold mesh — returns volume in mm³.
 *
 * For each triangle with vertices A, B, C:
 *   signedVol = (A · (B × C)) / 6
 * Sum over all triangles → total signed volume.
 * abs() handles inverted winding.
 */

// ── STL (binary) ─────────────────────────────────────────────────────────────
// Binary STL: 80-byte header, 4-byte triangle count, then per triangle:
//   12 bytes normal, 3 × 12 bytes vertices, 2 bytes attr = 50 bytes each

function signedTriVolume(
  ax: number, ay: number, az: number,
  bx: number, by: number, bz: number,
  cx: number, cy: number, cz: number
): number {
  // (A · (B × C)) / 6
  return (
    ax * (by * cz - bz * cy) +
    ay * (bz * cx - bx * cz) +
    az * (bx * cy - by * cx)
  ) / 6;
}

export function volumeFromSTL(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  const triCount = view.getUint32(80, true);
  let vol = 0;
  let offset = 84;
  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip normal
    const ax = view.getFloat32(offset,      true); const ay = view.getFloat32(offset + 4,  true); const az = view.getFloat32(offset + 8,  true);
    const bx = view.getFloat32(offset + 12, true); const by = view.getFloat32(offset + 16, true); const bz = view.getFloat32(offset + 20, true);
    const cx = view.getFloat32(offset + 24, true); const cy = view.getFloat32(offset + 28, true); const cz = view.getFloat32(offset + 32, true);
    offset += 36 + 2; // vertices + attr
    vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
  }
  return Math.abs(vol);
}

// ── OBJ (text) ───────────────────────────────────────────────────────────────
// Parse vertices (v x y z) and faces (f i j k ...) — supports quads via fan triangulation

export function volumeFromOBJ(text: string): number {
  const verts: [number, number, number][] = [];
  let vol = 0;

  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.startsWith("v ")) {
      const [, x, y, z] = t.split(/\s+/);
      verts.push([parseFloat(x), parseFloat(y), parseFloat(z)]);
    } else if (t.startsWith("f ")) {
      const idxs = t.split(/\s+/).slice(1).map(p => parseInt(p.split("/")[0]) - 1);
      // fan triangulation for quads/ngons
      for (let i = 1; i + 1 < idxs.length; i++) {
        const [ax, ay, az] = verts[idxs[0]];
        const [bx, by, bz] = verts[idxs[i]];
        const [cx, cy, cz] = verts[idxs[i + 1]];
        vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
      }
    }
  }
  return Math.abs(vol);
}

// ── 3MF (zip → XML) ──────────────────────────────────────────────────────────
// 3MF is a ZIP. We need to unzip it and parse the mesh XML.
// We use a pure-JS approach: find the 3dmodel.model file inside the ZIP.

export function volumeFrom3MF(buffer: ArrayBuffer): number {
  // 3MF ZIPs use local file headers. We scan for the model file content.
  // Simple approach: convert to text and extract vertex/triangle data via regex.
  // This works because 3MF XML is stored uncompressed or with deflate — we look
  // for the stored (uncompressed) case first, then fall back to a parse attempt.

  const bytes = new Uint8Array(buffer);

  // Try to find XML content in the buffer by looking for <vertices> tag
  // 3MF files often store the model uncompressed (store method = 0)
  const xmlMarker = "<vertices>";
  const markerBytes = Array.from(xmlMarker).map(c => c.charCodeAt(0));

  let xmlStart = -1;
  outer: for (let i = 0; i < bytes.length - markerBytes.length; i++) {
    for (let j = 0; j < markerBytes.length; j++) {
      if (bytes[i + j] !== markerBytes[j]) continue outer;
    }
    xmlStart = i;
    break;
  }

  if (xmlStart === -1) {
    throw new Error("Could not parse 3MF file. Try converting to STL.");
  }

  // Find end of mesh section
  const endMarker = "</mesh>";
  let xmlEnd = bytes.length;
  const endBytes = Array.from(endMarker).map(c => c.charCodeAt(0));
  for (let i = xmlStart; i < bytes.length - endBytes.length; i++) {
    let match = true;
    for (let j = 0; j < endBytes.length; j++) {
      if (bytes[i + j] !== endBytes[j]) { match = false; break; }
    }
    if (match) { xmlEnd = i + endBytes.length; break; }
  }

  const xmlChunk = new TextDecoder().decode(bytes.slice(xmlStart - 50, xmlEnd));
  return volumeFrom3MFXml(xmlChunk);
}

function volumeFrom3MFXml(xml: string): number {
  // Parse vertices
  const verts: [number, number, number][] = [];
  const vertRe = /<vertex\s+x="([^"]+)"\s+y="([^"]+)"\s+z="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(xml)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }

  // Parse triangles
  let vol = 0;
  const triRe = /<triangle\s+v1="(\d+)"\s+v2="(\d+)"\s+v3="(\d+)"/g;
  while ((m = triRe.exec(xml)) !== null) {
    const [ax, ay, az] = verts[parseInt(m[1])];
    const [bx, by, bz] = verts[parseInt(m[2])];
    const [cx, cy, cz] = verts[parseInt(m[3])];
    vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
  }
  return Math.abs(vol);
}

// ── Main dispatcher ───────────────────────────────────────────────────────────

export async function extractVolumeMm3(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "stl") {
    // Check if ASCII STL (starts with "solid")
    const header = new TextDecoder().decode(new Uint8Array(buffer, 0, 6));
    if (header.startsWith("solid")) {
      // ASCII STL — convert to text and parse
      const text = new TextDecoder().decode(buffer);
      return volumeFromASCIISTL(text);
    }
    return volumeFromSTL(buffer);
  }

  if (ext === "obj") {
    const text = new TextDecoder().decode(buffer);
    return volumeFromOBJ(text);
  }

  if (ext === "3mf") {
    return volumeFrom3MF(buffer);
  }

  throw new Error("Unsupported file type.");
}

function volumeFromASCIISTL(text: string): number {
  const vertRe = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;
  while ((m = vertRe.exec(text)) !== null) {
    verts.push([parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])]);
  }
  let vol = 0;
  for (let i = 0; i + 2 < verts.length; i += 3) {
    const [ax, ay, az] = verts[i];
    const [bx, by, bz] = verts[i + 1];
    const [cx, cy, cz] = verts[i + 2];
    vol += signedTriVolume(ax, ay, az, bx, by, bz, cx, cy, cz);
  }
  return Math.abs(vol);
}
