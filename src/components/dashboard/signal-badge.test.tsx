import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeverityBadge, SourceTierBadge } from "./signal-badge";

describe("signal badges", () => {
  it("renders market-style severity labels", () => {
    render(<SeverityBadge severity="Shock" />);
    expect(screen.getByText("Shock")).toBeInTheDocument();
  });

  it("renders source tier labels", () => {
    render(<SourceTierBadge tier="Tier 1" />);
    expect(screen.getByText("Tier 1")).toBeInTheDocument();
  });
});