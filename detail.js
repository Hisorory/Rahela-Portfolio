// detail.js

// === 1. ID aus URL holen ===
const params = new URLSearchParams(window.location.search);
const projectId = params.get("id");

// === 2. Projekt laden ===
async function loadProject() {
    try {
        const res = await fetch("projects.json");
        const projects = await res.json();

        const project = projects.find(p => p.id === projectId);
        if (!project) {
            document.getElementById("project-detail").innerHTML =
                "<p>Project not found.</p>";
            return;
        }

        renderProject(project, projects);
    } catch (err) {
        console.error("Error loading project:", err);
        document.getElementById("project-detail").innerHTML =
            "<p>Could not load project.</p>";
    }
}

// === 3. HTML aufbauen ===
function renderProject(p, projects)  {
    const container = document.getElementById("project-detail");
    const isPhone = p.layout === "phone";

    const heroMediaHTML =
        p.heroType === "video"
            ? `<video src="${p.heroMedia}" autoplay muted loop playsinline></video>`
            : `<img src="${p.heroMedia}" alt="${p.title} hero">`;

    // --- Abschnitt unter dem Hero ---

    // a) Phone-Layout: Phone links, Text + Skills rechts
    const phoneSectionHTML =
        isPhone && p.details.phoneMedia
            ? `
      <section class="phone-section">
        <div class="phone-frame">
          <video src="${p.details.phoneMedia}" autoplay muted loop playsinline></video>
        </div>
        <div class="phone-copy">
          <h2>About the project</h2>
          <p>${p.details.longDesc || ""}</p>

          ${
                p.details.tools && p.details.tools.length
                    ? `
            <h3>Skills &amp; Tools</h3>
            <ul class="skills-list">
              ${p.details.tools.map((t) => `<li>${t}</li>`).join("")}
            </ul>
          `
                    : ""
            }
        </div>
      </section>
    `
            : "";

    // b) Standard-Layout (ohne Phone): Text links, Skills rechts
    const standardContentHTML =
        !isPhone
            ? `
    <section class="project-content">
      <div class="col left">
        <h2>About the project</h2>
        <p>${p.details.longDesc || ""}</p>
      </div>
      <div class="col right">
        ${
                p.details.tools && p.details.tools.length
                    ? `
          <h3>Skills &amp; Tools</h3>
          <ul class="skills-list">
            ${p.details.tools.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        `
                    : ""
            }
      </div>
    </section>
  `
            : "";

    // --- Gallery ---
    const galleryHTML =
        p.details.gallery && p.details.gallery.length
            ? `
    <section class="project-gallery">
      ${p.details.gallery
                .map((src) =>
                    src.endsWith(".mp4")
                        ? `<video src="${src}" autoplay muted loop playsinline></video>`
                        : `<img src="${src}" alt="${p.title} gallery image">`
                )
                .join("")}
    </section>
  `
            : "";
    const relatedHTML = `
<section class="related-projects">
  <h2>See more projects</h2>
  <div class="related-grid">
    ${projects
        .filter((x) => x.id !== p.id)
        .slice(0, 3)
        .map(
            (x) => `
      <a class="related-card" href="detail.html?id=${x.id}">
        <img src="${x.thumbnail}" alt="${x.title}">
        <p>${x.title}</p>
      </a>
    `
        )
        .join("")}
  </div>
  <div class="see-more">
    <a href="projects.html" class="see-more-link">Back to all projects</a>
  </div>
</section>`;

    container.innerHTML = `
    <section class="project-hero">
      <div class="hero-content">
        <div class="hero-text">
          <div class="tags">
            ${p.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <h1>${p.title}</h1>
          ${p.slogan ? `<p class="slogan">${p.slogan}</p>` : ""}
          ${p.subtitle ? `<p class="subtitle">${p.subtitle}</p>` : ""}
          ${
        p.details.description
            ? `<p class="description">${p.details.description}</p>`
            : ""
        
    }
          ${
        p.details.ciLink
            ? `
      <div class="hero-cta">
        <a href="${p.details.ciLink}"
           class="btn secondary"
           target="_blank"
           rel="noreferrer">
          ${p.details.ciLabel || "View full CI"}
        </a>
      </div>
    `
            : ""
    }
        </div>

        <div class="hero-media">
          ${heroMediaHTML}
        </div>
      </div>
    </section>

    ${isPhone ? phoneSectionHTML : standardContentHTML}
  ${galleryHTML}
  ${relatedHTML}
  `;

}

loadProject();