/** First focusable element of every shell. Jumps to <main id="main-content">. */
export function SkipLink({ label }: { label: string }) {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-3 focus:text-on-primary focus:shadow-md"
    >
      {label}
    </a>
  );
}
