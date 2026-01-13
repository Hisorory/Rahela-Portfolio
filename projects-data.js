const projects = {
    doopamine: {
        title: "Doopamine",
        tags: ["Design", "UX", "React Native"],
        slogan: "Because <span>brilliance</span> has its own way.",
        subtitle:
            "A task management app designed to help users stay focused and motivated — combining psychology, minimalism and tech.",
        heroMedia: "videos/doopamine-hero.mp4",
        heroType: "video",
        layout: "phone", // 👈 phone layout aktiv
        content: `
      <h2>The Process</h2>
      <p>Doopamine was born from the question: “Why do we procrastinate?” 
      The goal was to create a tool that doesn’t punish users for distraction,
      but instead rewards focus using behavioral design principles.</p>
      <p>I designed the interface in Figma, explored UX psychology, and built
      the prototype in React Native — integrating subtle gamification
      elements to keep users engaged.</p>
    `,
        gallery: [
            "../images/projects/doopamine.png",
            "../images/projects/doopamine.png",
            "../images/projects/doopamine.png"
        ]
    },

    moneclat: {
        title: "Mon Éclat",
        tags: ["Branding", "CI Design"],
        slogan: "Elegance meets identity.",
        subtitle:
            "A luxury brand identity project enhancing beauty and confidence.",
        heroMedia: "../images/projects/ME.png",
        heroType: "image",
        layout: "standard", // 👈 kein phone layout
        content: `
      <h2>The Process</h2>
      <p>Mon Éclat explores how design language reflects personality. 
      I created a full brand identity focusing on visual consistency, 
      emotional storytelling, and modern luxury appeal.</p>
    `,
        gallery: [
            "../images/projects/ME.png",
            "../images/projects/ME2.png",
            "../images/projects/ME3.png"
        ]
    }
};