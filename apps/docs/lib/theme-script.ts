/** Runs before the page paints, so a saved theme (components/theme-toggle.tsx) never flashes the other one. */
export const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;
