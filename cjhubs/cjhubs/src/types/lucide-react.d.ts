declare module "lucide-react" {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

  export type LucideProps = SVGProps<SVGSVGElement> & {
    color?: string;
    size?: string | number;
    strokeWidth?: string | number;
  };

  type LucideIcon = ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>;

  export const AlertTriangle: LucideIcon;
  export const ArrowRight: LucideIcon;
  export const BadgeCheck: LucideIcon;
  export const CheckCircle2: LucideIcon;
  export const DollarSign: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Facebook: LucideIcon;
  export const FolderTree: LucideIcon;
  export const Gift: LucideIcon;
  export const HeadphonesIcon: LucideIcon;
  export const Heart: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const Instagram: LucideIcon;
  export const LayoutDashboard: LucideIcon;
  export const Linkedin: LucideIcon;
  export const Loader2: LucideIcon;
  export const LogOut: LucideIcon;
  export const Mail: LucideIcon;
  export const MapPin: LucideIcon;
  export const Menu: LucideIcon;
  export const Minus: LucideIcon;
  export const Moon: LucideIcon;
  export const Package: LucideIcon;
  export const PackageCheck: LucideIcon;
  export const PackageSearch: LucideIcon;
  export const Pencil: LucideIcon;
  export const Phone: LucideIcon;
  export const Plus: LucideIcon;
  export const Search: LucideIcon;
  export const ShieldCheck: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const ShoppingCart: LucideIcon;
  export const SlidersHorizontal: LucideIcon;
  export const Sparkles: LucideIcon;
  export const Star: LucideIcon;
  export const Sun: LucideIcon;
  export const Trash2: LucideIcon;
  export const Truck: LucideIcon;
  export const Twitter: LucideIcon;
  export const User: LucideIcon;
  export const Users: LucideIcon;
  export const Webhook: LucideIcon;
  export const Wrench: LucideIcon;
  export const X: LucideIcon;
  export const Zap: LucideIcon;
}
