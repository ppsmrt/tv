// Header search functionality
const searchInput = document.getElementById('searchInput');
const categoryButtons = document.querySelectorAll('.category-btn');
let selectedCategory = 'All';

categoryButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    categoryButtons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
    btn.classList.add('active'); btn.setAttribute('aria-pressed','true');
    selectedCategory = btn.dataset.category;
    window.dispatchEvent(new CustomEvent('filterChanged', { detail: searchInput.value }));
  });
});

searchInput.addEventListener('input', e => {
  window.dispatchEvent(new CustomEvent('filterChanged', { detail: e.target.value }));
});

export { selectedCategory };