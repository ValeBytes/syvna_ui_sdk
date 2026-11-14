// @syvna/ui: the components apps' screens are built from. Every colour,
// radius, shadow and face comes from CSS variables (tokens.json), so a
// room's design restyles all of them by setting those variables. An app's
// globals.css: @import "tailwindcss"; @import "@syvna/ui/theme.css";
// @import "@syvna/ui/tokens.css" (or its design's own values).

export { cn, focusRing, toneFill, toneSoft, toneText, type Tone } from "./cx";

export {
  Button,
  ButtonGroup,
  SplitButton,
  ToggleButton,
  CopyButton,
  buttonVariants,
  type ButtonProps,
  type ButtonSize,
  type ButtonVariant,
  type ButtonGroupProps,
  type SplitButtonProps,
  type ToggleButtonProps,
  type CopyButtonProps,
} from "./components/button";
export { Spinner, type SpinnerProps } from "./components/spinner";
export {
  Input,
  Textarea,
  Select,
  fieldBox,
  fieldVariants,
  type FieldVariant,
  type FieldSize,
  type InputProps,
  type TextareaProps,
  type SelectProps,
  type SelectOption,
} from "./components/inputs";
export { Checkbox, Switch, type CheckboxProps, type SwitchProps } from "./components/choices";
export { Field, type FieldProps } from "./components/field";
export {
  Badge,
  Avatar,
  Card,
  StatCard,
  EmptyState,
  Skeleton,
  Progress,
  type BadgeProps,
  type AvatarProps,
  type CardProps,
  type StatCardProps,
  type EmptyStateProps,
  type SkeletonProps,
  type ProgressProps,
} from "./components/display";
export { Table, type TableProps, type TableColumn } from "./components/table";
export { Tabs, type TabsProps, type TabItem, type TabsVariant } from "./components/tabs";
export { Dialog, Alert, type DialogProps, type AlertProps } from "./components/overlays";
export {
  AppShell,
  Sidebar,
  NavSection,
  NavItem,
  Topbar,
  Breadcrumbs,
  type AppShellProps,
  type SidebarProps,
  type NavSectionProps,
  type NavItemProps,
  type TopbarProps,
  type BreadcrumbsProps,
  type Crumb,
} from "./components/shell";
export { Menu, type MenuProps, type MenuItem } from "./components/menu";
export { SidePanel, DetailList, type SidePanelProps, type DetailListProps } from "./components/panel";
export { SideNav, sideNavVariants, type SideNavProps, type SideNavVariant, type NavGroup, type NavLink } from "./components/sidenav";
export { useShell } from "./components/shell";
export { Popover, Tooltip, useDismiss, type PopoverProps, type TooltipProps } from "./components/popover";
export { Toaster, toast, type ToasterProps, type ToastOptions } from "./components/toast";
export { CommandPalette, useCommandKey, type CommandPaletteProps, type CommandGroup, type CommandItem } from "./components/command";
export { Combobox, type ComboboxProps, type ComboboxOption } from "./components/combobox";
export { Calendar, DatePicker, type CalendarProps, type DatePickerProps } from "./components/datepicker";
export { RadioGroup, SegmentedControl, type RadioGroupProps, type RadioOption, type SegmentedControlProps } from "./components/selection";
export {
  FileUpload,
  UploadItem,
  ImageUpload,
  AvatarUpload,
  FileGlyph,
  fileSize,
  type FileUploadProps,
  type UploadItemProps,
  type ImageUploadProps,
  type AvatarUploadProps,
} from "./components/upload";
export {
  Pagination,
  FilterBar,
  Timeline,
  BarChart,
  LineChart,
  type PaginationProps,
  type FilterBarProps,
  type Filter,
  type TimelineProps,
  type TimelineItem,
  type BarChartProps,
  type LineChartProps,
  type ChartPoint,
} from "./components/data";

// Websites: landing pages, product sites, shop fronts.
export {
  Section,
  FeatureGrid,
  LogoCloud,
  Testimonials,
  Faq,
  CallToAction,
  SiteFooter,
  siteAction,
  type SectionProps,
  type FeatureGridProps,
  type Feature,
  type LogoCloudProps,
  type TestimonialsProps,
  type Quote,
  type FaqProps,
  type CallToActionProps,
  type SiteFooterProps,
} from "./components/site";
export {
  ProductCard,
  PriceTag,
  Rating,
  QuantityStepper,
  CartSummary,
  type ProductCardProps,
  type PriceTagProps,
  type RatingProps,
  type QuantityStepperProps,
  type CartSummaryProps,
  type CartLine,
} from "./components/shop";
export { Hero, heroVariants, type HeroProps, type HeroVariant } from "./components/hero";
export { SiteHeader, siteHeaderVariants, type SiteHeaderProps, type SiteHeaderVariant, type SiteLink } from "./components/site-header";
export { PricingTable, pricingVariants, type PricingTableProps, type PricingVariant, type PricingPlan } from "./components/pricing";
export { DateRangePicker, RangeCalendar, rangePresets, previousPeriod, type DateRangePickerProps, type RangeCalendarProps, type DateRange, type RangePreset } from "./components/daterange";

// Agents: what they're doing, and talking with them.
export {
  Trace,
  TraceStep,
  Plan,
  TaskList,
  ToolCall,
  Reasoning,
  Subagent,
  Sources,
  InlineCitation,
  Checkpoint,
  shimmerText,
  type TraceProps,
  type TraceStepProps,
  type StepStatus,
  type PlanProps,
  type TaskListProps,
  type ToolCallProps,
  type ReasoningProps,
  type SubagentProps,
  type SourcesProps,
  type Source,
  type InlineCitationProps,
  type CheckpointProps,
} from "./components/trace";
export {
  Conversation,
  Message,
  Thinking,
  StreamCaret,
  MessageActions,
  Attachment,
  Suggestions,
  PromptInput,
  Confirmation,
  Questionnaire,
  VariantChooser,
  ModelSelector,
  ContextMeter,
  useElapsed,
  type ConversationProps,
  type MessageProps,
  type ThinkingProps,
  type MessageActionsProps,
  type AttachmentProps,
  type SuggestionsProps,
  type PromptInputProps,
  type ConfirmationProps,
  type QuestionnaireProps,
  type VariantChooserProps,
  type VariantOption,
  type ModelSelectorProps,
  type ModelOption,
  type ContextMeterProps,
} from "./components/chat";
export {
  CodeBlock,
  Terminal,
  StackTrace,
  TestResults,
  FileTree,
  type CodeBlockProps,
  type TerminalProps,
  type StackTraceProps,
  type StackFrame,
  type TestResultsProps,
  type TestCase,
  type FileTreeProps,
  type FileNode,
} from "./components/dev";

// Business apps: fields, table tools, the workspace.
export {
  TagInput,
  NumberInput,
  CurrencyInput,
  InlineEdit,
  KeyValueEditor,
  ApiKeyField,
  Slider,
  type TagInputProps,
  type NumberInputProps,
  type CurrencyInputProps,
  type InlineEditProps,
  type KeyValueEditorProps,
  type KeyValuePair,
  type ApiKeyFieldProps,
  type SliderProps,
} from "./components/fields-more";
export {
  Accordion,
  Kbd,
  AvatarGroup,
  RelativeTime,
  Banner,
  Stepper,
  type AccordionProps,
  type AccordionItem,
  type KbdProps,
  type AvatarGroupProps,
  type RelativeTimeProps,
  type BannerProps,
  type StepperProps,
  type StepperStep,
} from "./components/basics";
export {
  BulkActionBar,
  ColumnSettings,
  SavedViews,
  TransferList,
  TreeView,
  type BulkActionBarProps,
  type ColumnSettingsProps,
  type ColumnSetting,
  type SavedViewsProps,
  type SavedView,
  type TransferListProps,
  type TransferItem,
  type TreeViewProps,
  type TreeNode,
} from "./components/table-tools";
export {
  NotificationCenter,
  AuditLog,
  PermissionMatrix,
  InviteMembers,
  UsageMeter,
  PlanSummary,
  SetupChecklist,
  SaveBar,
  ConfirmByTyping,
  ApprovalCard,
  type NotificationCenterProps,
  type AppNotification,
  type AuditLogProps,
  type AuditEvent,
  type PermissionMatrixProps,
  type PermissionGroup,
  type InviteMembersProps,
  type PendingInvite,
  type UsageMeterProps,
  type PlanSummaryProps,
  type SetupChecklistProps,
  type SetupTask,
  type SaveBarProps,
  type ConfirmByTypingProps,
  type ApprovalCardProps,
  type Approver,
} from "./components/workspace";

// Palettes: every colour token from a few seeds; ready-made ones; applying them.
export {
  createPalette,
  palettePresets,
  paletteCss,
  paletteVars,
  oklch,
  toOklch,
  contrast,
  readable,
  inkOn,
  type Palette,
  type PaletteSeed,
  type PalettePreset,
  type Mode as PaletteMode,
} from "./palette";
export { PaletteStyle, type PaletteStyleProps } from "./components/palette-style";
