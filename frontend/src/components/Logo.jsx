export function Logo({ onClick, className = "", size = "default" }) {
  const sizeClasses = {
    sm: "h-8 md:h-9",
    default: "h-11 md:h-12",
    lg: "h-14 md:h-16",
    xl: "h-16 md:h-20"
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center cursor-pointer select-none transition-transform hover:scale-102 duration-300 ${className}`}
    >
      <img
        src="/gwc_logo.png"
        alt="GWC DATA.AI - SOLUTION MATTERS"
        className={`${currentSize} w-auto object-contain max-w-full drop-shadow-sm`}
      />
    </div>
  );
}
