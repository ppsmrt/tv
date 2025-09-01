const headerContainer = document.getElementById("header-container");
headerContainer.innerHTML = `
  <header id="header" class="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-5 text-center text-2xl font-bold shadow-md">
    Live TV
  </header>
`;

// Hide header on scroll
let lastScroll = 0;
const header = document.getElementById("header");
window.addEventListener("scroll", ()=>{
  const currentScroll = window.pageYOffset;
  if(currentScroll > lastScroll && currentScroll > 50){
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "translateY(0)";
  }
  lastScroll = currentScroll;
});
