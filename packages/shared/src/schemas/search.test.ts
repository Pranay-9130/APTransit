import { describe, expect, it } from "vitest";
import { PlacesSearchQuery, TimetableQuery } from "./network";
import { SearchTripsQuery, ServiceDateString } from "./search";

const FROM = "cknlbusstand00000000001";
const TO = "cvjabusstand00000000001";

describe("SearchTripsQuery", () => {
  it("accepts stop ids, a date and an optional time", () => {
    expect(SearchTripsQuery.parse({ from: FROM, to: TO, date: "2026-10-01" })).toEqual({
      from: FROM,
      to: TO,
      date: "2026-10-01",
    });
    expect(SearchTripsQuery.parse({ from: FROM, to: TO, date: "2026-10-01", after: "18:30" }).after).toBe("18:30");
  });

  it.each(["2026-13-01", "2026-02-30", "01-10-2026", "2026-10-1", "tomorrow", ""])("refuses the date %s", (date) => {
    expect(SearchTripsQuery.safeParse({ from: FROM, to: TO, date }).success).toBe(false);
  });

  it.each(["24:00", "9:30", "12:60", "noon"])("refuses the time %s", (after) => {
    expect(SearchTripsQuery.safeParse({ from: FROM, to: TO, date: "2026-10-01", after }).success).toBe(false);
  });

  it("refuses the same stop twice and odd ids", () => {
    expect(SearchTripsQuery.safeParse({ from: FROM, to: FROM, date: "2026-10-01" }).success).toBe(false);
    expect(SearchTripsQuery.safeParse({ from: "1; drop", to: TO, date: "2026-10-01" }).success).toBe(false);
    expect(SearchTripsQuery.safeParse({ to: TO, date: "2026-10-01" }).success).toBe(false);
  });

  it("accepts leap days", () => {
    expect(ServiceDateString.safeParse("2028-02-29").success).toBe(true);
    expect(ServiceDateString.safeParse("2027-02-29").success).toBe(false);
  });
});

describe("PlacesSearchQuery", () => {
  it("needs 2 characters after trimming and defaults the limit", () => {
    expect(PlacesSearchQuery.safeParse({ q: " k " }).success).toBe(false);
    expect(PlacesSearchQuery.parse({ q: " ku " })).toEqual({ q: "ku", limit: 10 });
  });

  it("accepts Telugu input", () => {
    expect(PlacesSearchQuery.parse({ q: "కర్నూ" }).q).toBe("కర్నూ");
  });

  it("coerces and caps the limit", () => {
    expect(PlacesSearchQuery.parse({ q: "ku", limit: "5" }).limit).toBe(5);
    expect(PlacesSearchQuery.safeParse({ q: "ku", limit: "500" }).success).toBe(false);
    expect(PlacesSearchQuery.safeParse({ q: "ku", limit: "0" }).success).toBe(false);
  });
});

describe("TimetableQuery", () => {
  it("allows a missing date", () => {
    expect(TimetableQuery.parse({})).toEqual({});
    expect(TimetableQuery.safeParse({ date: "2026-02-30" }).success).toBe(false);
  });
});
