// ================================
// ROTATING RADIAL NAVIGATION WHEEL
// ================================

const ITEMS = [
    { id: "home", label: "HOME" },
    { id: "about", label: "ABOUT ME" },
    { id: "projects", label: "PROJECTS" },
    { id: "contact", label: "CONTACT" },
];

// Controls how much the wheel rotates as you scroll (smaller = slower)
const ROTATION_MULTIPLIER = 0.21;

// Converts degrees → radians
const toRad = (deg) => (deg * Math.PI) / 180;

// Generates the arc path for each text label
function arcPath(cx, cy, r, startDeg, endDeg) {
    const sx = cx + r * Math.cos(toRad(startDeg));
    const sy = cy + r * Math.sin(toRad(startDeg));
    const ex = cx + r * Math.cos(toRad(endDeg));
    const ey = cy + r * Math.sin(toRad(endDeg));
    const largeArc = Math.abs(endDeg - startDeg) % 360 > 180 ? 1 : 0;
    return `M ${sx} ${sy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const svg = document.getElementById("navSvg");
    if (!svg) {
        console.warn("⚠️ navSvg not found");
        return;
    }

    const size = 500;
    const cx = size / 2,
        cy = size / 2;
    const rText = 270 + 8;
    const step = 100 / ITEMS.length;

    const nodes = [];

    // Build arcs + text for each section
    ITEMS.forEach((item, idx) => {
        const group = document.createElementNS(svg.namespaceURI, "g");
        group.setAttribute("class", "item");

        const start = -12 + idx * step + 1;
        const end = start + step - 1;
        const pathId = `arc-${item.id}`;

        const arc = document.createElementNS(svg.namespaceURI, "path");
        arc.setAttribute("id", pathId);
        arc.setAttribute("d", arcPath(cx, cy, rText, start, end));
        arc.setAttribute("class", "arc");

        // Click scroll
        arc.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        });

        const text = document.createElementNS(svg.namespaceURI, "text");
        text.setAttribute("class", "label");

        const textPath = document.createElementNS(svg.namespaceURI, "textPath");
        textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${pathId}`);
        textPath.setAttribute("startOffset", "50%");
        text.setAttribute("text-anchor", "middle");
        textPath.textContent = item.label;

        text.appendChild(textPath);
        group.appendChild(arc);
        group.appendChild(text);
        svg.appendChild(group);

        nodes.push({ g: group, id: item.id });
    });

    // ===================
    // Smooth Scroll Rotation
    // ===================
    function updateRotation() {
        const maxScroll = document.documentElement.scrollHeight - innerHeight;
        const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
        svg.style.transform = `rotate(${-(progress * 360 * ROTATION_MULTIPLIER)}deg)`;
    }

    updateRotation();
    window.addEventListener("scroll", updateRotation, { passive: true });
    window.addEventListener("resize", updateRotation);

    // ===================
    // Highlight Active Section
    // ===================
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                const node = nodes.find((n) => n.id === entry.target.id);
                if (!node) return;

                if (entry.intersectionRatio > 0.25) {
                    nodes.forEach((n) => n.g.classList.remove("active"));
                    node.g.classList.add("active");
                }
            });
        },
        { threshold: [0.25, 0.4, 0.6], rootMargin: "0px 0px -25% 0px" }
    );

    ITEMS.forEach((item) => {
        const sec = document.getElementById(item.id);
        if (sec) observer.observe(sec);
    });

    // Mark correct one on load
    window.addEventListener("load", () => {
        const hash = location.hash.replace("#", "") || "home";
        const match = nodes.find((n) => n.id === hash);
        if (match) {
            nodes.forEach((n) => n.g.classList.remove("active"));
            match.g.classList.add("active");
        }
    });
});