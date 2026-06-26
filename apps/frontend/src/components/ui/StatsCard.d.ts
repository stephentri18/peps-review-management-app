/// <reference types="react" />
import { type IconName } from './Icon.js';
type Tone = 'brand' | 'emerald' | 'amber' | 'rose' | 'violet' | 'sky' | 'neutral';
interface StatsCardProps {
    label: string;
    value: string | number;
    sub?: string;
    icon: IconName;
    tone?: Tone;
}
export declare function StatsCard({ label, value, sub, icon, tone }: StatsCardProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=StatsCard.d.ts.map