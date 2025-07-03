document.addEventListener('DOMContentLoaded', () => {

    // --- GSAP & ScrollTrigger Setup ---
    // Register the GSAP plugin to make it available for use.
    gsap.registerPlugin(ScrollTrigger);

    // --- Hero Parallax Animation ---
    // This is the section that controls the parallax effect.
    gsap.to(".hero-background", {
        // To make the effect more or less pronounced, change this yPercent value.
        // A higher value (e.g., 50) makes it move more, a lower value (e.g., 20) makes it move less.
        yPercent: 50, // Move the background down
        ease: "none",
        scrollTrigger: {
            trigger: "#hero",
            start: "top top",
            end: "bottom top",
            scrub: true,
        },
    });

    // --- Hero Section Content Animation ---
    const heroTl = gsap.timeline();
    heroTl
        .from('#hero .hero-content h1', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' })
        .from('#hero .hero-content p', { y: 20, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power3.out' }, "-=0.6");


    // --- Section Title Animation ---
    // Animates the large section titles letter by letter.
    gsap.utils.toArray('.section-title').forEach(title => {
        // SplitType breaks the text into individual letters.
        const splitText = new SplitType(title, {
            types: 'chars'
        });

        gsap.from(splitText.chars, {
            y: 30,
            opacity: 0,
            stagger: 0.05, // Each letter animates 0.05s after the previous one.
            duration: 0.3,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: title,
                start: 'top 85%', // Animation starts when the top of the title is 85% from the top of the viewport.
                toggleActions: 'play none none none', // Plays the animation once when it enters the viewport.
            },
        });
    });


    // --- Staggered Content Animation for Sections ---
    // This function creates a staggered animation for the child elements of a given section.
    const animateSection = (sectionId, childrenSelector) => {
        gsap.from(`${sectionId} ${childrenSelector}`, {
            y: 30,
            opacity: 0,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: sectionId,
                start: 'top 70%',
                toggleActions: 'play none none none',
            },
        });
    };

    // Apply the animation to each section with its specific content.
    animateSection('#about', '.grid > div');
    animateSection('#skills', '.grid > div');
    animateSection('#projects', '.project-card');
    animateSection('#contact', '.max-w-2xl > *');

});
