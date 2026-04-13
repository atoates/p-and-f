"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  /**
   * Fired when the user picks an actual place from the dropdown (as
   * opposed to free-typing). Gives you the formatted address + lat/lng
   * so you can, for example, geocode-free fill venue lookups.
   */
  onPlaceSelected?: (place: {
    formattedAddress: string;
    lat: number;
    lng: number;
  }) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * ISO 3166-1 alpha-2 country code(s) to restrict results to. Defaults
   * to UK-only since Petal & Prosper is a UK florist business.
   */
  countries?: string[];
}

/**
 * Input with Google Places Autocomplete bound to it. Falls back to a
 * plain input if the Maps script fails to load (missing key, offline,
 * rejected domain) so the user can still type an address manually.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Start typing an address...",
  className = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B4332] focus:border-transparent",
  id,
  name,
  required,
  disabled,
  countries = ["gb"],
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !inputRef.current) return;
        if (!google.maps.places) return; // Places library failed to load
        const ac = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry"],
          componentRestrictions: { country: countries },
          types: ["address"],
        });
        ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const addr = place.formatted_address;
          if (addr) {
            onChange(addr);
            if (place.geometry?.location && onPlaceSelected) {
              onPlaceSelected({
                formattedAddress: addr,
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              });
            }
          }
        });
        autocompleteRef.current = ac;
        setReady(true);
      })
      .catch(() => {
        // Silently degrade to a plain text input if the Maps script
        // can't load. The user can still type the address by hand.
      });

    return () => {
      cancelled = true;
      if (autocompleteRef.current) {
        google.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
    // Countries change is rare; avoid re-binding autocomplete on every
    // keystroke of the parent's controlled value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <input
      ref={inputRef}
      id={id}
      name={name}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      required={required}
      disabled={disabled}
      autoComplete={ready ? "off" : undefined}
    />
  );
}
