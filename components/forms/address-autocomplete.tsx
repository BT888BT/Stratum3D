"use client";

import { useEffect, useRef, useState } from "react";

export type ParsedAddress = {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  formatted: string;
};

interface Props {
  onSelect: (address: ParsedAddress) => void;
  error?: string;
}

declare global {
  interface Window {
    google: typeof google;
    initGooglePlaces?: () => void;
  }
}

function parseAddressComponents(
  components: google.maps.GeocoderAddressComponent[],
  formattedAddress: string
): ParsedAddress {
  const get = (type: string) =>
    components.find((c) => c.types.includes(type))?.long_name ?? "";
  const getShort = (type: string) =>
    components.find((c) => c.types.includes(type))?.short_name ?? "";

  const streetNumber = get("street_number");
  const route = get("route");
  const subpremise = get("subpremise");

  const line1 = [streetNumber, route].filter(Boolean).join(" ");
  const line2 = subpremise;
  const city =
    get("locality") || get("sublocality") || get("postal_town");
  const state = getShort("administrative_area_level_1");
  const postcode = get("postal_code");
  const country = getShort("country");

  return { line1, line2, city, state, postcode, country, formatted: formattedAddress };
}

export default function AddressAutocomplete({ onSelect, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return;

    // Don't load twice
    if (window.google?.maps?.places) {
      setLoaded(true);
      return;
    }

    window.initGooglePlaces = () => setLoaded(true);

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      delete window.initGooglePlaces;
    };
  }, []);

  useEffect(() => {
    if (!loaded || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: "au" },
        types: ["address"],
        fields: ["address_components", "formatted_address"],
      }
    );

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current!.getPlace();
      if (!place.address_components || !place.formatted_address) return;

      const parsed = parseAddressComponents(
        place.address_components,
        place.formatted_address
      );

      // Reject if outside AU (shouldn't happen with restriction but safety check)
      if (parsed.country !== "AU") {
        setValue("");
        setSelected(false);
        return;
      }

      setValue(place.formatted_address);
      setSelected(true);
      onSelect(parsed);
    });
  }, [loaded, onSelect]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
        Shipping address <span style={{ color: "var(--accent)" }}>*</span>
        <span style={{ color: "var(--muted)", marginLeft: 8, fontSize: 11 }}>Australia only</span>
      </span>

      <div style={{ position: "relative" }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (selected) setSelected(false);
          }}
          placeholder={loaded ? "Start typing your address..." : "Loading address search..."}
          disabled={!loaded}
          className="input-field"
          style={{
            paddingRight: 36,
            borderColor: selected ? "var(--green)" : error ? "var(--red)" : undefined
          }}
          autoComplete="off"
        />
        {selected && (
          <span style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            color: "var(--green)", fontSize: 16, pointerEvents: "none"
          }}>✓</span>
        )}
      </div>

      {selected && value && (
        <p style={{ fontSize: 11, color: "var(--green)" }}>
          Address verified ✓
        </p>
      )}
      {error && (
        <p style={{ fontSize: 11, color: "var(--red)" }}>{error}</p>
      )}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <p style={{ fontSize: 11, color: "var(--amber)" }}>
          ⚠ Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable address autocomplete
        </p>
      )}
    </div>
  );
}
