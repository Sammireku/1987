import React from 'react';

interface AtelierLogoProps {
  orientation?: 'wide' | 'square' | 'auto';
  scrolled?: boolean;
  className?: string;
  theme?: 'dark' | 'light' | 'bronze';
  height?: number | string;
}

export const AtelierLogo: React.FC<AtelierLogoProps> = ({
  orientation = 'auto',
  scrolled = false,
  className = '',
  theme = 'dark',
  height,
}) => {
  const textColor = theme === 'light' ? '#FAF8F5' : theme === 'bronze' ? '#C5A880' : '#1A1917';
  const accentColor = theme === 'light' ? '#E8DFD3' : theme === 'bronze' ? '#8C4B23' : '#2A2724';

  // Wide Logo SVG: "nineteen 87"
  // modern sans-serif "nineteen" paired with high-contrast serif "87"
  const WideLogoSVG = (
    <svg
      viewBox="0 0 380 90"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-full w-auto select-none ${className}`}
      style={{ height: height || '34px' }}
      aria-label="1987 Furniture Atelier Logo - Wide"
    >
      {/* "nineteen" in geometric modern tracking */}
      <text
        x="6"
        y="58"
        fill={textColor}
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        fontSize="54"
        fontWeight="350"
        letterSpacing="-0.03em"
      >
        nineteen
      </text>

      {/* "87" in high-contrast Bodoni/Didot serif with characteristic swooping tail */}
      <text
        x="248"
        y="68"
        fill={accentColor}
        fontFamily="'Playfair Display', 'Cinzel', Didot, 'Bodoni MT', Georgia, serif"
        fontSize="88"
        fontWeight="900"
        letterSpacing="-0.06em"
      >
        87
      </text>
    </svg>
  );

  // Square / Stacked Logo SVG: "19" over "87"
  // high-contrast serif numerals stacked in 1:1 square
  const SquareLogoSVG = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-full w-auto select-none ${className}`}
      style={{ height: height || '40px' }}
      aria-label="1987 Furniture Atelier Logo - Square"
    >
      {/* "19" Top Line */}
      <text
        x="50"
        y="46"
        textAnchor="middle"
        fill={textColor}
        fontFamily="'Playfair Display', 'Cinzel', Didot, 'Bodoni MT', Georgia, serif"
        fontSize="52"
        fontWeight="900"
        letterSpacing="-0.04em"
      >
        19
      </text>

      {/* "87" Bottom Line */}
      <text
        x="50"
        y="92"
        textAnchor="middle"
        fill={accentColor}
        fontFamily="'Playfair Display', 'Cinzel', Didot, 'Bodoni MT', Georgia, serif"
        fontSize="54"
        fontWeight="900"
        letterSpacing="-0.05em"
      >
        87
      </text>
    </svg>
  );

  if (orientation === 'wide') {
    return WideLogoSVG;
  }

  if (orientation === 'square') {
    return SquareLogoSVG;
  }

  // AUTO MODE:
  // When scrolled is true, automatically condense to the square stacked logo.
  // When not scrolled, show wide logo on md+ screens and square logo on small mobile screens.
  if (scrolled) {
    return (
      <div className="flex items-center">
        {SquareLogoSVG}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {/* Small mobile screen: square logo */}
      <div className="block md:hidden">
        {SquareLogoSVG}
      </div>

      {/* Desktop / medium+ screen: wide logo */}
      <div className="hidden md:block">
        {WideLogoSVG}
      </div>
    </div>
  );
};
