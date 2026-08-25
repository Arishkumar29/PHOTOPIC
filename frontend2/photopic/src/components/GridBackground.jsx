export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Accent Grid */}
      <div className="absolute inset-0 grid-bg-accent grid-bg-mask-top opacity-70"></div>
      {/* Subtle Grid */}
      <div className="absolute inset-0 grid-bg-subtle grid-bg-mask-bottom opacity-50"></div>
    </div>
  );
}
