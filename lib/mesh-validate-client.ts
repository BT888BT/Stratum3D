/**
 * Mesh validation warnings — browser-side, STL only.
 *
 * Completely separate from volume/height/SA calculation.
 * Never throws. Never modifies calculation results.
 * Returns advisory warnings shown to the customer before they submit.
 *
 * Checks performed (binary STL only — ASCII gets Z-float check only):
 *   1. Inverted normals   — signed volume sum is negative
 *   2. Floating above Z=0 — minZ > 1mm (height surcharge tier may be wrong)
 *   3. Open mesh          — any edge shared by ≠ 2 triangles (non-watertight)
 *   4. Multiple bodies    — disconnected shells (union-find on vertices)
 *
 * For files > MAX_TRIS_FULL_ANALYSIS triangles we skip 3 & 4 to avoid
 * freezing the browser tab — only 1 & 2 are checked.
 */

export type MeshWarningCode = "inverted_normals" | "floating_z" | "open_mesh" | "multiple_bodies";
export type MeshWarningSeverity = "warning" | "error";

export type MeshWarning = {
  code: MeshWarningCode;
  severity: MeshWarningSeverity;
  message: string;
};

const MAX_TRIS_FULL_ANALYSIS = 30_000;

// ── Vertex key (rounds to 0.001 mm to handle float imprecision) ───────────────
function vkey(x: number, y: number, z: number): string {
  return `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
}

// ── Union-Find for connected components ───────────────────────────────────────
class UnionFind {
  private parent: number[];
  constructor(n: number) { this.parent = Array.from({ length: n }, (_, i) => i); }
  find(i: number): number {
    if (this.parent[i] !== i) this.parent[i] = this.find(this.parent[i]);
    return this.parent[i];
  }
  union(a: number, b: number) {
    const ra = this.find(a), rb = this.find(b);
    if (ra !== rb) this.parent[ra] = rb;
  }
  countRoots(): number {
    const roots = new Set<number>();
    for (let i = 0; i < this.parent.length; i++) roots.add(this.find(i));
    return roots.size;
  }
}

// ── Binary STL ────────────────────────────────────────────────────────────────
function validateBinarySTL(ab: ArrayBuffer): MeshWarning[] {
  const warnings: MeshWarning[] = [];
  const view = new DataView(ab);
  const triCount = view.getUint32(80, true);

  if (triCount === 0) return warnings; // empty — caught by volume check already

  const fullAnalysis = triCount <= MAX_TRIS_FULL_ANALYSIS;

  // For manifold / body checks
  const edgeCount = fullAnalysis ? new Map<string, number>() : null;
  const vertexIndex = fullAnalysis ? new Map<string, number>() : null;
  const uf = fullAnalysis ? new UnionFind(triCount * 3) : null; // upper bound on vertices
  let nextVertexId = 0;

  function getVertexId(key: string): number {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let id = vertexIndex!.get(key);
    if (id === undefined) { id = nextVertexId++; vertexIndex!.set(key, id); }
    return id;
  }

  let signedSum = 0;
  let minZ = Infinity;
  let offset = 84;

  for (let i = 0; i < triCount; i++) {
    offset += 12; // skip stored normal
    const ax = view.getFloat32(offset,      true), ay = view.getFloat32(offset + 4,  true), az = view.getFloat32(offset + 8,  true);
    const bx = view.getFloat32(offset + 12, true), by = view.getFloat32(offset + 16, true), bz = view.getFloat32(offset + 20, true);
    const cx = view.getFloat32(offset + 24, true), cy = view.getFloat32(offset + 28, true), cz = view.getFloat32(offset + 32, true);
    offset += 36 + 2;

    // Track min Z across all vertices
    if (az < minZ) minZ = az;
    if (bz < minZ) minZ = bz;
    if (cz < minZ) minZ = cz;

    // Signed volume sum (direction of normals)
    signedSum +=
      ax * (by * cz - bz * cy) +
      ay * (bz * cx - bx * cz) +
      az * (bx * cy - by * cx);

    if (!fullAnalysis || !edgeCount || !vertexIndex || !uf) continue;

    const ka = vkey(ax, ay, az);
    const kb = vkey(bx, by, bz);
    const kc = vkey(cx, cy, cz);

    // Edge manifold check — each edge must appear exactly twice
    const edges = [
      ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`,
      kb < kc ? `${kb}|${kc}` : `${kc}|${kb}`,
      kc < ka ? `${kc}|${ka}` : `${ka}|${kc}`,
    ];
    for (const e of edges) edgeCount.set(e, (edgeCount.get(e) ?? 0) + 1);

    // Union-find for connected components
    const ia = getVertexId(ka);
    const ib = getVertexId(kb);
    const ic = getVertexId(kc);
    uf.union(ia, ib);
    uf.union(ib, ic);
  }

  // ── 1. Inverted normals ────────────────────────────────────────────────────
  if (signedSum < 0) {
    warnings.push({
      code: "inverted_normals",
      severity: "warning",
      message:
        "Mesh normals appear to be inverted (inside-out). Volume estimate may be inaccurate. " +
        "In your CAD tool, flip normals or re-export the mesh.",
    });
  }

  // ── 2. Floating above Z=0 ─────────────────────────────────────────────────
  if (isFinite(minZ) && minZ > 1.0) {
    warnings.push({
      code: "floating_z",
      severity: "warning",
      message:
        `Model origin is ${minZ.toFixed(1)} mm above Z=0. ` +
        "The height surcharge tier is calculated from bounding box extent and may be correct, " +
        "but grounding your model to Z=0 before export is best practice.",
    });
  }

  if (!fullAnalysis) return warnings; // large file — skip manifold checks

  // ── 3. Open mesh (non-watertight) ─────────────────────────────────────────
  if (edgeCount) {
    let openEdges = 0;
    for (const count of edgeCount.values()) {
      if (count !== 2) openEdges++;
    }
    if (openEdges > 0) {
      warnings.push({
        code: "open_mesh",
        severity: "error",
        message:
          `Mesh has ${openEdges.toLocaleString()} open edge${openEdges !== 1 ? "s" : ""} — it is not a closed solid. ` +
          "Volume calculation will be inaccurate. Repair the mesh in Meshmixer, Netfabb, PrusaSlicer " +
          "(Mesh → Fix), or your CAD tool before uploading.",
      });
    }
  }

  // ── 4. Multiple separate bodies ───────────────────────────────────────────
  if (uf && nextVertexId > 0) {
    // Rebuild union-find scoped to actual vertex count (not the triCount*3 upper bound)
    const scopedUf = new UnionFind(nextVertexId);
    // We need to re-union based on vertexIndex — re-derive from edge map is simplest
    // Re-read triangles just for union operations (fast — no map lookups needed again)
    if (vertexIndex) {
      let off2 = 84;
      for (let i = 0; i < triCount; i++) {
        off2 += 12;
        const ax = view.getFloat32(off2,      true), ay = view.getFloat32(off2 + 4,  true), az = view.getFloat32(off2 + 8,  true);
        const bx = view.getFloat32(off2 + 12, true), by = view.getFloat32(off2 + 16, true), bz = view.getFloat32(off2 + 20, true);
        const cx = view.getFloat32(off2 + 24, true), cy = view.getFloat32(off2 + 28, true), cz = view.getFloat32(off2 + 32, true);
        off2 += 36 + 2;
        const ia = vertexIndex.get(vkey(ax, ay, az))!;
        const ib = vertexIndex.get(vkey(bx, by, bz))!;
        const ic = vertexIndex.get(vkey(cx, cy, cz))!;
        scopedUf.union(ia, ib);
        scopedUf.union(ib, ic);
      }
    }
    const bodyCount = scopedUf.countRoots();
    if (bodyCount > 1) {
      warnings.push({
        code: "multiple_bodies",
        severity: "warning",
        message:
          `File contains ${bodyCount} separate bodies. ` +
          "Volume is the sum of all bodies, which is correct if they don't overlap. " +
          "If any bodies intersect each other, volume will be underestimated and pricing may be inaccurate. " +
          "Boolean-union overlapping parts in your CAD tool before exporting.",
      });
    }
  }

  return warnings;
}

// ── ASCII STL (limited — just Z-float and normal direction) ──────────────────
function validateASCIISTL(text: string): MeshWarning[] {
  const warnings: MeshWarning[] = [];
  const re = /vertex\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)\s+([\d.eE+\-]+)/g;
  let minZ = Infinity;
  let signedSum = 0;
  const verts: [number, number, number][] = [];
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    const z = parseFloat(m[3]);
    if (z < minZ) minZ = z;
    verts.push([parseFloat(m[1]), parseFloat(m[2]), z]);
  }

  for (let i = 0; i + 2 < verts.length; i += 3) {
    const [ax, ay, az] = verts[i], [bx, by, bz] = verts[i + 1], [cx, cy, cz] = verts[i + 2];
    signedSum += ax * (by * cz - bz * cy) + ay * (bz * cx - bx * cz) + az * (bx * cy - by * cx);
  }

  if (signedSum < 0) {
    warnings.push({
      code: "inverted_normals",
      severity: "warning",
      message: "Mesh normals appear to be inverted. Volume estimate may be inaccurate. Re-export with outward-facing normals.",
    });
  }

  if (isFinite(minZ) && minZ > 1.0) {
    warnings.push({
      code: "floating_z",
      severity: "warning",
      message: `Model is floating ${minZ.toFixed(1)} mm above Z=0. Grounding to Z=0 before export is best practice.`,
    });
  }

  return warnings;
}

// ── Public entry point ────────────────────────────────────────────────────────
/**
 * Validate an STL ArrayBuffer. Never throws — returns [] on any internal error.
 * Call this in parallel with your volume calculation; do not let it affect pricing.
 */
export function validateSTLArrayBuffer(ab: ArrayBuffer): MeshWarning[] {
  try {
    const view = new DataView(ab);
    const triCount = view.getUint32(80, true);
    const expectedBinarySize = 84 + triCount * 50;
    const isBinary = Math.abs(ab.byteLength - expectedBinarySize) < 100;

    return isBinary
      ? validateBinarySTL(ab)
      : validateASCIISTL(new TextDecoder().decode(ab));
  } catch {
    return []; // validation never blocks the upload
  }
}
