/// <reference types="vite/client" />

declare module 'lucide-react' {
  import * as React from 'react';
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
  }
  export type LucideIcon = React.FC<LucideProps>;

  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const Volume2: LucideIcon;
  export const VolumeX: LucideIcon;
  export const Heart: LucideIcon;
  export const Shield: LucideIcon;
  export const Compass: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Droplet: LucideIcon;
  export const Utensils: LucideIcon;
  export const Zap: LucideIcon;
  export const Dna: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const Wind: LucideIcon;
  export const Skull: LucideIcon;
  export const RotateCcw: LucideIcon;
  export const Clock: LucideIcon;
  export const Trophy: LucideIcon;
  export const X: LucideIcon;
  export const Play: LucideIcon;
  export const Footprints: LucideIcon;
}
