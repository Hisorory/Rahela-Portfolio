// Smooth scroll behavior for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const rail = document.querySelector(".rail");
    if (!rail) return;

    rail.addEventListener(
        "wheel",
        (e) => {
            const { deltaX, deltaY } = e;

            // 1) SHIFT + Scroll = horizontales Scrollen der Rail
            if (e.shiftKey) {
                e.preventDefault();
                rail.scrollLeft += deltaY;
                return;
            }

            // 2) True horizontal intent (Trackpad / Magic Mouse)
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                rail.scrollLeft += deltaX;
                return;
            }

            // 3) Vertikal scrollen -> Seite scrollen, NICHT Rail
            e.preventDefault();              // blockt Browser-Default (Rail horizontal)
            window.scrollBy({
                top: deltaY,
                left: 0,
                behavior: "auto",              // oder "smooth" wenn du fancy willst
            });
        },
        { passive: false }
    );

    // Optional: Drag-to-scroll beibehalten
    let isDown = false;
    let startX;
    let startScrollLeft;

    rail.addEventListener("mousedown", (e) => {
        isDown = true;
        rail.classList.add("is-dragging");
        startX = e.pageX - rail.offsetLeft;
        startScrollLeft = rail.scrollLeft;
    });

    rail.addEventListener("mouseleave", () => {
        isDown = false;
        rail.classList.remove("is-dragging");
    });

    rail.addEventListener("mouseup", () => {
        isDown = false;
        rail.classList.remove("is-dragging");
    });

    rail.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - rail.offsetLeft;
        const walk = (x - startX) * 1.2;
        rail.scrollLeft = startScrollLeft - walk;
    });
});