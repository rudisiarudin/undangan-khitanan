import React from 'react';

interface OrnamentProps extends React.SVGProps<SVGSVGElement> {
  rotate?: number;
}

export const Gunungan: React.FC<OrnamentProps> = ({ style, ...props }) => (
  <svg viewBox="0 0 100 150" fill="currentColor" style={style} {...props}>
    <path d="M50 5 C 20 60, 5 90, 5 145 L 95 145 C 95 90, 80 60, 50 5 Z M 50 25 C 60 70, 80 100, 85 135 L 15 135 C 20 100, 40 70, 50 25" opacity="0.8" />
    <path d="M50 15 C 30 60, 20 90, 20 130 L 80 130 C 80 90, 70 60, 50 15" fillOpacity="0.5"/>
  </svg>
);

export const BatikDivider: React.FC<OrnamentProps> = ({ style, ...props }) => (
  <svg viewBox="0 0 400 40" fill="currentColor" style={style} {...props}>
    <path d="M0 20 Q 20 0, 40 20 T 80 20 T 120 20 T 160 20 T 200 20 T 240 20 T 280 20 T 320 20 T 360 20 T 400 20" stroke="currentColor" fill="none" strokeWidth="2" />
    <circle cx="20" cy="20" r="3" />
    <circle cx="60" cy="20" r="3" />
    <circle cx="100" cy="20" r="3" />
    <circle cx="140" cy="20" r="3" />
    <circle cx="180" cy="20" r="3" />
    <circle cx="220" cy="20" r="3" />
    <circle cx="260" cy="20" r="3" />
    <circle cx="300" cy="20" r="3" />
    <circle cx="340" cy="20" r="3" />
    <circle cx="380" cy="20" r="3" />
  </svg>
);

export const CornerFlower: React.FC<OrnamentProps> = ({ rotate = 0, style, ...props }) => (
    <svg 
        viewBox="0 0 100 100" 
        style={{ transform: `rotate(${rotate}deg)`, ...style }}
        fill="currentColor"
        {...props}
    >
        <path d="M0 0 C 50 0, 50 0, 100 0 C 100 50, 100 50, 100 100 C 50 100, 50 100, 0 100 C 0 50, 0 50, 0 0" fill="none"/>
        <path d="M10 10 Q 50 10, 90 90 Q 10 50, 10 10" opacity="0.6"/>
        <path d="M10 10 Q 10 50, 90 90 Q 50 10, 10 10" opacity="0.6"/>
        <circle cx="25" cy="25" r="5" />
        <circle cx="20" cy="40" r="3" />
        <circle cx="40" cy="20" r="3" />
    </svg>
);

export const MandalaFlower: React.FC<OrnamentProps> = ({ style, ...props }) => (
  <svg viewBox="0 0 200 200" fill="currentColor" style={style} {...props}>
     <g opacity="0.4">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rot, i) => (
            <path key={i} transform={`rotate(${rot} 100 100)`} d="M100 30 Q 120 60, 130 90 Q 115 100, 100 100 Q 85 100, 70 90 Q 80 60, 100 30" />
        ))}
     </g>
     <g opacity="0.8">
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((rot, i) => (
             <path key={i} transform={`rotate(${rot} 100 100)`} d="M100 50 Q 110 70, 115 90 Q 100 100, 100 100 Q 100 100, 85 90 Q 90 70, 100 50" />
        ))}
     </g>
     <circle cx="100" cy="100" r="10" />
     <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
     <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
  </svg>
);

export const WayangCouple: React.FC<OrnamentProps> = ({ style, ...props }) => (
  <svg viewBox="0 0 200 150" fill="currentColor" style={style} {...props}>
     {/* Abstract representation of a Javanese couple silhouette (wayang style) */}
     <path d="M60 140 C 40 100, 40 50, 60 20 C 70 10, 80 10, 90 20 C 100 40, 90 80, 80 140 Z" fillOpacity="0.8" />
     <circle cx="75" cy="30" r="10" />
     <path d="M140 140 C 160 100, 160 50, 140 20 C 130 10, 120 10, 110 20 C 100 40, 110 80, 120 140 Z" fillOpacity="0.8" />
     <circle cx="125" cy="35" r="10" />
  </svg>
);

export const FloralDivider: React.FC<OrnamentProps> = ({ style, ...props }) => (
  <svg viewBox="0 0 300 30" fill="currentColor" style={style} {...props}>
    <path d="M150 15 Q 120 0, 90 15 T 30 15" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M150 15 Q 180 30, 210 15 T 270 15" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="150" cy="15" r="3" />
    <circle cx="90" cy="15" r="2" />
    <circle cx="210" cy="15" r="2" />
  </svg>
);