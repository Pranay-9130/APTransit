import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./otp-input";

function Harness({ onComplete }: { onComplete?: (code: string) => void }) {
  const [value, setValue] = React.useState("");
  return (
    <>
      <OtpInput
        value={value}
        onChange={setValue}
        onComplete={onComplete}
        groupLabel="Enter the 6 digit code"
        digitLabel={(i, n) => `Digit ${i} of ${n}`}
      />
      <output data-testid="value">{value}</output>
    </>
  );
}

describe("OtpInput", () => {
  it("renders 6 labelled boxes in a named group, first box takes one-time-code", () => {
    render(<Harness />);
    expect(screen.getByRole("group", { name: "Enter the 6 digit code" })).toBeInTheDocument();
    const boxes = screen.getAllByRole("textbox");
    expect(boxes).toHaveLength(6);
    expect(boxes[0]).toHaveAttribute("autocomplete", "one-time-code");
    expect(boxes[0]).toHaveAttribute("inputmode", "numeric");
    expect(screen.getByLabelText("Digit 6 of 6")).toBeInTheDocument();
  });

  it("moves forward while typing and completes once", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.keyboard("123456");
    expect(screen.getByTestId("value")).toHaveTextContent("123456");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("ignores letters", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.keyboard("a1b2");
    expect(screen.getByTestId("value")).toHaveTextContent("12");
  });

  it("spreads a pasted code across the boxes", () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    fireEvent.paste(screen.getByLabelText("Digit 1 of 6"), { clipboardData: { getData: () => " 654 321 " } });
    expect(screen.getByTestId("value")).toHaveTextContent("654321");
    expect(onComplete).toHaveBeenCalledWith("654321");
  });

  it("takes a full code from autofill in the first box", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Digit 1 of 6"), { target: { value: "987654" } });
    expect(screen.getByTestId("value")).toHaveTextContent("987654");
  });

  it("goes back with Backspace on an empty box", async () => {
    render(<Harness />);
    const user = userEvent.setup();
    await user.click(screen.getByLabelText("Digit 1 of 6"));
    await user.keyboard("12");
    expect(screen.getByLabelText("Digit 3 of 6")).toHaveFocus();
    await user.keyboard("{Backspace}");
    expect(screen.getByTestId("value")).toHaveTextContent(/^1$/);
    expect(screen.getByLabelText("Digit 2 of 6")).toHaveFocus();
  });
});
