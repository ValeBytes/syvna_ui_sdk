/** Runs before the page paints, so a saved theme (components/theme-toggle.tsx) never flashes the other one. */
export const themeScript = `try{var t=localStorage.getItem("theme");document.documentElement.dataset.theme=t==="light"||t==="dark"?t:"system"}catch(e){}`;
