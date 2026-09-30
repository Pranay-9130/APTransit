import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { addDays, Calendar, DatePicker, monthGrid } from "./date-picker";

const labels = {
  today: "Today",
  tomorrow: "Tomorrow",
  pickDate: "Pick a date",
  close: "Close",
  previousMonth: "Previous month",
  nextMonth: "Next month",
};

function Harness({ today = "2026-09-30" }: { today?: string }) {
  const [value, setValue] = React.useState(today);
  return (
    <>
      <DatePicker value={value} onChange={setValue} today={today} locale="en-IN" labels={labels} groupLabel="Date" />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("date helpers", () => {
  it("adds days across months and years", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
  });

  it("builds Sunday first weeks", () => {
    const weeks = monthGrid("2026-09-15");
    // 1 Sep 2026 is a Tuesday
    expect(weeks[0]).toEqual([null, null, "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05"]);
    expect(weeks.flat().filter(Boolean)).toHaveLength(30);
  });
});

describe("DatePicker", () => {
  it("switches between Today and Tomorrow chips", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    expect(screen.getByRole("button", { name: "Today" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Tomorrow" }));
    expect(screen.getByTestId("value")).toHaveTextContent("2026-10-01");
    expect(screen.getByRole("button", { name: "Tomorrow" })).toHaveAttribute("aria-pressed", "true");
  });

  it("picks a date from the calendar with the keyboard and shows it on the chip", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Pick a date" }));
    const grid = screen.getByRole("grid");
    expect(grid).toBeInTheDocument();
    // Focus starts on the selected day
    const selected = screen.getByRole("button", { name: /30 September 2026/ });
    selected.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("button", { name: /\b7 October 2026/ })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("value")).toHaveTextContent("2026-10-07");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /\b7 Oct/ })).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Calendar", () => {
  it("disables days before min and after max and clamps keyboard moves", async () => {
    let picked = "";
    render(
      <Calendar
        value="2026-09-30"
        min="2026-09-30"
        max="2026-10-30"
        locale="en-IN"
        labels={labels}
        onSelect={(d) => {
          picked = d;
        }}
      />,
    );
    expect(screen.getByRole("button", { name: /29 September 2026/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous month" })).toBeDisabled();
    const user = userEvent.setup();
    screen.getByRole("button", { name: /30 September 2026/ }).focus();
    await user.keyboard("{ArrowLeft}");
    expect(screen.getByRole("button", { name: /30 September 2026/ })).toHaveFocus();
    await user.keyboard("{PageDown}{PageDown}");
    expect(screen.getByRole("button", { name: /30 October 2026/ })).toHaveFocus();
    await user.keyboard(" ");
    expect(picked).toBe("2026-10-30");
  });
});
