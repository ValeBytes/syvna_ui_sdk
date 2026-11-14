// The components in the order the docs list them, by group. Plain data, so
// server pages can read it; the entries themselves are in registry/<group>.tsx.

export const kits = [
  { value: "dashboard", label: "Dashboard" },
  { value: "website", label: "Website" },
  { value: "agent", label: "Agent" },
] as const;
export type Kit = (typeof kits)[number]["value"];

export const groups = [
  { kit: "dashboard", name: "App shell", items: ["AppShell", "SideNav", "Sidebar", "NavSection", "NavItem", "Topbar", "PageCrumbs", "Breadcrumbs", "Menu", "SidePanel", "DetailList"] },
  { kit: "dashboard", name: "Actions", items: ["Button", "ButtonGroup", "SplitButton", "ToggleButton", "CopyButton", "Spinner"] },
  {
    kit: "dashboard",
    name: "Forms",
    items: ["Field", "Input", "Textarea", "Select", "Combobox", "TagInput", "NumberInput", "CurrencyInput", "DatePicker", "DateRangePicker", "Calendar", "RangeCalendar", "Checkbox", "Switch", "RadioGroup", "SegmentedControl", "Slider", "InlineEdit", "KeyValueEditor", "ApiKeyField", "FileUpload", "UploadItem", "ImageUpload", "AvatarUpload"],
  },
  { kit: "dashboard", name: "Data", items: ["Table", "FilterBar", "Pagination", "StatCard", "BarChart", "LineChart", "Timeline", "Badge", "Avatar", "AvatarGroup", "Progress", "RelativeTime", "Kbd"] },
  { kit: "dashboard", name: "Tables", items: ["BulkActionBar", "ColumnSettings", "SavedViews", "TransferList", "TreeView"] },
  { kit: "dashboard", name: "Layout", items: ["Card", "Tabs", "Accordion", "Stepper", "EmptyState", "Skeleton"] },
  { kit: "dashboard", name: "Feedback", items: ["Alert", "Banner", "Toaster", "Dialog", "Popover", "Tooltip", "CommandPalette"] },
  { kit: "dashboard", name: "Workspace", items: ["NotificationCenter", "AuditLog", "PermissionMatrix", "InviteMembers", "UsageMeter", "PlanSummary", "SetupChecklist", "SaveBar", "ConfirmByTyping", "ApprovalCard"] },
  { kit: "website", name: "Marketing", items: ["SiteHeader", "Hero", "Section", "FeatureGrid", "LogoCloud", "Testimonials", "PricingTable", "Faq", "CallToAction", "SiteFooter", "AuthLayout"] },
  { kit: "website", name: "Shop", items: ["ProductCard", "PriceTag", "Rating", "QuantityStepper", "CartSummary"] },
  { kit: "agent", name: "Chat", items: ["Conversation", "Message", "PromptInput", "Suggestions", "Thinking", "StreamCaret", "MessageActions", "Attachment", "ModelSelector", "ContextMeter"] },
  { kit: "agent", name: "Agent at work", items: ["Plan", "TaskList", "ToolCall", "Reasoning", "Subagent", "Trace", "TraceStep", "Sources", "InlineCitation", "Checkpoint"] },
  { kit: "agent", name: "Asking the user", items: ["Confirmation", "Questionnaire", "VariantChooser"] },
  { kit: "agent", name: "Building", items: ["CodeBlock", "Terminal", "StackTrace", "TestResults", "FileTree"] },
] as const;

export type ComponentName = (typeof groups)[number]["items"][number];

/** AppShell → app-shell. */
export function slug(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

export const all: { name: ComponentName; group: string; kit: Kit; slug: string }[] = groups.flatMap((g) =>
  g.items.map((name) => ({ name, group: g.name, kit: g.kit as Kit, slug: slug(name) })),
);
