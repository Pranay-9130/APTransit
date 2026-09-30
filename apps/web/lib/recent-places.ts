import { PlaceDto } from "@aptransit/shared";
import { z } from "zod";

// Recent From and To choices on this device (docs/09 PlaceCombobox). Storage can be full,
// disabled or blocked (private mode), so every access is wrapped and failures are ignored.

const KEY = "apt.recentPlaces";
const MAX = 5;
const Stored = z.array(PlaceDto).max(20);

export function readRecentPlaces(): PlaceDto[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = Stored.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.slice(0, MAX) : [];
  } catch {
    return [];
  }
}

export function rememberPlace(place: PlaceDto): void {
  try {
    const next = [place, ...readRecentPlaces().filter((p) => p.id !== place.id)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Not saved, the combobox still works without recent places
  }
}
