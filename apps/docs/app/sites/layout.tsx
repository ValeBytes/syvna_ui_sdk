import { SiteFrame } from "@/components/sites/frame";

export default function SitesLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
