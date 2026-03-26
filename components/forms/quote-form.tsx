"use client";

import { useState, useCallback, useEffect } from "react";
import { formatAud } from "@/lib/utils";
import AddressAutocomplete, { type ParsedAddress } from "@/components/forms/address-autocomplete";

const LAYER_OPTIONS = [
  { value: 0.1,  label: "0.10 mm — Fine detail" },
  { value: 0.15, label: "0.15 mm — High quality" },
  { value: 0.2,  label: "0.20 mm — Standard" },
  { value: 0.3,  label: "0.30 mm — Draft / fast" },
];
const INFILL_OPTIONS = [10, 15, 20, 30, 40, 50, 75, 100];

type Colour = { id: string; name: string; hex: string; available: boolean };

type FileItem = {
  id: string;
  file: File;
  material: "PLA" | "PETG" | "ABS";
  colour: string;
  quantity: number;
  layerHeightMm: number;
  infillPercent: number;
};

type ItemQuoteResult = {
  filename: string;
  estimatedVolumeCm3: number;
  estimatedWeightGrams: number;
  estimatedPrintTimeMinutes: number;
  materialCostCents: number;
  machineCostCents: number;
  itemTotalCents: number;
};

type QuoteApiResponse = {
  orderId: string;
  items: ItemQuoteResult[];
  subtotalCents: number;
  shippingCents: number;
  gstCents: number;
  totalCents: number;
};

function makeId() { return Math.random().toString(36).slice(2); }

export default function QuoteForm() {
  const [colours, setColours] = useState<Colour[]>([]);
  const [items, setItems] = useState<FileItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<ParsedAddress | null>(null);
  const [addressError, setAddressError] = useState("");
  const [quote, setQuote] = useState<QuoteApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Load available colours
  useEffect(() => {
    fetch("/api/colours")
      .then(r => r.json())
      .then((data: Colour[]) => setColours(data.filter(c => c.available)))
      .catch(() => {});
  }, []);

  const handleAddressSelect = useCallback((a: ParsedAddress) => {
    setAddress(a); setAddressError("");
  }, []);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const defaultColour = colours.find(c => c.available)?.name ?? "Black";
    const toAdd: FileItem[] = Array.from(newFiles)
      .filter(f => f.name.toLowerCase().endsWith(".stl"))
      .map(f => ({
        id: makeId(), file: f,
        material: "PLA", colour: defaultColour,
        quantity: 1, layerHeightMm: 0.2, infillPercent: 20,
      }));
    setItems(prev => [...prev, ...toAdd]);
  }

  function removeItem(id: string) { setItems(prev => prev.filter(x => x.id !== id)); }

  function updateItem(id: string, patch: Partial<FileItem>) {
    setItems(prev => prev.map(x => x.id === id ? { ...x, ...patch } : x));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setFieldErrors({});

    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = "Name is required.";
    if (!email.trim() || !email.includes("@")) errs.email = "Valid email required.";
    if (!address) setAddressError("Please select a verified Australian address.");
    if (items.length === 0) errs.files = "Please upload at least one STL file.";
    if (Object.keys(errs).length || !address) { setFieldErrors(errs); return; }

    try {
      setLoadingQuote(true);
      const formData = new FormData();
      formData.append("customerName", customerName);
      formData.append("email", email);
      formData.append("shippingAddressLine1", address!.line1);
      formData.append("shippingAddressLine2", address!.line2 ?? "");
      formData.append("shippingCity", address!.city);
      formData.append("shippingState", address!.state);
      formData.append("shippingPostcode", address!.postcode);
      formData.append("shippingCountry", address!.country);

      items.forEach(item => formData.append("files", item.file));
      formData.append("itemSettings", JSON.stringify(items.map(item => ({
        material: item.material,
        colour: item.colour,
        quantity: item.quantity,
        layerHeightMm: item.layerHeightMm,
        infillPercent: item.infillPercent,
      }))));

      const res = await fetch("/api/quote", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create quote.");
      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote.");
    } finally {
      setLoadingQuote(false);
    }
  }

  async function startCheckout() {
    if (!quote) return;
    try {
      setLoadingCheckout(true);
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: quote.orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start checkout.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start checkout.");
    } finally {
      setLoadingCheckout(false);
    }
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

      {/* ── Left: Form ── */}
      <form onSubmit={handleSubmit} className="card-lg" style={{ display: "flex", flexDirection: "column", gap: 28 }}>

        {/* Contact */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Contact Details</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Field label="Full name" error={fieldErrors.customerName}>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className="input-field" placeholder="Jane Smith" />
            </Field>
            <Field label="Email" error={fieldErrors.email}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="jane@example.com" />
            </Field>
          </div>
        </div>

        <hr className="divider" />

        {/* Address */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>Shipping Address</p>
          <AddressAutocomplete onSelect={handleAddressSelect} error={addressError} />
          {address && (
            <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(0,229,160,0.05)", border: "1px solid rgba(0,229,160,0.2)", borderRadius: 8, fontSize: 13, lineHeight: 1.6 }}>
              <p style={{ color: "var(--text)" }}>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
              <p style={{ color: "var(--text-dim)" }}>{address.city} {address.state} {address.postcode}</p>
            </div>
          )}
        </div>

        <hr className="divider" />

        {/* Files */}
        <div>
          <p className="eyebrow" style={{ marginBottom: 16 }}>3D Model Files</p>

          {/* Drop zone */}
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 8, padding: "28px 20px",
            border: "2px dashed var(--border-hi)", borderRadius: 10, cursor: "pointer",
            background: "var(--bg2)", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border-hi)")}
          >
            <span style={{ fontSize: 28, opacity: 0.4 }}>⬆</span>
            <span style={{ fontSize: 13, color: "var(--text-dim)" }}>Click or drop STL files here</span>
            <span style={{ fontSize: 11, color: "var(--muted)" }}>STL only — max 50 MB per file — multiple files supported</span>
            <input type="file" accept=".stl" multiple onChange={e => addFiles(e.target.files)} style={{ display: "none" }} />
          </label>

          {fieldErrors.files && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 6 }}>{fieldErrors.files}</p>}

          {/* File cards */}
          {items.length > 0 && (
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  border: "1px solid var(--border-hi)", borderRadius: 10,
                  background: "var(--bg2)", overflow: "hidden"
                }}>
                  {/* File header */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", borderBottom: "1px solid var(--border)",
                    background: "var(--surface)"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="font-mono" style={{ fontSize: 11, color: "var(--accent)", opacity: 0.7 }}>#{idx + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.file.name}
                      </span>
                      <span className="font-mono" style={{ fontSize: 10, color: "var(--muted)" }}>
                        {(item.file.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)}
                      style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 4px" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "var(--red)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}
                    >×</button>
                  </div>

                  {/* Per-item settings */}
                  <div style={{ padding: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 80px 80px", gap: 12 }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Material</span>
                      <select value={item.material} onChange={e => updateItem(item.id, { material: e.target.value as "PLA" | "PETG" | "ABS" })} className="input-field" style={{ fontSize: 13 }}>
                        <option value="PLA">PLA</option>
                        <option value="PETG">PETG</option>
                        <option value="ABS">ABS</option>
                      </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Colour</span>
                      <select value={item.colour} onChange={e => updateItem(item.id, { colour: e.target.value })} className="input-field" style={{ fontSize: 13 }}>
                        {colours.map(c => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                        {colours.length === 0 && <option value="Black">Black</option>}
                      </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Layer height</span>
                      <select value={item.layerHeightMm} onChange={e => updateItem(item.id, { layerHeightMm: parseFloat(e.target.value) })} className="input-field" style={{ fontSize: 13 }}>
                        {LAYER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Infill %</span>
                      <select value={item.infillPercent} onChange={e => updateItem(item.id, { infillPercent: parseInt(e.target.value) })} className="input-field" style={{ fontSize: 13 }}>
                        {INFILL_OPTIONS.map(v => <option key={v} value={v}>{v}%</option>)}
                      </select>
                    </label>

                    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Qty</span>
                      <input type="number" min={1} max={100} value={item.quantity}
                        onChange={e => updateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                        className="input-field" style={{ fontSize: 13 }} />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="error-box">{error}</div>}

        <button type="submit" disabled={loadingQuote || items.length === 0} className="btn-primary" style={{ width: "100%" }}>
          {loadingQuote ? "Calculating..." : `Calculate Quote${items.length > 1 ? ` (${items.length} files)` : " →"}`}
        </button>
      </form>

      {/* ── Right: Summary ── */}
      <div style={{ position: "sticky", top: 80 }}>
        <div className="card-accent">
          <p className="eyebrow" style={{ marginBottom: 20 }}>Quote Summary</p>

          {!quote ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>◈</div>
              <p style={{ fontSize: 13, color: "var(--text-dim)" }}>
                Upload files and hit<br /><em>Calculate Quote</em> to see pricing.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Per-item breakdown */}
              {quote.items.map((item, i) => (
                <div key={i} style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.filename}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <SpecRow label="Volume" value={`${item.estimatedVolumeCm3} cm³`} />
                    <SpecRow label="Weight" value={`${item.estimatedWeightGrams} g`} />
                    <SpecRow label="Print time" value={`${item.estimatedPrintTimeMinutes} min`} />
                    <SpecRow label="Item total" value={formatAud(item.itemTotalCents)} highlight />
                  </div>
                </div>
              ))}

              <hr className="divider" />

              {/* Order total */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <SummaryRow label="Subtotal" value={formatAud(quote.subtotalCents)} />
                <SummaryRow label="GST (10%)" value={formatAud(quote.gstCents)} />
                <SummaryRow label="Shipping" value={formatAud(quote.shippingCents)} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(0,212,255,0.2)" }}>
                <span className="font-display" style={{ fontSize: 15, fontWeight: 600 }}>Total (AUD)</span>
                <span className="font-display" style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)" }}>{formatAud(quote.totalCents)}</span>
              </div>

              <button onClick={startCheckout} disabled={loadingCheckout} className="btn-primary" style={{ width: "100%" }}>
                {loadingCheckout ? "Redirecting..." : "Proceed to Payment →"}
              </button>
              <p style={{ fontSize: 11, color: "var(--muted)", textAlign: "center" }}>Secure checkout via Stripe · GST included</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{label}</span>
      {children}
      {error && <span style={{ fontSize: 11, color: "var(--red)" }}>{error}</span>}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "var(--text-dim)" }}>{label}</span>
      <span style={{ fontSize: 13 }}>{value}</span>
    </div>
  );
}

function SpecRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span className="font-mono" style={{ fontSize: 11, color: highlight ? "var(--accent)" : "var(--text-dim)" }}>{value}</span>
    </div>
  );
}
