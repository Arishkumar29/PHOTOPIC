export function Logo({ onClick, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center cursor-pointer select-none transition-transform hover:scale-102 duration-300 ${className}`}
    >
      <img
        src="/gwc_logo.png"
        alt="GWC DATA.AI - SOLUTION MATTERS"
        className="h-8 md:h-9 w-auto object-contain drop-shadow-sm"
      />
    </div>
  );
}
