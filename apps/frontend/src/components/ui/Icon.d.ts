import type { SVGProps } from 'react';
/** Minimal, dependency-free line-icon set (Lucide-style geometry). */
declare const ICONS: {
    readonly grid: import("react").JSX.Element;
    readonly message: import("react").JSX.Element;
    readonly store: import("react").JSX.Element;
    readonly chart: import("react").JSX.Element;
    readonly settings: import("react").JSX.Element;
    readonly logout: import("react").JSX.Element;
    readonly star: import("react").JSX.Element;
    readonly search: import("react").JSX.Element;
    readonly check: import("react").JSX.Element;
    readonly x: import("react").JSX.Element;
    readonly chevronLeft: import("react").JSX.Element;
    readonly chevronRight: import("react").JSX.Element;
    readonly plus: import("react").JSX.Element;
    readonly copy: import("react").JSX.Element;
    readonly menu: import("react").JSX.Element;
    readonly refresh: import("react").JSX.Element;
    readonly trash: import("react").JSX.Element;
    readonly verified: import("react").JSX.Element;
    readonly paperclip: import("react").JSX.Element;
    readonly inbox: import("react").JSX.Element;
    readonly image: import("react").JSX.Element;
    readonly sun: import("react").JSX.Element;
    readonly moon: import("react").JSX.Element;
};
export type IconName = keyof typeof ICONS;
interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
    name: IconName;
    size?: number;
}
export declare function Icon({ name, size, strokeWidth, fill, className, ...rest }: IconProps): import("react").JSX.Element;
export {};
//# sourceMappingURL=Icon.d.ts.map