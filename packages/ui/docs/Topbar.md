# Topbar

The bar over each screen, inside an AppShell. It says where you are (the breadcrumbs) on the left and holds the actions that are always there on the right: the main action, notifications, the account menu. It stays at the top while the screen scrolls, and on phones holds the button that opens the Sidebar.

Put one Topbar in the layout and leave its breadcrumbs to the pages: each page renders `<PageCrumbs items={…} />` and the Topbar draws them. Never a title, a heading or Breadcrumbs at the top of a page's content: that repeats what the Topbar says.
