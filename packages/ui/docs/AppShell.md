# AppShell

The frame of an app's signed-in screens: Sidebar on the left, Topbar over the screen, the screen in the middle. From 768px wide the sidebar stays on show; on phones it's behind the Topbar's menu button and slides in, closing when a link is picked or Escape is pressed.

Put it in the app's signed-in layout (`app/(app)/layout.tsx`) so every screen shares it, The Topbar's breadcrumbs say where you are, so a screen starts with its content: a toolbar row of actions and filters, then the list or form. No big title and description at the top. `width="full"` lets wide tables use the whole screen; the default caps content at 1200px.

This preview is a whole screen: click a row to open it in a SidePanel, the dots for a row's Menu, and the account at the bottom for its Menu.

It lays itself out by its own width, not the window's: from 768px wide (`@3xl`) the sidebar stays on show. A shell that fills the window behaves exactly as with screen breakpoints, and one inside a smaller box (a preview, a panel) still gets the right layout. Its main area is a container too, so lay screens out with container variants: `@lg:grid-cols-2 @3xl:grid-cols-4`, not `sm:` and `xl:`.
