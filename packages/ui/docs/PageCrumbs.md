# PageCrumbs

A screen's breadcrumbs, set from the page itself: `<PageCrumbs items={[{ label: "Admin", href: "/admin" }, { label: "Invites" }]} />`. It draws nothing where it sits; the AppShell's Topbar shows the trail. Works in a server page (leave `as` out there). Every signed-in screen has one, so the Topbar always says where you are.
