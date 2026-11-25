/* @refresh skip */
import { createElement, useEffect, useMemo, useState, type ReactNode } from "react";

type LinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
};

const Link = ({ href, className = "", children, onClick }: LinkProps) =>
  createElement("a", { href, className, onClick }, children);

const Icon = ({ name, size = 20 }: { name: string; size?: number }) => {
  const paths: Record<string, ReactNode> = {
    bolt: <path d="m13 2-9 12h8l-1 8 9-12h-8l1-8Z" />,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.5-5 3-7 8-7s7.5 2 8 7" /></>,
    arrow: <><path d="M5 12h14" /><path d="m14 7 5 5-5 5" /></>,
    book: <><path d="M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3Z" /><path d="M4 5v17" /></>,
    chip: <><rect x="6" y="6" width="12" height="12" rx="2" /><path d="M9 1v5m6-5v5M9 18v5m6-5v5M1 9h5m12 0h5M1 15h5m12 0h5" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M5 21h14" /></>,
    code: <><path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-9-4 12" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v6l4 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chart: <path d="m3 17 5-5 4 3 7-9m-5 0h5v5" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    play: <><circle cx="12" cy="12" r="9" /><path d="m10 8 6 4-6 4Z" /></>,
    file: <><path d="M6 2h8l4 4v16H6Z" /><path d="M14 2v5h5M9 12h6m-6 4h6" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    layers: <><path d="m12 2 9 5-9 5-9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name] ?? paths.bolt}
    </svg>
  );
};

const nav = [
  ["Home", "/"],
  ["Tutorials", "/tutorials"],
  ["Resources", "/resources"],
  ["Projects", "/projects"],
  ["About", "/about"],
];

function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? getSearchItems().filter((item) => `${item.title} ${item.detail} ${item.keywords}`.toLowerCase().includes(normalizedQuery)).slice(0, 6)
    : [];

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand">
          <span className="brand-icon"><Icon name="bolt" /></span>
          <span>Harvegen</span>
        </Link>
        <nav className={`main-nav ${open ? "open" : ""}`}>
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className={path === href || (href !== "/" && path.startsWith(href)) ? "active" : ""} onClick={() => setOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <div className={`site-search ${searchOpen ? "search-open" : ""}`}>
            <form className="search" role="search" onSubmit={(event) => {
              event.preventDefault();
              if (results[0]) {
                const target = new URL(results[0].href, window.location.origin);
                if (target.origin !== window.location.origin) {
                  window.location.assign(target.href);
                  return;
                }
                window.history.pushState({}, "", `${target.pathname}${target.search}${target.hash}`);
                window.dispatchEvent(new PopStateEvent("popstate"));
                setQuery("");
                setSearchOpen(false);
                if (target.hash) {
                  const targetId = target.hash.slice(1);
                  setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}>
              <button type="button" className="search-icon-button" aria-label="Open search" onClick={() => setSearchOpen(!searchOpen)}><Icon name="search" size={17} /></button>
              <input
                type="search"
                aria-label="Search courses, projects, and resources"
                aria-expanded={Boolean(normalizedQuery)}
                aria-controls="site-search-results"
                placeholder="Search courses, projects..."
                value={query}
                onFocus={() => setSearchOpen(true)}
                onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setQuery("");
                    setSearchOpen(false);
                    (event.target as HTMLInputElement).blur();
                  }
                }}
              />
            </form>
            {searchOpen && normalizedQuery && <div className="search-results" id="site-search-results">
              {results.length ? results.map((item) => (
                <Link key={`${item.href}-${item.title}`} href={item.href} className="search-result" onClick={() => { setQuery(""); setSearchOpen(false); }}>
                  <span><b>{item.title}</b><small>{item.detail}</small></span><Icon name="arrow" size={16} />
                </Link>
              )) : <p className="search-empty">No matches found. Try a course, platform, or topic.</p>}
            </div>}
          </div>
          <Link href="/profile" className="signin"><Icon name="user" size={17} /><span>Sign In</span></Link>
          <div className="menu-button" role="button" tabIndex={0} onClick={() => setOpen(!open)}>
            <Icon name={open ? "close" : "menu"} />
          </div>
        </div>
      </div>
    </header>
  );
}

function getSearchItems() {
  return [
    ...nav.slice(1).map(([title, href]) => ({ title, href, detail: `${title} collection`, keywords: title })),
    ...textCourses.map((course) => ({ title: course.title, href: `/tutorials/text/${course.slug}`, detail: `Text course · ${course.level}`, keywords: `${course.shortTitle} ${course.description}` })),
    ...videoCourses.map((course) => ({ title: course.title, href: `/tutorials/video/${course.slug}`, detail: `Video course · ${course.duration}`, keywords: `${course.shortTitle} ${course.description}` })),
    ...projects.map((project) => ({ title: project.title, href: "/projects#project-library", detail: `Project · ${project.tags.join(" · ")}`, keywords: `${project.desc} ${project.tags.join(" ")}` })),
    ...resourceCollections.flatMap((collection) => collection.items.map((item) => ({
      title: item.title,
      href: item.href,
      detail: `${collection.label} · ${item.tag}`,
      keywords: `${item.text} ${item.meta}`,
    }))),
  ];
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand-col">
            <div className="footer-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect width="28" height="28" rx="7" fill="#15803d"/><path d="M7 14h5m4 0h5M14 7v5m0 4v5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/><circle cx="14" cy="14" r="3" fill="white"/></svg>
              <span>Harvegen</span>
            </div>
            <p className="footer-tagline">An open embedded systems learning platform — built by engineers, for engineers. From bare-metal C to real-time OS, we cover it all.</p>
            <div className="footer-social">
              <a href="https://github.com/harvegen" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S9 17.44 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="https://twitter.com/harvegen" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://linkedin.com/company/harvegen" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://discord.gg/harvegen" target="_blank" rel="noopener noreferrer" aria-label="Discord" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              </a>
              <a href="https://youtube.com/@harvegen" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social-link">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          {/* Learn */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Learn</h4>
            <ul className="footer-links">
              <li><Link href="/tutorials">All Tutorials</Link></li>
              <li><Link href="/tutorials/text/embedded-c">Embedded C</Link></li>
              <li><Link href="/tutorials/text/freertos-practical">FreeRTOS</Link></li>
              <li><Link href="/tutorials/text">Beginner Courses</Link></li>
            </ul>
          </div>

          {/* Formats */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Learning Formats</h4>
            <ul className="footer-links">
              <li><Link href="/tutorials/text">Text Courses</Link></li>
              <li><Link href="/tutorials/video">Video Courses</Link></li>
              <li><Link href="/tutorials/text/embedded-c">Embedded C</Link></li>
              <li><Link href="/tutorials/text/freertos-practical">FreeRTOS</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Resources</h4>
            <ul className="footer-links">
              <li><Link href="/resources">All Resources</Link></li>
              <li><Link href="/resources#resource-documentation">Datasheets</Link></li>
              <li><Link href="/resources#resource-toolchain">Development Tools</Link></li>
              <li><Link href="/resources#resource-source-code">Course Companions</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-col">
            <h4 className="footer-col-heading">Company</h4>
            <ul className="footer-links">
              <li><Link href="/about">About Harvegen</Link></li>
              <li><Link href="/about#team">Our Team</Link></li>
              <li><Link href="/about#mission">Mission</Link></li>
              <li><Link href="/about#contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-support">
          <div className="footer-support-intro">
            <i>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><path d="M18 19c0 1.1-.9 2-2 2h-3"/><rect width="4" height="7" x="2" y="13" rx="2"/><rect width="4" height="7" x="18" y="13" rx="2"/></svg>
            </i>
            <span><b>Get in Touch</b><p>Have a question or need support?<br />We’re here to help.</p></span>
          </div>
          <a href="mailto:info@harvegen.com" className="footer-contact-card">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span><small>Email us</small><b>info@harvegen.com</b></span>
          </a>
          <div className="footer-contact-card">
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span><small>Our location</small><b>Bengaluru, India</b></span>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-left">
            <span>© {year} Harvegen. All rights reserved.</span>
            <span className="footer-bottom-dot">·</span>
            <span>MIT Licensed</span>
          </div>
          <div className="footer-bottom-links">
            <Link href="/about#contact">Contact</Link>
            <Link href="/about">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function AppLayout({ path, children }: { path: string; children: ReactNode }) {
  return <><Header path={path} /><main>{children}</main><Footer /></>;
}

function Label({ children }: { children: ReactNode }) {
  return <div className="eyebrow"><i />{children}</div>;
}

function PageHero({ pathLabel, label, title, accent, description, variant = "shapes", children }: {
  pathLabel: string; label: string; title: string; accent: string; description: string; variant?: "shapes" | "wash"; children?: ReactNode;
}) {
  return (
    <section className={`page-hero page-hero-${pathLabel.toLowerCase()} ${variant}`}>
      <div className="hero-art"><span /><span /></div>
      <div className="container">
        <div className="breadcrumb">Home <span>/</span> {pathLabel}</div>
        <Label>{label}</Label>
        <div className="page-title">{title}<strong>{accent}</strong></div>
        <p className="page-description">{description}</p>
        {children}
      </div>
    </section>
  );
}

const projects = [
  { title: "Smart Irrigation System", desc: "Soil moisture monitoring with automatic pump control and real-time sensor data.", tags: ["STM32", "IoT", "Intermediate"], image: "/iot.jpeg" },
  { title: "Driver Drowsiness Detection", desc: "IR eye-blink detection with pattern recognition and an instant alert system.", tags: ["LPC1768", "Safety", "Advanced"], image: "/vlsi1.jpeg" },
  { title: "IoT Weather Station", desc: "Connected weather monitor with cloud dashboard, forecasts, and sensor fusion.", tags: ["Arduino", "IoT", "Beginner"], image: "/iot2.jpg" },
  { title: "Autonomous Rover", desc: "FreeRTOS multi-task obstacle avoidance and path planning on STM32F411.", tags: ["STM32", "FreeRTOS", "Advanced"], image: "/vlsi%202.jpg" },
  { title: "Smart Door Lock", desc: "RFID and keypad authentication with EEPROM access logging.", tags: ["LPC1768", "Security", "Intermediate"], image: "/vlsi%202.jpeg" },
  { title: "Energy Monitor", desc: "Real-time power monitoring with usage analytics and cloud reporting.", tags: ["Arduino", "IoT", "Intermediate"], image: "/iot3.jpg" },
];

const modules = [
  { icon: "code", tag: "Embedded C", title: "Pointers, Memory & Registers", desc: "Build a strong foundation in low-level C for embedded targets.", time: "35 min", level: "Beginner", href: "/tutorials/text/embedded-c" },
  { icon: "chip", tag: "STM32", title: "GPIO & HAL Library", desc: "Configure outputs, interrupts, and EXTI lines with CubeMX.", time: "25 min", level: "Beginner", href: "/tutorials/text/stm32-foundations" },
  { icon: "code", tag: "Protocols", title: "UART: From Config to Buffers", desc: "Configure serial communication and circular receive buffers.", time: "40 min", level: "Intermediate", href: "/tutorials/text/embedded-c" },
  { icon: "clock", tag: "FreeRTOS", title: "Tasks, Queues & Semaphores", desc: "Build predictable multi-tasking firmware with RTOS primitives.", time: "50 min", level: "Advanced", href: "/tutorials/text/freertos-practical" },
  { icon: "chip", tag: "LPC1768", title: "GPIO via PINSEL Registers", desc: "Bare-metal port setup, pin direction, and LED control.", time: "20 min", level: "Beginner", href: "/tutorials/text/stm32-foundations" },
  { icon: "book", tag: "Arduino", title: "Sensors & analogRead()", desc: "Interface common sensors and turn readings into useful data.", time: "30 min", level: "Beginner", href: "/tutorials/text/iot-sensor-systems" },
];

type LearningMode = "text" | "video";

type CourseTopic = {
  slug: string;
  title: string;
  duration: string;
};

type CourseChapter = {
  title: string;
  summary: string;
  topics: CourseTopic[];
};

type LearningCourse = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  level: string;
  duration: string;
  icon: string;
  chapters: CourseChapter[];
  videoId?: string;
};

const slugify = (value: string) =>
  value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const makeChapters = (outlines: Array<[string, string, string[]]>): CourseChapter[] =>
  outlines.map(([title, summary, topics]) => ({
    title,
    summary,
    topics: topics.map((topic, index) => ({
      slug: slugify(topic),
      title: topic,
      duration: `${8 + index * 4} min`,
    })),
  }));

const textCourses: LearningCourse[] = [
  {
    slug: "embedded-c",
    title: "Embedded C Programming",
    shortTitle: "Embedded C",
    description: "Learn C from the perspective of memory, registers, peripherals, and constrained hardware.",
    level: "Beginner",
    duration: "6 weeks",
    icon: "code",
    chapters: makeChapters([
      ["Chapter 1 · The embedded mindset", "Understand how source code becomes instructions on a microcontroller.", ["How an embedded program runs", "Toolchains and the build pipeline", "Your first firmware project"]],
      ["Chapter 2 · Data and memory", "Use types deliberately and see where data lives.", ["Fixed-width integer types", "Stack, heap, and static memory", "Pointers and addresses"]],
      ["Chapter 3 · Registers and bits", "Control hardware safely with bitwise operations.", ["Binary and hexadecimal", "Bit masks and shifts", "Volatile and memory-mapped I/O"]],
      ["Chapter 4 · Reliable firmware", "Organize code that behaves predictably on real hardware.", ["Functions and modular drivers", "Timing without blocking", "Defensive programming"]],
      ["Chapter 5 · Debug and ship", "Inspect, test, and prepare firmware for deployment.", ["Reading compiler diagnostics", "Debugging with breakpoints", "Release build checklist"]],
    ]),
  },
  {
    slug: "stm32-foundations",
    title: "STM32 Foundations",
    shortTitle: "STM32",
    description: "Move from CubeIDE setup to GPIO, interrupts, timers, and serial communication.",
    level: "Beginner",
    duration: "5 weeks",
    icon: "chip",
    chapters: makeChapters([
      ["Chapter 1 · Board setup", "Build a clear mental model of the STM32 development workflow.", ["STM32 families and boards", "CubeIDE project setup", "Clock tree essentials"]],
      ["Chapter 2 · Digital I/O", "Read inputs and control outputs through GPIO.", ["GPIO output modes", "Pull-ups and input reading", "Debouncing a button"]],
      ["Chapter 3 · Interrupts", "Respond to external events without polling.", ["EXTI configuration", "Interrupt priorities", "Safe interrupt handlers"]],
      ["Chapter 4 · Timers", "Generate accurate timing and PWM signals.", ["Timer prescalers", "PWM output", "Input capture"]],
      ["Chapter 5 · Communication", "Connect the MCU to sensors and development tools.", ["UART logging", "SPI fundamentals", "I2C sensor readout"]],
    ]),
  },
  {
    slug: "freertos-practical",
    title: "Practical FreeRTOS",
    shortTitle: "FreeRTOS",
    description: "Design responsive firmware using tasks, queues, synchronization, and timing.",
    level: "Intermediate",
    duration: "6 weeks",
    icon: "clock",
    chapters: makeChapters([
      ["Chapter 1 · RTOS concepts", "Know when a scheduler helps and what it costs.", ["Super loop versus RTOS", "Tasks and scheduler states", "Priorities and preemption"]],
      ["Chapter 2 · Task design", "Create small tasks with clear responsibilities.", ["Creating and deleting tasks", "Delays and periodic work", "Stack sizing"]],
      ["Chapter 3 · Data flow", "Move information safely between execution contexts.", ["Queues", "Stream and message buffers", "Task notifications"]],
      ["Chapter 4 · Synchronization", "Protect shared resources and coordinate work.", ["Binary semaphores", "Mutexes and priority inversion", "Event groups"]],
      ["Chapter 5 · Production patterns", "Measure and improve real-time behavior.", ["Software timers", "Runtime statistics", "Debugging task failures"]],
    ]),
  },
  {
    slug: "iot-sensor-systems",
    title: "IoT Sensor Systems",
    shortTitle: "IoT Systems",
    description: "Turn sensor readings into dependable connected-device data pipelines.",
    level: "Intermediate",
    duration: "4 weeks",
    icon: "layers",
    chapters: makeChapters([
      ["Chapter 1 · Sensor signals", "Acquire useful measurements from physical sensors.", ["Analog and digital sensors", "Sampling and calibration", "Filtering noisy data"]],
      ["Chapter 2 · Device protocols", "Choose and implement a local device bus.", ["UART framing", "SPI transactions", "I2C addressing"]],
      ["Chapter 3 · Connectivity", "Connect constrained devices to a network.", ["Wi-Fi provisioning", "MQTT concepts", "Reconnect strategies"]],
      ["Chapter 4 · Cloud data", "Structure telemetry for storage and dashboards.", ["Telemetry payloads", "Topics and device identity", "Data visualization"]],
      ["Chapter 5 · Dependability", "Keep connected devices secure and maintainable.", ["Watchdogs and recovery", "Secure credentials", "OTA update planning"]],
    ]),
  },
];

const videoCourses: LearningCourse[] = [
  {
    ...textCourses[0],
    slug: "embedded-c-video",
    title: "Embedded C: Guided Video Course",
    description: "Code along with concise demonstrations covering the complete Embedded C workflow.",
    duration: "18 videos",
    videoId: "c7pi9-VQmLk",
  },
  {
    ...textCourses[1],
    slug: "stm32-video",
    title: "STM32 Hands-on Video Lab",
    description: "Follow visual, board-level labs from project setup through peripheral integration.",
    duration: "15 videos",
    videoId: "vKyL43qXPpk",
  },
  {
    ...textCourses[2],
    slug: "freertos-video",
    title: "FreeRTOS Visual Workshop",
    description: "Watch scheduling and communication patterns come alive with practical firmware demos.",
    duration: "16 videos",
    videoId: "w9UnrHldmX0",
  },
];

function CardButton({ href, children, secondary = false }: { href: string; children: ReactNode; secondary?: boolean }) {
  return <Link href={href} className={`button ${secondary ? "secondary" : ""}`}>{children}<Icon name="arrow" size={17} /></Link>;
}

function ProjectCard({ item }: { item: typeof projects[number] }) {
  return (
    <article className="project-card">
      <img src={item.image} alt={item.title} />
      <div className="card-body">
        <div className="tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="card-title">{item.title}</div>
        <p>{item.desc}</p>
        <Link href="/tutorials" className="text-link">Explore related learning <Icon name="arrow" size={16} /></Link>
      </div>
    </article>
  );
}

function SectionHead({ label, title, description, link }: { label: string; title: string; description?: string; link?: string }) {
  return <div className="section-head"><div><Label>{label}</Label><div className="section-title">{title}</div>{description && <p>{description}</p>}</div>{link && <Link href={link} className="text-link">View all <Icon name="arrow" size={16} /></Link>}</div>;
}

function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-overlay" />
        <div className="container home-content">
          <Label>Open-source embedded learning</Label>
          <div className="home-title">Build hardware.<br /><strong>Write firmware.</strong><br />Ship real systems.</div>
          <p>Practical projects and engineer-made tutorials for microcontrollers, IoT, and real-time systems.</p>
          <div className="button-row"><CardButton href="/tutorials">Explore Courses</CardButton><CardButton href="/resources" secondary>Browse Resources</CardButton></div>
          <div className="hero-stats">
            <div className="hero-stat"><i><Icon name="book" size={30} /></i><span><b>7</b><strong>Courses</strong><small>Learn step by step</small></span></div>
            <div className="hero-stat"><i><Icon name="layers" size={30} /></i><span><b>35</b><strong>Chapters</strong><small>In-depth tutorials</small></span></div>
            <div className="hero-stat"><i><Icon name="bolt" size={30} /></i><span><b>100%</b><strong>Open Learning</strong><small>Free for everyone</small></span></div>
          </div>
        </div>
        <div className="hero-feature-stack" aria-label="Learning areas">
          <div className="hero-feature microcontrollers"><i><Icon name="chip" size={26} /></i><span><b>Microcontrollers</b><small>Arduino · LPC1768 · STM32</small></span></div>
          <div className="hero-feature iot"><i><Icon name="layers" size={26} /></i><span><b>IoT</b><small>Sensors · MQTT · Cloud</small></span></div>
          <div className="hero-feature realtime"><i><Icon name="clock" size={26} /></i><span><b>Real-Time Systems</b><small>RTOS · Embedded C</small></span></div>
        </div>
        <div className="home-wave home-wave-one" />
        <div className="home-wave home-wave-two" />
      </section>
      <HomeAbout />
      <section className="section container">
        <SectionHead label="Applied Learning" title="Practice through real systems" description="Explore practical examples that connect embedded concepts to complete, observable system behavior." link="/projects" />
        <div className="card-grid">{projects.slice(0, 3).map((item) => <ProjectCard key={item.title} item={item} />)}</div>
      </section>
      <section className="section soft">
        <div className="container">
          <SectionHead label="Learning Path" title="Latest Modules" description="Step-by-step guides from register-level basics to production RTOS patterns." link="/tutorials" />
          <div className="module-grid">{modules.slice(0, 3).map((item) => <ModuleCard key={item.title} item={item} />)}</div>
        </div>
      </section>
      <WhyHarvegen />
      <Platforms />
      <CTA />
    </>
  );
}

function HomeAbout() {
  return (
    <section className="section home-about">
      <div className="container home-about-grid">
        <div className="about-visual">
          <img src="/vlsi%202.jpg" alt="Embedded hardware development" />
          <div className="about-image-small"><img src="/iot2.jpg" alt="Connected IoT systems" /></div>
          <div className="about-badge"><Icon name="code" size={22} /><span><b>MIT Licensed</b>Free to learn, build, and share</span></div>
        </div>
        <div className="about-copy">
          <Label>Who We Are</Label>
          <div className="section-title">Built for engineers,<br /><strong>by engineers.</strong></div>
          <p>Harvegen began as a personal notebook of microcontroller code and grew into an open-source learning platform for students, makers, and firmware developers worldwide.</p>
          <p>We turn complex embedded systems concepts into practical tutorials and complete projects you can build, debug, and understand from the register level up.</p>
          <div className="about-points">
            <span><i><Icon name="check" size={15} /></i> Tested source code</span>
            <span><i><Icon name="check" size={15} /></i> Buildable schematics</span>
            <span><i><Icon name="check" size={15} /></i> Engineer-written guides</span>
          </div>
          <CardButton href="/about">Read Our Story</CardButton>
        </div>
      </div>
    </section>
  );
}

function WhyHarvegen() {
  const values = [
    { icon: "bolt", number: "01", title: "Learn by building", text: "Every lesson connects to working hardware, so concepts become practical engineering skills." },
    { icon: "chip", number: "02", title: "Understand every layer", text: "Go beyond copy-and-paste code with register-level explanations, schematics, and debugging insight." },
    { icon: "code", number: "03", title: "Open for everyone", text: "Projects, source code, and learning resources stay free, accessible, and ready to adapt." },
  ];
  return (
    <section className="section why-section">
      <div className="why-orb why-orb-one" /><div className="why-orb why-orb-two" />
      <div className="container">
        <div className="why-heading">
          <div><Label>Why Harvegen</Label><div className="section-title">A better way to learn<br />embedded systems.</div></div>
          <p>We bridge the gap between classroom theory and production firmware with a practical, transparent approach to engineering education.</p>
        </div>
        <div className="why-grid">
          {values.map((value) => <article className="why-card" key={value.number}><span>{value.number}</span><div className="why-icon"><Icon name={value.icon} size={25} /></div><div className="card-title">{value.title}</div><p>{value.text}</p></article>)}
        </div>
        <div className="principle-strip">
          <div><Icon name="book" /><span><b>Practical first</b>Learn concepts through real projects</span></div>
          <div><Icon name="chart" /><span><b>Progressive depth</b>From fundamentals to production patterns</span></div>
          <div><Icon name="user" /><span><b>Community driven</b>Made for curious, hands-on engineers</span></div>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ item }: { item: typeof modules[number] }) {
  return <article className="module-card"><div className="module-icon"><Icon name={item.icon} /></div><span className="module-tag">{item.tag}</span><div className="card-title">{item.title}</div><p>{item.desc}</p><div className="module-meta"><span><Icon name="clock" size={15} /> {item.time}</span><b>{item.level}</b><Link href={item.href}>Continue <Icon name="arrow" size={15} /></Link></div></article>;
}

function Platforms() {
  const data = [
    ["LPC1768", "NXP ARM Cortex-M3 running at 100 MHz. The academic standard for bare-metal register-level programming.", "ARM · Cortex-M3"],
    ["STM32", "Industry-standard ARM Cortex-M4 platform with rich peripherals, HAL libraries, and RTOS support.", "ARM · Cortex-M4"],
    ["Arduino", "Beginner-friendly ATmega ecosystem with massive library support. Ideal for rapid prototyping.", "ATmega · Beginner"],
  ];
  return <section className="section container"><SectionHead label="Platforms" title="Microcontroller Platforms" description="Course topics organised around the hardware used in modern embedded development." /><div className="platform-grid">{data.map(([name, desc, meta]) => <article className="platform-card" key={name}><div className="platform-orb"><Icon name="chip" size={28} /></div><span>{meta}</span><div className="card-title">{name}</div><p>{desc}</p><Link href="/tutorials/text" className="text-link">Find related courses <Icon name="arrow" size={16} /></Link></article>)}</div></section>;
}

function CTA() {
  return <section className="cta"><div><Label>Start learning today</Label><div className="section-title">Ready to Understand Embedded Systems <strong>Deeply?</strong></div><p>Choose a structured course, learn at your pace, and use our supporting resources whenever you need them.</p><div className="button-row"><CardButton href="/tutorials/text">Start a Text Course</CardButton><CardButton href="/tutorials/video" secondary>Watch Video Courses</CardButton></div></div></section>;
}

function Tutorials() {
  return <><PageHero pathLabel="Tutorials" label="Learning, your way" title="Choose how you" accent="learn best" description="Read at your own pace or learn alongside guided video demonstrations." variant="wash"><div className="mini-stats"><span><b>7</b> Courses</span><span><b>35</b> Chapters</span></div></PageHero><LearningModePicker /><FormatCourseShowcase /><LearningJourney /><TutorialPaths /><TutorialLearningSupport /><TutorialExperience /><CTA /></>;
}

function LearningModePicker() {
  const modes = [
    { mode: "text", icon: "file", eyebrow: "Read & practice", title: "Text learning", description: "Structured explanations, code snippets, key ideas, and small exercises you can work through at your own pace.", meta: ["4 complete courses", "20 chapters", "Offline-friendly"] },
    { mode: "video", icon: "play", eyebrow: "Watch & build", title: "Video learning", description: "Guided demonstrations that show the tools, wiring, code, and debugging process as they happen.", meta: ["3 guided courses", "49 videos", "Hands-on demos"] },
  ];
  return (
    <section className="section mode-section">
      <div className="container">
        <SectionHead label="Select a format" title="Two clear ways to learn" description="Both formats follow the same structured path, so you can switch whenever it suits you." />
        <div className="mode-grid">
          {modes.map((item) => (
            <Link href={`/tutorials/${item.mode}`} className={`mode-card ${item.mode}`} key={item.mode}>
              <div className="mode-icon"><Icon name={item.icon} size={30} /></div>
              <div className="mode-copy"><span>{item.eyebrow}</span><div className="mode-title">{item.title}</div><p>{item.description}</p></div>
              <div className="mode-meta">{item.meta.map((meta) => <span key={meta}><Icon name="check" size={14} />{meta}</span>)}</div>
              <div className="mode-action">Browse {item.title.toLowerCase()} courses <Icon name="arrow" size={17} /></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FormatCourseShowcase() {
  const groups: Array<{ mode: LearningMode; label: string; title: string; description: string; note: string; icon: string; courses: LearningCourse[] }> = [
    {
      mode: "text",
      label: "01 · Read and practice",
      title: "Text learning",
      description: "Study with clear explanations, practical code patterns, and focused exercises. Lessons are organized for careful reading and easy reference while you build.",
      note: "Best for self-paced study and revisiting technical details.",
      icon: "file",
      courses: textCourses,
    },
    {
      mode: "video",
      label: "02 · Watch and build",
      title: "Video learning",
      description: "Follow visual demonstrations of development tools, firmware, wiring, and debugging. Pause each lesson and reproduce the workflow on your own hardware.",
      note: "Best for visual learning and hands-on follow-along practice.",
      icon: "play",
      courses: videoCourses,
    },
  ];
  return (
    <section className="section format-showcase">
      <div className="container">
        <SectionHead label="Explore the formats" title="See what you can learn in each format" description="Both experiences are structured around complete courses, five progressive chapters, and focused lessons." />
        <div className="format-showcase-list">
          {groups.map((group) => (
            <article className={`format-showcase-group ${group.mode}`} key={group.mode}>
              <div className="format-showcase-intro">
                <div className="showcase-icon"><Icon name={group.icon} size={27} /></div>
                <span>{group.label}</span>
                <div className="showcase-title">{group.title}</div>
                <p>{group.description}</p>
                <div className="showcase-note"><Icon name="check" size={15} />{group.note}</div>
                <Link href={`/tutorials/${group.mode}`} className="showcase-link">View all {group.mode} courses <Icon name="arrow" size={17} /></Link>
              </div>
              <div className="showcase-courses">
                <div className="showcase-courses-head"><span>Courses available</span><b>{group.courses.length} courses · {group.courses.length * 5} chapters</b></div>
                <div className="showcase-course-grid">
                  {group.courses.map((course, index) => (
                    <Link href={`/tutorials/${group.mode}/${course.slug}`} className="showcase-course-card" key={course.slug}>
                      <div className="showcase-course-top"><span>{String(index + 1).padStart(2, "0")}</span><Icon name={group.mode === "video" ? "play" : course.icon} size={18} /></div>
                      <b>{course.title}</b>
                      <small>{course.level} · 5 chapters</small>
                      <div>Open course <Icon name="arrow" size={14} /></div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function LearningJourney() {
  const steps = [
    { number: "01", icon: "layers", title: "Choose a format", text: "Start with text or video and switch whenever your learning needs change." },
    { number: "02", icon: "book", title: "Select a course", text: "Choose a focused goal such as Embedded C, STM32, or FreeRTOS." },
    { number: "03", icon: "menu", title: "Follow the chapters", text: "Move through five progressive chapters without losing your place." },
    { number: "04", icon: "bolt", title: "Apply and build", text: "Use every concept in code, debugging, and practical hardware exercises." },
  ];
  return (
    <section className="section learning-cycle">
      <div className="container">
        <div className="learning-cycle-head"><div><Label>How learning works</Label><div className="section-title">A clear path from first concept to working hardware.</div></div><p>Every Harvegen course follows the same simple rhythm. Understand the idea, observe it in practice, apply it yourself, and return whenever you need a reliable reference.</p></div>
        <div className="learning-cycle-steps">
          {steps.map((step, index) => (
            <article key={step.title}>
              <div className="cycle-icon"><Icon name={step.icon} size={22} /></div>
              <span>{step.number}</span>
              <b>{step.title}</b>
              <p>{step.text}</p>
              {index < steps.length - 1 && <div className="cycle-arrow"><Icon name="chevron" size={16} /></div>}
            </article>
          ))}
        </div>
        <div className="cycle-summary"><div><Icon name="check" size={17} /><span><b>Designed for steady progress</b>Short lessons, visible chapter structure, practical context, and a clear next step.</span></div><Link href="/tutorials/text">Start learning <Icon name="arrow" size={16} /></Link></div>
      </div>
    </section>
  );
}

function CourseLibrary({ mode }: { mode: LearningMode }) {
  const courses = mode === "text" ? textCourses : videoCourses;
  return (
    <>
      <section className="course-library-hero">
        <div className="container">
          <div className="course-breadcrumb"><Link href="/tutorials">Tutorials</Link><Icon name="chevron" size={14} /><span>{mode === "text" ? "Text learning" : "Video learning"}</span></div>
          <Label>{mode === "text" ? "Read · understand · practice" : "Watch · follow · build"}</Label>
          <div className="course-library-title">{mode === "text" ? "Learn deeply, at your own pace." : "See every step in action."}</div>
          <p>{mode === "text" ? "Clear, chapter-based courses with practical explanations and exercises." : "Focused video courses organized into short, progressive chapters."}</p>
        </div>
      </section>
      <section className="section container course-library">
        <SectionHead label={`${courses.length} available courses`} title={mode === "text" ? "Choose a reading course" : "Choose a video course"} description="Each course is organized into five chapters, from fundamentals to practical application." />
        <div className="course-card-grid">
          {courses.map((course, index) => (
            <Link href={`/tutorials/${mode}/${course.slug}`} className="course-card" key={course.slug}>
              <div className="course-card-top"><div className="course-number">0{index + 1}</div><div className="course-icon"><Icon name={mode === "video" ? "play" : course.icon} size={25} /></div></div>
              <span className="course-level">{course.level}</span>
              <div className="course-card-title">{course.title}</div>
              <p>{course.description}</p>
              <div className="course-card-meta"><span><Icon name="layers" size={15} />5 chapters</span><span><Icon name="clock" size={15} />{course.duration}</span></div>
              <div className="course-card-link">View course <Icon name="arrow" size={16} /></div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function CourseOverview({ mode, course }: { mode: LearningMode; course: LearningCourse }) {
  const [openChapter, setOpenChapter] = useState(0);
  return (
    <>
      <section className="course-overview-hero">
        <div className="container">
          <div className="course-breadcrumb"><Link href="/tutorials">Tutorials</Link><Icon name="chevron" size={14} /><Link href={`/tutorials/${mode}`}>{mode === "text" ? "Text courses" : "Video courses"}</Link><Icon name="chevron" size={14} /><span>{course.shortTitle}</span></div>
          <div className="overview-icon"><Icon name={mode === "video" ? "play" : course.icon} size={29} /></div>
          <div className="overview-heading"><div><Label>{course.level} course</Label><div className="course-overview-title">{course.title}</div><p>{course.description}</p></div><div className="overview-stats"><span><b>5</b>Chapters</span><span><b>{course.chapters.reduce((total, chapter) => total + chapter.topics.length, 0)}</b>Lessons</span><span><b>{course.duration}</b>Duration</span></div></div>
        </div>
      </section>
      <section className="section container chapter-section">
        <div className="chapter-intro"><div><Label>Course curriculum</Label><div className="section-title">Build your knowledge, chapter by chapter.</div></div><p>Open a chapter to see its lessons. Your progress is saved as you move through the course.</p></div>
        <div className="chapter-list">
          {course.chapters.map((chapter, index) => {
            const open = openChapter === index;
            return (
              <article className={`chapter-card ${open ? "open" : ""}`} key={chapter.title}>
                <div className="chapter-summary" role="button" tabIndex={0} aria-expanded={open} onClick={() => setOpenChapter(open ? -1 : index)} onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setOpenChapter(open ? -1 : index)}>
                  <div className="chapter-index">{String(index + 1).padStart(2, "0")}</div>
                  <div className="chapter-copy"><div className="chapter-title">{chapter.title}</div><p>{chapter.summary}</p><span>{chapter.topics.length} lessons · {chapter.topics.map((topic) => Number(topic.duration.split(" ")[0])).reduce((a, b) => a + b, 0)} min</span></div>
                  <div className="chapter-menu"><Icon name="chevron" /></div>
                </div>
                {open && <div className="chapter-topics">{chapter.topics.map((topic, topicIndex) => <Link href={`/tutorials/${mode}/${course.slug}/chapter-${index + 1}/${topic.slug}`} key={topic.slug}><span className="topic-index">{String(topicIndex + 1).padStart(2, "0")}</span><span><b>{topic.title}</b><small>{mode === "video" ? "Video lesson" : "Reading lesson"} · {topic.duration}</small></span><Icon name={mode === "video" ? "play" : "arrow"} size={18} /></Link>)}</div>}
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}

function LessonPage({ mode, course, chapterIndex, topicSlug }: { mode: LearningMode; course: LearningCourse; chapterIndex: number; topicSlug: string }) {
  const chapter = course.chapters[chapterIndex] ?? course.chapters[0];
  const topic = chapter.topics.find((item) => item.slug === topicSlug) ?? chapter.topics[0];
  const topicIndex = chapter.topics.findIndex((item) => item.slug === topic.slug);
  const nextTopic = chapter.topics[topicIndex + 1];
  const startSeconds = (chapterIndex * 3 + topicIndex) * 240;
  return (
    <div className="lesson-shell">
      <aside className="lesson-sidebar">
        <Link href={`/tutorials/${mode}/${course.slug}`} className="back-course"><Icon name="arrow" size={16} />Back to course</Link>
        <div className="sidebar-course"><span>{mode === "video" ? "Video course" : "Text course"}</span><b>{course.shortTitle}</b></div>
        <div className="sidebar-chapter">{chapter.title}</div>
        <nav className="lesson-nav">
          {chapter.topics.map((item, index) => <Link href={`/tutorials/${mode}/${course.slug}/chapter-${chapterIndex + 1}/${item.slug}`} className={item.slug === topic.slug ? "active" : ""} key={item.slug}><span>{String(index + 1).padStart(2, "0")}</span>{item.title}{item.slug === topic.slug && <Icon name="chevron" size={14} />}</Link>)}
        </nav>
        <div className="sidebar-progress"><span><b>Chapter progress</b><small>{topicIndex + 1} of {chapter.topics.length} lessons</small></span><div><i style={{ width: `${((topicIndex + 1) / chapter.topics.length) * 100}%` }} /></div></div>
      </aside>
      <main className="lesson-content">
        <div className="lesson-breadcrumb"><span>{chapter.title}</span><Icon name="chevron" size={13} /><b>{topic.title}</b></div>
        <div className="lesson-kicker">{mode === "video" ? "Video lesson" : "Reading lesson"} · {topic.duration}</div>
        <div className="lesson-title">{topic.title}</div>
        <p className="lesson-lead">Learn how {topic.title.toLowerCase()} fits into {course.shortTitle}, why it matters on real hardware, and how to apply it with a dependable workflow.</p>
        {mode === "video" ? (
          <>
            <div className="video-frame"><iframe src={`https://www.youtube-nocookie.com/embed/${course.videoId}?start=${startSeconds}`} title={`${topic.title} video lesson`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
            <div className="video-note"><Icon name="play" /><div><b>Follow along</b><p>Pause the lesson after each step and reproduce it in your own project. Keep your board disconnected while changing wiring.</p></div></div>
          </>
        ) : (
          <>
            <section className="lesson-block"><span className="lesson-label">Concept</span><div className="lesson-heading">Start with the mental model</div><p>In embedded systems, {topic.title.toLowerCase()} connects software decisions to physical behavior. Begin by identifying the input, the state your firmware owns, and the observable output. This makes the implementation easier to reason about and test.</p><p>Unlike desktop software, firmware operates with limited memory and timing constraints. Prefer explicit types, predictable control flow, and small interfaces that reveal exactly which hardware resource is being used.</p></section>
            <section className="lesson-callout"><Icon name="bolt" /><div><b>Key idea</b><p>Configure deliberately, change one variable at a time, and verify the result at the hardware boundary.</p></div></section>
            <section className="lesson-block"><span className="lesson-label">Practical workflow</span><div className="lesson-heading">Apply it in four steps</div><ol><li><b>Define the behavior.</b> Write down what should happen and under which conditions.</li><li><b>Inspect the hardware.</b> Confirm pins, registers, clocks, and electrical limits in the datasheet.</li><li><b>Implement the smallest test.</b> Prove one behavior before adding abstractions.</li><li><b>Measure the result.</b> Use logs, a debugger, logic analyzer, or multimeter instead of assumptions.</li></ol></section>
            <section className="code-sample"><div><span>firmware.c</span><small>Example pattern</small></div><pre><code>{`static bool system_ready = false;\n\nvoid setup_hardware(void) {\n  /* Configure the resource before use. */\n  system_ready = true;\n}\n\nvoid update_system(void) {\n  if (!system_ready) return;\n  /* Read, process, then update output. */\n}`}</code></pre></section>
            <section className="lesson-block"><span className="lesson-label">Check your understanding</span><div className="lesson-heading">Before moving on</div><div className="check-list">{["Explain the concept in your own words.", "Identify the hardware resource involved.", "Create one small test with an observable result."].map((item) => <span key={item}><Icon name="check" size={15} />{item}</span>)}</div></section>
          </>
        )}
        <div className="lesson-footer-nav"><Link href={`/tutorials/${mode}/${course.slug}`}><Icon name="chevron" size={16} />Course overview</Link>{nextTopic && <Link href={`/tutorials/${mode}/${course.slug}/chapter-${chapterIndex + 1}/${nextTopic.slug}`}><span><small>Next lesson</small>{nextTopic.title}</span><Icon name="arrow" size={18} /></Link>}</div>
      </main>
    </div>
  );
}

function TutorialPaths() {
  const paths = [
    { icon: "code", level: "Start here", title: "Build Your Foundation", text: "Begin with C, memory, registers, and the mental models that make later hardware topics easier to understand.", modules: "5 chapters", time: "4–6 weeks", topics: ["Embedded C", "Memory", "Registers"], href: "/tutorials/text/embedded-c" },
    { icon: "chip", level: "Build confidence", title: "Control Real Hardware", text: "Move into GPIO, interrupts, timers, and communication while working through a complete STM32 learning sequence.", modules: "5 chapters", time: "5 weeks", topics: ["STM32", "GPIO", "Peripherals"], href: "/tutorials/text/stm32-foundations" },
    { icon: "clock", level: "Go further", title: "Design Real-Time Systems", text: "Learn task design, data flow, synchronization, and the patterns behind responsive multi-tasking firmware.", modules: "5 chapters", time: "6 weeks", topics: ["FreeRTOS", "Queues", "Debugging"], href: "/tutorials/text/freertos-practical" },
  ];
  return (
    <section className="section tutorial-paths">
      <div className="container">
        <SectionHead label="Recommended next steps" title="Choose a path that matches your goal" description="You do not need to plan the entire journey. Pick the outcome you want now and follow the recommended course sequence." />
        <div className="path-grid">
          {paths.map((path, index) => <article className="path-card" key={path.title}><div className="path-top"><div className="path-icon"><Icon name={path.icon} size={24} /></div><span>0{index + 1}</span></div><div className="path-level">{path.level}</div><div className="card-title">{path.title}</div><p>{path.text}</p><div className="path-topics">{path.topics.map((topic) => <span key={topic}>{topic}</span>)}</div><div className="path-meta"><span><Icon name="book" size={15} /> {path.modules}</span><span><Icon name="clock" size={15} /> {path.time}</span></div><Link href={path.href} className="path-link">Start this path <Icon name="arrow" size={16} /></Link></article>)}
        </div>
      </div>
    </section>
  );
}

function TutorialLearningSupport() {
  const support = [
    ["book", "Clear prerequisites", "Every course tells you what to know, what tools you need, and where to start."],
    ["check", "Progress checkpoints", "Short chapter goals help you confirm understanding before moving forward."],
    ["code", "Practical examples", "Concepts are connected to firmware patterns, hardware behavior, and debugging decisions."],
    ["download", "Supporting resources", "Keep datasheets, references, and useful tools close to the lesson where they matter."],
  ];
  return (
    <section className="section learning-support">
      <div className="container">
        <SectionHead label="Support at every step" title="Everything you need to keep moving" description="The course experience is designed to reduce guesswork and help you focus on understanding one useful idea at a time." />
        <div className="learning-support-grid">
          {support.map(([icon, title, text], index) => <article key={title}><span>0{index + 1}</span><div><Icon name={icon} size={22} /></div><b>{title}</b><p>{text}</p></article>)}
        </div>
        <div className="support-resource-link"><div><Icon name="download" size={21} /><span><b>Need a datasheet or development tool?</b>Visit the resource library without leaving your learning flow.</span></div><Link href="/resources">Browse resources <Icon name="arrow" size={16} /></Link></div>
      </div>
    </section>
  );
}

function TutorialExperience() {
  const steps = [
    ["01", "Understand", "Start with the architecture, trade-offs, and core idea behind the lesson."],
    ["02", "Implement", "Write focused firmware with clear explanations for every important line."],
    ["03", "Test", "Use practical checks, serial output, and debugging methods to verify behavior."],
    ["04", "Reflect", "Review the result, identify what changed, and carry the pattern into the next lesson."],
  ];
  return (
    <section className="section tutorial-experience">
      <div className="container experience-grid">
        <div className="experience-copy">
          <Label>Inside Every Tutorial</Label>
          <div className="section-title">Learn the way embedded systems are actually built.</div>
          <p>Our tutorials connect theory to hardware. You will understand why an implementation works, how to verify it, and where it belongs in a larger system.</p>
          <div className="tutorial-includes">
            <span><Icon name="check" size={15} /> Tested source code</span>
            <span><Icon name="check" size={15} /> Circuit and pin diagrams</span>
            <span><Icon name="check" size={15} /> Debugging checkpoints</span>
            <span><Icon name="check" size={15} /> Practical exercises</span>
          </div>
          <CardButton href="/tutorials/text">Explore Text Courses</CardButton>
        </div>
        <div className="experience-steps">
          {steps.map(([number, title, text]) => <article key={number}><span>{number}</span><div><b>{title}</b><p>{text}</p></div></article>)}
        </div>
      </div>
    </section>
  );
}

function Projects() {
  const params = new URLSearchParams(window.location.search);
  const initFilter = (() => {
    const domain = params.get("domain");
    const level = params.get("level");
    if (domain === "iot") return "IoT";
    if (level === "intermediate") return "Intermediate";
    if (level === "advanced") return "Advanced";
    return "All";
  })();
  const [filter, setFilter] = useState(initFilter);
  const tabs = ["All", "Beginner", "Intermediate", "Advanced", "IoT", "STM32", "LPC", "Arduino"];
  const shown = projects.filter((project) => filter === "All" || project.tags.some((tag) => tag.toLowerCase().includes(filter.toLowerCase())));
  return <><PageHero pathLabel="Projects" label="Build Real Systems" title="Embedded" accent="Projects" description="Real-world projects with full source code, schematics, and step-by-step explanations."><div className="mini-stats"><span><b>6</b> Hands-on builds</span><span><b>3</b> Skill levels</span><span><b>3</b> MCU platforms</span></div></PageHero><ProjectDomains /><section className="section container project-list" id="project-library"><SectionHead label="Project Library" title="Find your next build" description="Filter by skill level, platform, or application area and start with a project that matches your goals." /><div className="filters">{tabs.map((tab) => <div key={tab} role="button" tabIndex={0} className={filter === tab ? "selected" : ""} onClick={() => setFilter(tab)} onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && setFilter(tab)}>{tab}</div>)}</div><div className="card-grid">{shown.map((item) => <ProjectCard key={item.title} item={item} />)}</div></section><ProjectBlueprint /><CTA /></>;
}

function ProjectDomains() {
  const domains = [
    { image: "/iot.jpeg", title: "IoT & Automation", text: "Connected sensors, cloud dashboards, and autonomous control.", meta: "3 projects", tag: "STM32 · Arduino" },
    { image: "/vlsi1.jpeg", title: "Safety & Monitoring", text: "Responsive systems that detect, measure, and alert in real time.", meta: "2 projects", tag: "LPC1768 · Sensors" },
    { image: "/vlsi%202.jpg", title: "Robotics & RTOS", text: "Multi-tasking firmware for motion, navigation, and control.", meta: "2 projects", tag: "FreeRTOS · STM32" },
    { image: "/iot3.jpg", title: "Connected Devices", text: "Practical device telemetry and wireless embedded workflows.", meta: "3 projects", tag: "IoT · Communication" },
  ];
  return (
    <section className="section project-domains">
      <div className="container">
        <SectionHead label="Explore by Domain" title="What do you want to build?" description="Browse practical systems grouped by the engineering problems they solve." />
        <div className="domain-grid">
          {domains.map((domain) => <Link href="#project-library" className="domain-card" key={domain.title}><img src={domain.image} alt={domain.title} /><div className="domain-overlay" /><div className="domain-content"><span>{domain.tag}</span><div className="card-title">{domain.title}</div><p>{domain.text}</p><b>{domain.meta} <Icon name="arrow" size={15} /></b></div></Link>)}
        </div>
      </div>
    </section>
  );
}

function ProjectBlueprint() {
  const included = [
    ["code", "Complete source code", "Organized, commented firmware that is ready to compile and adapt."],
    ["chip", "Circuit schematics", "Clear pin maps, wiring diagrams, and hardware integration notes."],
    ["book", "Step-by-step guide", "Architecture, setup, implementation, testing, and troubleshooting."],
    ["download", "Parts & resources", "Component lists, datasheets, tools, and downloadable project files."],
  ];
  const stages = [["01", "Plan"], ["02", "Wire"], ["03", "Code"], ["04", "Test"]];
  return (
    <section className="section blueprint-section">
      <div className="blueprint-grid-lines" />
      <div className="container">
        <div className="blueprint-heading">
          <div><Label>Project Blueprint</Label><div className="section-title">Everything needed to build with confidence.</div></div>
          <p>Every Harvegen project is documented as a complete engineering system—not just a code sample.</p>
        </div>
        <div className="blueprint-layout">
          <div className="included-grid">{included.map(([icon, title, text]) => <article key={title}><i><Icon name={icon} size={22} /></i><div><b>{title}</b><p>{text}</p></div></article>)}</div>
          <div className="build-flow">
            <span className="flow-label">A repeatable build process</span>
            <div className="flow-steps">{stages.map(([number, title], index) => <div key={number}><i>{number}</i><b>{title}</b>{index < stages.length - 1 && <span />}</div>)}</div>
            <div className="flow-result"><Icon name="check" size={18} /><span><b>Working system</b>Validated code, hardware, and documentation</span></div>
            <CardButton href="/resources">Browse Project Resources</CardButton>
          </div>
        </div>
      </div>
    </section>
  );
}

const mcuData = [
  { id: "lpc", title: "LPC1768 — NXP ARM Cortex-M3", sub: "32-bit Cortex-M3 at 100 MHz. Bare-metal register-level programming powerhouse.", image: "/vlsi1.jpeg", specs: [["Core", "ARM Cortex-M3"], ["Clock", "100 MHz"], ["Flash", "512 KB"], ["SRAM", "64 KB"], ["GPIO Pins", "70"], ["ADC", "12-bit, 8ch"], ["UART", "4× UART"], ["Supply", "3.3 V"]] },
  { id: "stm", title: "STM32 — ST ARM Cortex-M4", sub: "Industry-standard up to 168 MHz with FPU, 12-bit ADC, and a rich peripheral set.", image: "/vlsi%202.jpeg", specs: [["Core", "ARM Cortex-M4"], ["Clock", "168 MHz"], ["Flash", "1 MB"], ["SRAM", "192 KB"]] },
  { id: "arduino", title: "Arduino — ATmega Ecosystem", sub: "Beginner-friendly platform with massive library support and an approachable IDE.", image: "/iot3.jpg", specs: [["Core", "ATmega328P"], ["Clock", "16 MHz"], ["Flash", "32 KB"], ["SRAM", "2 KB"]] },
];

function Microcontrollers() {
  const params = new URLSearchParams(window.location.search);
  const family = params.get("family");
  useEffect(() => {
    if (!family) return;
    const idMap: Record<string, string> = { stm32: "stm", avr: "arduino", lpc: "lpc" };
    const targetId = idMap[family] ?? family;
    const el = document.getElementById(targetId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, []);
  return <><PageHero pathLabel="Microcontrollers" label="MCU Platforms" title="Microcontroller" accent="Platform Guide" description="Architecture, peripherals, specs, and curated tutorials + projects for each MCU family."><div className="hero-pills"><span>LPC1768</span><span>STM32</span><span>Arduino</span></div></PageHero><div className="container mcu-list">{mcuData.map((mcu, index) => <section className="mcu-section" id={mcu.id} key={mcu.id}><div className="mcu-heading"><img src={mcu.image} alt="" /><div><div className="section-title">{mcu.title}</div><p>{mcu.sub}</p></div></div><div className="spec-grid">{mcu.specs.map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b></div>)}</div><div className="split-block"><div><Label>{mcu.title.split(" ")[0]} Tutorials</Label><div className="card-title">{index === 0 ? "GPIO via PINSEL Registers" : index === 1 ? "STM32 GPIO & HAL Library" : "Arduino — Getting Started"}</div><p>Configure hardware, write clean firmware, and understand every line of code.</p><Link href="/tutorials" className="text-link">View tutorials <Icon name="arrow" size={16} /></Link></div><ProjectCard item={projects[index * 2]} /></div></section>)}</div></>;
}

const resourceGroups = [
  ["Source Code", "Complete Project Repositories", projects.slice(0, 4).map((p) => [p.title, "Full source code, schematics, and setup guide", "Download"])],
  ["Documentation", "MCU & Component Datasheets", [["LPC1768 User Manual — NXP UM10360", "Complete ARM Cortex-M3 reference · 840 pages", "Download PDF"], ["STM32F407 Reference Manual — ST RM0090", "Comprehensive STM32F407 reference · 1747 pages", "Download PDF"], ["ATmega328P Datasheet", "Official Arduino Uno microcontroller datasheet", "Download PDF"]]],
  ["Toolchain", "Recommended Development Tools", [["STM32CubeIDE", "Code generation, HAL libraries, and GDB debugger", "Get Started"], ["Keil µVision 5", "Industry-standard ARM IDE and debugging suite", "Get Started"], ["PlatformIO", "VS Code integration with support for 1000+ boards", "Get Started"]]],
];

function LegacyResources() {
  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  useEffect(() => {
    if (!type) return;
    const idMap: Record<string, string> = { datasheets: "res-documentation", toolchain: "res-toolchain", source: "res-source-code" };
    const el = document.getElementById(idMap[type] ?? "");
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  }, []);
  return <><PageHero pathLabel="Resources" label="Downloads" title="Free Resources" accent="& Downloads" description="Source code, datasheets, circuit schematics, and development tools. Everything you need — no sign-up required." /><section className="section container"><div className="github-banner"><div className="github-icon"><Icon name="code" size={28} /></div><div><div className="card-title">All Source Code is on GitHub</div><p>Every project and tutorial has a companion repository. Fork, clone, and contribute — MIT Licensed.</p><div className="button-row"><CardButton href="#">View on GitHub</CardButton><CardButton href="#" secondary>Download All</CardButton></div></div></div>{resourceGroups.map(([label, title, rows]) => <div className="resource-section" id={`res-${(label as string).toLowerCase().replace(/\s+/g, "-")}`} key={label as string}><SectionHead label={label as string} title={title as string} /> <div className="resource-grid">{(rows as string[][]).map(([name, desc, action]) => <article className="resource-card" key={name}><div className="resource-icon"><Icon name={action.includes("Download") ? "download" : "code"} /></div><div><div className="card-title">{name}</div><p>{desc}</p><Link href="#" className="text-link">{action} <Icon name="arrow" size={15} /></Link></div></article>)}</div></div>)}</section></>;
}

const resourceCollections = [
  {
    id: "documentation",
    label: "Official Documentation",
    title: "Datasheets & Reference Manuals",
    description: "Primary-source documentation for the processors and architectures used throughout Harvegen courses.",
    icon: "book",
    items: [
      { tag: "NXP · PDF", title: "LPC1768 User Manual", text: "Complete peripheral, register, memory, and electrical reference for the LPC176x family.", meta: "UM10360 · Official", action: "Open manual", href: "https://www.nxp.com/docs/en/user-guide/UM10360.pdf" },
      { tag: "ST · PDF", title: "STM32F407 Reference Manual", text: "Detailed architecture and peripheral reference for STM32F405 and STM32F407 devices.", meta: "RM0090 · Official", action: "Open manual", href: "https://www.st.com/resource/en/reference_manual/dm00031020.pdf" },
      { tag: "Microchip · PDF", title: "ATmega328P Datasheet", text: "CPU core, memory, GPIO, timers, ADC, and serial peripheral specifications.", meta: "Complete datasheet", action: "Open datasheet", href: "https://ww1.microchip.com/downloads/en/DeviceDoc/Atmel-7810-Automotive-Microcontrollers-ATmega328P_Datasheet.pdf" },
    ],
  },
  {
    id: "toolchain",
    label: "Development Environment",
    title: "Tools That Support the Workflow",
    description: "Reliable tools for writing, building, flashing, inspecting, and debugging embedded firmware.",
    icon: "code",
    items: [
      { tag: "IDE · Debugger", title: "STM32CubeIDE", text: "An integrated STM32 environment with code generation, compiler, and GDB debugging.", meta: "Windows · macOS · Linux", action: "Visit official site", href: "https://www.st.com/en/development-tools/stm32cubeide.html" },
      { tag: "Build System", title: "PlatformIO", text: "A cross-platform workflow for boards, libraries, environments, and reproducible builds.", meta: "VS Code · CLI", action: "Visit official site", href: "https://platformio.org/" },
      { tag: "Real-Time OS", title: "FreeRTOS Documentation", text: "Official kernel guides, API references, examples, and design guidance for real-time systems.", meta: "Kernel · API · Guides", action: "Browse documentation", href: "https://www.freertos.org/Documentation/RTOS_book.html" },
    ],
  },
  {
    id: "source-code",
    label: "Course Companions",
    title: "Code, Patterns & Learning References",
    description: "Course-linked material that helps you move from an explanation to a small, testable implementation.",
    icon: "layers",
    items: [
      { tag: "Embedded C", title: "Register & Memory Patterns", text: "Revisit pointers, volatile access, bit masks, and safe register-level coding patterns.", meta: "Beginner · 5 chapters", action: "Open companion course", href: "/tutorials/text/embedded-c" },
      { tag: "STM32", title: "Peripheral Setup Reference", text: "Keep GPIO, interrupts, timers, UART, SPI, and I2C workflows close at hand.", meta: "Beginner · 5 chapters", action: "Open companion course", href: "/tutorials/text/stm32-foundations" },
      { tag: "FreeRTOS", title: "Task & Synchronization Patterns", text: "Reference practical task, queue, semaphore, mutex, and event-group decisions.", meta: "Intermediate · 5 chapters", action: "Open companion course", href: "/tutorials/text/freertos-practical" },
    ],
  },
];

function ResourceCenter() {
  const handleResourceMount = (node: HTMLDivElement | null) => {
    if (!node) return;
    const type = new URLSearchParams(window.location.search).get("type");
    const idMap: Record<string, string> = { datasheets: "resource-documentation", toolchain: "resource-toolchain", source: "resource-source-code" };
    const targetId = window.location.hash.slice(1) || (type ? idMap[type] : "");
    if (targetId) setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
  };
  return (
    <div className="resource-page" ref={handleResourceMount}>
      <PageHero pathLabel="Resources" label="Your technical toolkit" title="Learn with the" accent="right references" description="Official documentation, dependable development tools, and course-linked references—organized around the way embedded engineers actually work." variant="wash">
        <div className="mini-stats"><span><b>9</b> Curated Resources</span><span><b>3</b> Focused Collections</span><span><b>100%</b> Free Access</span></div>
      </PageHero>
      <ResourceNavigator />
      <ResourceLibrary />
      <ResourceWorkflow />
      <ResourceStarterKits />
      <section className="resource-final-cta">
        <div className="container">
          <div><Label>Learn with context</Label><div className="section-title">Resources are most useful when they support a clear learning goal.</div><p>Choose a course first, then use these references to answer questions, verify behavior, and understand the hardware more deeply.</p></div>
          <div className="button-row"><CardButton href="/tutorials">Explore Courses</CardButton><CardButton href="/tutorials/video" secondary>Browse Video Learning</CardButton></div>
        </div>
      </section>
    </div>
  );
}

function ResourceNavigator() {
  const entries = [
    ["book", "Documentation", "Datasheets, processor manuals, and register references.", "#resource-documentation"],
    ["code", "Development tools", "IDEs, build systems, debuggers, and RTOS guidance.", "#resource-toolchain"],
    ["layers", "Course companions", "Focused patterns connected directly to your courses.", "#resource-source-code"],
  ];
  return (
    <section className="section resource-navigator">
      <div className="container">
        <SectionHead label="Find what you need" title="A smaller, more useful resource library" description="We prioritize authoritative references and practical tools instead of collecting links without context." />
        <div className="resource-nav-grid">
          {entries.map(([icon, title, text, href], index) => <Link href={href} className="resource-nav-card" key={title} onClick={() => { setTimeout(() => document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); }}><span>0{index + 1}</span><div><Icon name={icon} size={24} /></div><b>{title}</b><p>{text}</p><i>Browse collection <Icon name="arrow" size={15} /></i></Link>)}
        </div>
      </div>
    </section>
  );
}

function ResourceLibrary() {
  return (
    <section className="section resource-library">
      <div className="container">
        {resourceCollections.map((collection) => (
          <div className="resource-collection" id={`resource-${collection.id}`} key={collection.id}>
            <div className="resource-collection-head"><div><Label>{collection.label}</Label><div className="section-title">{collection.title}</div><p>{collection.description}</p></div><div><Icon name={collection.icon} size={28} /></div></div>
            <div className="resource-collection-grid">
              {collection.items.map((item) => <article className="resource-library-card" key={item.title}><div className="resource-card-icon"><Icon name={collection.icon} size={21} /></div><span>{item.tag}</span><div className="card-title">{item.title}</div><p>{item.text}</p><small>{item.meta}</small><Link href={item.href}>{item.action}<Icon name="arrow" size={15} /></Link></article>)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResourceWorkflow() {
  const steps = [
    ["01", "Learn the concept", "Begin inside a structured lesson so the resource has a clear purpose."],
    ["02", "Open the source", "Use the official manual to confirm registers, limits, and behavior."],
    ["03", "Implement and inspect", "Build with a dependable toolchain and observe the real result."],
    ["04", "Keep a reference", "Save the most useful page, pattern, or note for your next build."],
  ];
  return (
    <section className="section resource-workflow">
      <div className="container">
        <div className="resource-workflow-head"><div><Label>A dependable workflow</Label><div className="section-title">Use resources to answer better questions.</div></div><p>A manual is not a course, and a tool is not a method. Harvegen connects each resource to the stage where it becomes genuinely useful.</p></div>
        <div className="resource-workflow-steps">{steps.map(([number, title, text], index) => <article key={number}><span>{number}</span><b>{title}</b><p>{text}</p>{index < steps.length - 1 && <i><Icon name="chevron" size={16} /></i>}</article>)}</div>
      </div>
    </section>
  );
}

function ResourceStarterKits() {
  const kits = [
    { icon: "code", label: "Start from zero", title: "Embedded C Starter Kit", text: "A reading course, memory and register references, and a practical implementation sequence.", href: "/tutorials/text/embedded-c", action: "Start the foundation" },
    { icon: "chip", label: "Work with hardware", title: "STM32 Learning Kit", text: "A complete peripheral course paired with official STM32 documentation and CubeIDE.", href: "/tutorials/text/stm32-foundations", action: "Explore STM32" },
    { icon: "clock", label: "Build real-time systems", title: "FreeRTOS Learning Kit", text: "Structured RTOS lessons supported by official kernel documentation and practical patterns.", href: "/tutorials/text/freertos-practical", action: "Learn FreeRTOS" },
  ];
  return (
    <section className="section resource-kits">
      <div className="container">
        <SectionHead label="Curated starter kits" title="Course and resources, already matched" description="Choose a goal and begin with a focused set of material instead of searching across unrelated documentation." />
        <div className="resource-kit-grid">{kits.map((kit) => <article key={kit.title}><div><Icon name={kit.icon} size={24} /></div><span>{kit.label}</span><div className="card-title">{kit.title}</div><p>{kit.text}</p><Link href={kit.href}>{kit.action}<Icon name="arrow" size={16} /></Link></article>)}</div>
      </div>
    </section>
  );
}

function About() {
  const team = [["Arjun Reddy", "Founder & Lead Developer", "5+ years firmware development. Passionate about bare-metal programming and RTOS.", "/vlsi1.jpeg"], ["Sneha Nair", "IoT Specialist & Technical Writer", "IoT architect specialising in MQTT, cloud integration, and sensor networks.", "/iot2.jpg"], ["Karthik Patel", "Hardware & PCB Designer", "PCB design expert creating circuit schematics and hardware reference designs.", "/vlsi%202.jpeg"]];
  return <><PageHero pathLabel="About" label="Our Story" title="Built for Engineers," accent="By Engineers" description="Embedded Projects Hub started as a personal notebook of MCU code — and grew into an open-source learning platform used by students and developers worldwide."><div className="mini-stats"><span><b>Open</b> Community-driven</span><span><b>6</b> Hands-on projects</span><span><b>3</b> MCU ecosystems</span></div></PageHero><section id="mission" className="section container"><SectionHead label="Mission" title="Why We Built This" /><blockquote>"There were plenty of Hello World tutorials for microcontrollers, but almost no <strong>practical, project-based resources</strong> that bridge the gap between coursework and real-world firmware development."</blockquote><div className="story-grid"><p>We believe the best way to learn embedded systems is to <b>build real things</b>. Every tutorial is tied to a working project. Every line of code has a purpose.</p><p>Our goal is to create the most technically rigorous, accessible, and practical open-source embedded systems resource — completely free, forever.</p></div></section><AboutValues /><AboutJourney /><section id="team" className="section soft"><div className="container"><SectionHead label="Team" title="The People Behind EPHub" description="Meet the engineers and educators building the future of embedded systems learning." /><div className="team-grid">{team.map(([name, role, bio, image]) => <article className="team-card" key={name}><img src={image} alt={name} /><div className="card-title">{name}</div><b>{role}</b><p>{bio}</p></article>)}</div></div></section><section className="section container" id="contact"><SectionHead label="Contact" title="Get in Touch" description="Have a project to contribute? Found an error? Want to collaborate? We'd love to hear from you." /><div className="contact-box"><div><b>Email</b><span>hello@ephub.dev</span><b>GitHub</b><span>github.com/embedded-projects-hub</span></div><div className="fake-form"><span>Name</span><span>Email</span><span className="wide">Message</span><Link href="#" className="button">Send Message <Icon name="arrow" size={16} /></Link></div></div></section></>;
}

function AboutValues() {
  const values = [
    ["bolt", "Practical by default", "We teach through working systems, measurable behavior, and problems engineers actually encounter."],
    ["chip", "Technically rigorous", "Every concept is explained from the hardware upward, without hiding the details that make firmware reliable."],
    ["code", "Open and accessible", "Source code, schematics, and learning materials remain free to study, modify, and share."],
    ["user", "Community minded", "We welcome corrections, contributions, and new perspectives from learners and experienced engineers alike."],
  ];
  return (
    <section className="section values-section">
      <div className="container values-layout">
        <div className="values-intro"><Label>What We Stand For</Label><div className="section-title">Principles behind every lesson and project.</div><p>Harvegen is built around a simple standard: embedded education should be practical enough to use, rigorous enough to trust, and open enough to reach anyone.</p></div>
        <div className="values-grid">{values.map(([icon, title, text], index) => <article className="value-card" key={title}><span>0{index + 1}</span><i><Icon name={icon} size={23} /></i><div className="card-title">{title}</div><p>{text}</p></article>)}</div>
        <div className="values-action"><CardButton href="/tutorials">Explore Our Tutorials</CardButton></div>
      </div>
    </section>
  );
}

function AboutJourney() {
  const milestones = [
    ["2021", "A personal engineering notebook", "Register notes, driver experiments, and hardware fixes were organized into reusable references."],
    ["2022", "The first complete project guides", "Source code and schematics were published together so others could reproduce every build."],
    ["2024", "A structured learning platform", "Tutorials expanded into progressive paths across MCUs, protocols, IoT, and real-time systems."],
    ["Today", "Building an open knowledge base", "Harvegen continues to grow through practical projects, careful explanations, and community input."],
  ];
  return (
    <section className="section journey-about">
      <div className="journey-about-art"><span /><span /></div>
      <div className="container">
        <div className="journey-about-heading"><div><Label>Our Journey</Label><div className="section-title">From field notes to an open learning platform.</div></div><div className="impact-stats"><span><b>25+</b>Open projects</span><span><b>40+</b>Practical tutorials</span><span><b>3</b>MCU ecosystems</span></div></div>
        <div className="timeline">{milestones.map(([year, title, text]) => <article key={year}><div className="timeline-marker"><i /><span>{year}</span></div><div className="timeline-copy"><b>{title}</b><p>{text}</p></div></article>)}</div>
      </div>
    </section>
  );
}

function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [message, setMessage] = useState("");
  const progress: Array<[string, number]> = [["STM32", 75], ["Arduino", 90], ["FreeRTOS", 45], ["IoT", 60]];
  const achievements: Array<[string, string, boolean]> = [["First Steps", "Complete your first tutorial", true], ["Project Builder", "Complete 5 projects", true], ["MCU Master", "Learn 3 different microcontrollers", false], ["Week Streak", "Learn for 7 consecutive days", true], ["Resource Collector", "Download 10 resources", false]];

  if (!signedIn) {
    return (
      <section className="auth-page">
        <div className="auth-decoration" aria-hidden="true"><span /><span /></div>
        <div className="container auth-layout">
          <div className="auth-intro">
            <Label>{isCreatingAccount ? "Start learning with Harvegen" : "Your learning space"}</Label>
            <h1>{isCreatingAccount ? <>Your next step<br /><strong>starts here.</strong></> : <>Pick up where<br /><strong>you left off.</strong></>}</h1>
            <p>{isCreatingAccount ? "Create your learner profile to get started with courses, practical projects, and a clear path forward." : "Sign in to see your learning progress, recent activity, and achievements in one place."}</p>
            <div className="auth-steps">
              <div><span>01</span><i><Icon name="user" size={18} /></i><b>{isCreatingAccount ? "Create your profile" : "Enter your details"}</b><small>{isCreatingAccount ? "Add your name, email, and a password." : "Use an email and password to continue."}</small></div>
              <div><span>02</span><i><Icon name="check" size={18} /></i><b>{isCreatingAccount ? "Confirm your details" : "Preview your space"}</b><small>{isCreatingAccount ? "Confirm your password to continue." : "This demo opens a sample learner dashboard."}</small></div>
              <div><span>03</span><i><Icon name="chart" size={18} /></i><b>Keep learning</b><small>Explore courses, projects, and your progress.</small></div>
            </div>
          </div>
          <div className="auth-card">
            <div className="auth-card-heading">
              <div className="auth-card-icon"><Icon name={isCreatingAccount ? "check" : "user"} size={22} /></div>
              <span><h2>{isCreatingAccount ? "Create your account" : "Welcome back"}</h2><p>{isCreatingAccount ? "Set up your learner profile" : "Sign in to your learning account"}</p></span>
            </div>
            <form onSubmit={(event) => {
              event.preventDefault();
              if (isCreatingAccount && password !== confirmPassword) {
                setMessage("Passwords do not match. Please check and try again.");
                return;
              }
              if (isCreatingAccount) setName(name.trim());
              setPassword("");
              setConfirmPassword("");
              setMessage("");
              setSignedIn(true);
            }}>
              {isCreatingAccount && <>
                <label htmlFor="signup-name">Full name</label>
                <input id="signup-name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required />
              </>}
              <label htmlFor="signin-email">Email address</label>
              <input id="signin-email" type="email" autoComplete={isCreatingAccount ? "email" : "username"} placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <div className="auth-password-label"><label htmlFor="signin-password">Password</label>{!isCreatingAccount && <button type="button" onClick={() => setMessage("Password recovery is not connected in this demo.")}>Forgot password?</button>}</div>
              <input id="signin-password" type="password" autoComplete={isCreatingAccount ? "new-password" : "current-password"} placeholder={isCreatingAccount ? "At least 8 characters" : "Enter your password"} minLength={isCreatingAccount ? 8 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required />
              {isCreatingAccount && <>
                <label htmlFor="confirm-password">Confirm password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" placeholder="Re-enter your password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
              </>}
              {message && <p className="auth-feedback" role="status">{message}</p>}
              <button className="auth-submit" type="submit">{isCreatingAccount ? "Create account" : "Sign in"} <Icon name="arrow" size={17} /></button>
            </form>
            <div className="auth-demo-note"><Icon name="check" size={16} /><span><b>Demo {isCreatingAccount ? "account creation" : "sign-in"}</b>This preview does not save account details or connect to an authentication service.</span></div>
            <p className="auth-signup">
              {isCreatingAccount ? "Already have an account?" : "New to Harvegen?"}
              <button type="button" onClick={() => { setIsCreatingAccount(!isCreatingAccount); setPassword(""); setConfirmPassword(""); setMessage(""); }}>
                {isCreatingAccount ? "Sign in" : "Create an account"}
              </button>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <ProfileDashboard email={email} name={name} onSignOut={() => { setSignedIn(false); setPassword(""); setConfirmPassword(""); }} progress={progress} achievements={achievements} />;
}

function ProfileDashboard({ email, name, onSignOut, progress, achievements }: {
  email: string;
  name: string;
  onSignOut: () => void;
  progress: Array<[string, number]>;
  achievements: Array<[string, string, boolean]>;
}) {
  return <>
    <section className="profile-hero">
      <div className="container">
        <div className="profile-intro">
          <div className="avatar"><Icon name="user" size={48} /></div>
          <div>
            <div className="profile-name">{name || "Embedded Engineer"} <span>Intermediate</span></div>
            <p>{email}</p>
            <small>Demo learner dashboard</small>
          </div>
          <button type="button" className="profile-signout" onClick={onSignOut}>Sign out</button>
        </div>
        <div className="stat-grid">{[["Projects", "12"], ["Tutorials", "8"], ["Hours", "45 hours"], ["Streak", "7 days"]].map(([label, value]) => <div key={label}><span>{label}</span><b>{value}</b><i><Icon name={label === "Hours" ? "clock" : "bolt"} /></i></div>)}</div>
      </div>
    </section>
    <section className="profile-body">
      <div className="container profile-grid">
        <div>
          <article className="dashboard-card">
            <div className="section-title"><Icon name="chart" /> Learning Progress</div>
            <p>Track your progress across different embedded systems topics</p>
            <div className="progress-list">{progress.map(([name, value]) => <div key={name}><span><b>{name}</b><i>{value}%</i></span><div><i style={{ width: `${value}%` }} /></div></div>)}</div>
          </article>
          <article className="dashboard-card activity">
            <div className="section-title"><Icon name="clock" /> Recent Activity</div>
            {["Completed GPIO: Input, Output & EXTI Interrupts", "Started Smart Irrigation System", "Downloaded STM32 Schematics Pack"].map((x) => <p key={x}>{x}</p>)}
          </article>
        </div>
        <article className="dashboard-card achievements">
          <div className="section-title"><Icon name="book" /> Achievements</div>
          <p>Unlock milestones as you learn</p>
          {achievements.map(([title, text, done]) => <div className={done ? "done" : ""} key={title}><i><Icon name={done ? "check" : "chip"} /></i><span><b>{title}</b><small>{text}</small></span>{done && <strong>✓</strong>}</div>)}
        </article>
      </div>
    </section>
  </>;
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    document.addEventListener("click", (event) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (anchor?.origin === window.location.origin) {
        event.preventDefault();
        history.pushState({}, "", anchor.href);
        setPath(window.location.pathname);
        if (anchor.hash) {
          setTimeout(() => document.getElementById(anchor.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    });
    return () => window.removeEventListener("popstate", handler);
  }, []);
  const page = useMemo(() => {
    if (path.startsWith("/tutorials/")) {
      const parts = path.split("/").filter(Boolean);
      const mode = parts[1] as LearningMode;
      if (mode === "text" || mode === "video") {
        const courses = mode === "text" ? textCourses : videoCourses;
        if (!parts[2]) return <CourseLibrary mode={mode} />;
        const course = courses.find((item) => item.slug === parts[2]);
        if (course && parts[3]?.startsWith("chapter-") && parts[4]) {
          const chapterIndex = Math.max(0, Number(parts[3].replace("chapter-", "")) - 1);
          return <LessonPage mode={mode} course={course} chapterIndex={chapterIndex} topicSlug={parts[4]} />;
        }
        if (course) return <CourseOverview mode={mode} course={course} />;
      }
    }
    if (path === "/tutorials") return <Tutorials />;
    if (path.startsWith("/resources")) return <ResourceCenter />;
    if (path.startsWith("/projects")) return <Projects />;
    if (path.startsWith("/about")) return <About />;
    if (path.startsWith("/profile")) return <Profile />;
    return <Home />;
  }, [path]);
  return <AppLayout path={path}>{page}</AppLayout>;
}
