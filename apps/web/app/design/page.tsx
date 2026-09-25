import { notFound } from "next/navigation";
import { PrimitivesShowcase } from "../_token-check/primitives-showcase";
import { TokenCheck } from "../_token-check/token-check";

export default function DesignPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="flex flex-col gap-12 py-6">
      <div className="border-b border-subtle pb-4">
        <h1 className="text-display font-black text-text tracking-tight">Design System & Primitives</h1>
        <p className="text-body text-muted mt-2">
          Comprehensive showcase of all AP TransitOS design tokens, primitives, accessibility states, and themes.
        </p>
      </div>

      <PrimitivesShowcase />
      <div className="border-t border-subtle pt-12">
        <h2 className="text-h1 font-bold text-text mb-6">Token Swatches & Type Scale</h2>
        <TokenCheck />
      </div>
    </div>
  );
}
