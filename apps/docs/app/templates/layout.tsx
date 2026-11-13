import { TemplateFrame } from "@/components/templates/frame";

// No title or description: the breadcrumbs say where you are, and the screens start at once.
export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return <TemplateFrame>{children}</TemplateFrame>;
}
