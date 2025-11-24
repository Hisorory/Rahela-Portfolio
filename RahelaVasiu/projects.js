// === Load and render projects ===
async function loadProjects() {
    try {
        const res = await fetch("projects.json");
        const projects = await res.json();

        const grid = document.querySelector(".projects-grid");
        grid.innerHTML = projects.map(project => `
  <div class="card" data-category="${project.category}">
      <img src="${project.thumbnail}" alt="${project.title}">    <div class="card-body">
      <h3>${project.title}</h3>
      <div class="tech">${project.tags.join(' • ')}</div>
      <p>${project.details.description}</p>
      <a href="detail.html?id=${project.id}" class="btn">View Project</a>    </div>
  </div>
`).join('');

        addFiltering(); // activate filters after projects load
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

loadProjects();

// === Filtering ===
function addFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const grid = document.querySelector('.projects-grid');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.filter;
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            cards.forEach(card => {
                const show = category === 'all' || card.dataset.category.includes(category);
                card.style.display = show ? 'block' : 'none';
                card.style.opacity = show ? '1' : '0';
            });

            grid.classList.add('fading');
            setTimeout(() => grid.classList.remove('fading'), 300);
        });
    });
}