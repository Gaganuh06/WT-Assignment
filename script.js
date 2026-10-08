const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

$$("#year").forEach((el) => el.textContent = new Date().getFullYear());

const themeToggle = $("#themeToggle");
if (themeToggle) {
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "☀";
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const light = document.body.classList.contains("light");
        localStorage.setItem("theme", light ? "light" : "dark");
        themeToggle.textContent = light ? "☀" : "☾";
    });
}

/* Animated background */
(() => {
    const cv = document.createElement("canvas");
    cv.id = "flow";
    document.body.prepend(cv);

    const ctx = cv.getContext("2d");
    let W, H, particles = [], mx = -999, my = -999, time = 0;

    const getRGB = (hex) => {
        const h = hex.trim().replace("#", "");
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16)
        ];
    };

    const colors = () => {
        const styles = getComputedStyle(document.body);
        return {
            bg: getRGB(styles.getPropertyValue("--bg")),
            a: getRGB(styles.getPropertyValue("--accent")),
            b: getRGB(styles.getPropertyValue("--accent2"))
        };
    };

    let C = colors();

    const spawn = (p) => {
        p.x = Math.random() * W;
        p.y = Math.random() * H;
        p.life = 80 + Math.random() * 220;
        return p;
    };

    const resize = () => {
        const d = Math.min(devicePixelRatio || 1, 2);
        W = innerWidth;
        H = innerHeight;
        cv.width = W * d;
        cv.height = H * d;
        ctx.setTransform(d, 0, 0, d, 0, 0);

        particles = Array.from(
            {length: Math.min(500, Math.floor(W * H / 3000))},
            (_, i) => Object.assign(spawn({}), {c: i % 2})
        );
        C = colors();
    };

    const step = () => {
        ctx.fillStyle = `rgba(${C.bg[0]},${C.bg[1]},${C.bg[2]},.09)`;
        ctx.fillRect(0, 0, W, H);
        ctx.lineWidth = 1.1;

        for (const c of [0, 1]) {
            const col = c ? C.b : C.a;
            ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},.42)`;
            ctx.beginPath();

            for (const p of particles) {
                if (p.c !== c) continue;

                const angle =
                    (Math.sin(p.x * .0034 + time * 3) +
                    Math.cos(p.y * .0041 - time * 2) +
                    Math.sin((p.x + p.y) * .002 + time)) * 1.3;

                let vx = Math.cos(angle) * 1.2;
                let vy = Math.sin(angle) * 1.2;

                const dx = p.x - mx;
                const dy = p.y - my;
                const distance = Math.hypot(dx, dy);

                if (distance < 170 && distance > 0) {
                    const force = 1 - distance / 170;
                    vx += -dy / distance * force * 2.4 + dx / distance * force * .7;
                    vy += dx / distance * force * 2.4 + dy / distance * force * .7;
                }

                ctx.moveTo(p.x, p.y);
                p.x += vx;
                p.y += vy;
                ctx.lineTo(p.x, p.y);

                if (--p.life < 0 || p.x < 0 || p.x > W || p.y < 0 || p.y > H) spawn(p);
            }

            ctx.stroke();
        }

        time += .0004;
    };

    const loop = () => {
        step();
        requestAnimationFrame(loop);
    };

    addEventListener("resize", resize);
    addEventListener("pointermove", (e) => {
        mx = e.clientX;
        my = e.clientY;
    });

    document.addEventListener("pointerleave", () => {
        mx = my = -999;
    });

    themeToggle?.addEventListener("click", () => setTimeout(() => C = colors(), 0));

    resize();

    if (still) {
        for (let i = 0; i < 160; i++) step();
    } else {
        loop();
    }
})();

/* Rotating role text */
const typingRole = $("#typingRole");
if (typingRole && !still) {
    const roles = [
        "secure RAG systems",
        "Python automation",
        "software engineering",
        "RBAC-aware retrieval",
        "data extraction workflows"
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
        const word = roles[roleIndex];
        charIndex += deleting ? -1 : 1;
        typingRole.textContent = word.slice(0, charIndex);

        let delay = deleting ? 35 : 65;

        if (!deleting && charIndex === word.length) {
            deleting = true;
            delay = 1300;
        } else if (deleting && charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 300;
        }

        setTimeout(type, delay);
    };

    type();
}

/* Project filtering */
const filters = $$(".filter");
const projects = $$(".project-card");

filters.forEach((button) => {
    button.addEventListener("click", () => {
        filters.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        projects.forEach((project) => {
            project.style.display =
                filter === "all" || project.dataset.category === filter
                    ? ""
                    : "none";
        });
    });
});

/* Cursor spotlight */
document.addEventListener("pointermove", (e) => {
    const card = e.target.closest(".glass-card,.bio-card,.project-card,.skill-columns>div");
    if (!card) return;

    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    card.style.setProperty("--my", `${e.clientY - rect.top}px`);
});
