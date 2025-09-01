const headerContainer = document.getElementById("header-container");
headerContainer.innerHTML = `
  <header id="header" class="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-5 text-2xl font-bold shadow-md flex justify-between items-center">
    <span>Live TV</span>
    <span class="notification-icon relative">
      <i class="fa fa-bell text-2xl"></i>
      <span class="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
    </span>
  </header>
`;

// Hide header on scroll
let lastScroll = 0;
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (currentScroll > lastScroll && currentScroll > 50) {
    header.style.transform = "translateY(-100%)";
  } else {
    header.style.transform = "translateY(0)";
  }
  lastScroll = currentScroll;
});