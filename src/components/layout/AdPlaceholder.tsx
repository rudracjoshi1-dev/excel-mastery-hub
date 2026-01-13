interface AdPlaceholderProps {
  size?: "banner" | "sidebar" | "inline";
  className?: string;
}

export function AdPlaceholder({ size = "inline", className = "" }: AdPlaceholderProps) {
  const sizeClasses = {
    banner: "h-24 md:h-[90px]",
    sidebar: "h-[250px] w-full max-w-[300px]",
    inline: "h-[90px]",
  };

  return (
    <div
      className={`ad-placeholder ${sizeClasses[size]} ${className}`}
      role="complementary"
      aria-label="Advertisement placeholder"
    >
      <span className="text-xs">Advertisement</span>
    </div>
  );
}
