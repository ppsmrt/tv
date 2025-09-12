// THEME TOGGLE & PERSISTENCE
window.addEventListener("load", ()=>{
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("theme-light", savedTheme==="light");
  document.body.classList.toggle("theme-dark", savedTheme==="dark");
});

// Function to toggle theme
export function toggleTheme(){
  const isLight = document.body.classList.contains("theme-light");
  document.body.classList.toggle("theme-light", !isLight);
  document.body.classList.toggle("theme-dark", isLight);
  localStorage.setItem("theme", !isLight ? "light" : "dark");
}