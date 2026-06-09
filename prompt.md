# 🎵 SampleHeaven — Frontend Build Prompt

> **Role**: You are a senior frontend developer building the complete frontend for **SampleHeaven**, a premium music sample-sharing platform. Follow every specification below exactly. The design must feel like a polished, production-ready product — not a prototype.

---

## 📐 PART 1 — DESIGN SYSTEM & GLOBAL TOKENS

### 1.1 Brand Identity
- **Name**: SampleHeaven
- **Tagline**: "Your Sound Starts Here"
- **Personality**: Modern, dark, premium, creator-focused — inspired by Splice, Loopcloud, and Landr but with a more community-driven, open feel
- **Logo**: Text-based logotype "SampleHeaven" — use a custom Google Font (e.g., **Outfit** bold 700) with a subtle audio waveform icon integrated into the "H" or placed before the text. The icon should be a 3-bar stylized waveform in the primary accent color.

### 1.2 Color Palette

Use HSL values for fine-tuned control. The overall theme is **dark mode first**.

| Token | HSL Value | Hex Approx | Usage |
|---|---|---|---|
| `--bg-primary` | `hsl(240, 15%, 8%)` | `#121318` | Page background |
| `--bg-secondary` | `hsl(240, 12%, 12%)` | `#1a1b23` | Cards, containers |
| `--bg-tertiary` | `hsl(240, 10%, 16%)` | `#24252e` | Elevated surfaces, modals |
| `--bg-hover` | `hsl(240, 10%, 20%)` | `#2e3039` | Hover states on cards |
| `--surface-glass` | `hsla(240, 15%, 20%, 0.6)` | — | Glassmorphism panels |
| `--accent-primary` | `hsl(265, 90%, 65%)` | `#8b5cf6` | Primary buttons, active states, links |
| `--accent-primary-hover` | `hsl(265, 90%, 55%)` | `#7c3aed` | Hover on primary accent |
| `--accent-secondary` | `hsl(185, 80%, 55%)` | `#22d3ee` | Secondary highlights, badges, waveform color |
| `--accent-gradient` | — | — | `linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))` |
| `--text-primary` | `hsl(0, 0%, 95%)` | `#f2f2f2` | Headings, primary text |
| `--text-secondary` | `hsl(240, 5%, 65%)` | `#a1a1aa` | Body text, descriptions |
| `--text-muted` | `hsl(240, 5%, 45%)` | `#6b6b76` | Captions, timestamps, metadata |
| `--border` | `hsl(240, 10%, 20%)` | `#2e3039` | Card borders, dividers |
| `--success` | `hsl(142, 70%, 50%)` | `#22c55e` | Upload success, available |
| `--warning` | `hsl(38, 95%, 55%)` | `#f59e0b` | Warnings, limits |
| `--error` | `hsl(0, 85%, 60%)` | `#ef4444` | Errors, delete actions |

### 1.3 Typography

Import from Google Fonts: `Outfit` (headings) and `Inter` (body).

| Element | Font | Weight | Size | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| H1 | Outfit | 700 | 56px / 3.5rem | 1.1 | -0.02em |
| H2 | Outfit | 600 | 40px / 2.5rem | 1.15 | -0.015em |
| H3 | Outfit | 600 | 28px / 1.75rem | 1.2 | -0.01em |
| H4 | Outfit | 500 | 22px / 1.375rem | 1.3 | 0 |
| Body Large | Inter | 400 | 18px / 1.125rem | 1.6 | 0 |
| Body | Inter | 400 | 16px / 1rem | 1.6 | 0 |
| Body Small | Inter | 400 | 14px / 0.875rem | 1.5 | 0 |
| Caption | Inter | 500 | 12px / 0.75rem | 1.4 | 0.02em |
| Button | Inter | 600 | 15px / 0.9375rem | 1 | 0.01em |
| Nav Link | Inter | 500 | 15px / 0.9375rem | 1 | 0 |

### 1.4 Spacing Scale
Use an 8px base grid: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 120` px.

### 1.5 Border Radius
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Tags, badges, small pills |
| `--radius-md` | 10px | Input fields, buttons |
| `--radius-lg` | 16px | Cards, modals |
| `--radius-xl` | 24px | Large feature cards |
| `--radius-full` | 9999px | Avatars, circular buttons, pills |

### 1.6 Shadows & Effects
```css
--shadow-sm: 0 1px 3px hsla(0,0%,0%,0.3);
--shadow-md: 0 4px 16px hsla(0,0%,0%,0.4);
--shadow-lg: 0 8px 32px hsla(0,0%,0%,0.5);
--shadow-glow: 0 0 20px hsla(265,90%,65%,0.3);       /* accent glow */
--shadow-glow-cyan: 0 0 20px hsla(185,80%,55%,0.25);  /* secondary glow */
--glass-bg: hsla(240,15%,20%,0.5);
--glass-border: 1px solid hsla(240,15%,40%,0.15);
--glass-blur: blur(16px);
```

### 1.7 Transitions & Animations
- **Default transition**: `all 0.25s cubic-bezier(0.4, 0, 0.2, 1)`
- **Hover scale**: `transform: scale(1.02)` on cards
- **Fade-in on scroll**: Use `IntersectionObserver` — elements enter with `opacity: 0 → 1` and `translateY(20px → 0)` over 500ms, staggered by 80ms per item
- **Waveform animation** (hero): CSS keyframes animating SVG wave paths or a `<canvas>` waveform with smooth oscillation
- **Counter animation** (stats): Count from 0 to target number over 2 seconds using `requestAnimationFrame`, triggered when section enters viewport
- **Skeleton loaders**: Pulsing placeholder blocks (`--bg-tertiary` to `--bg-hover` shimmer) shown before data loads
- **Button hover**: Slight scale(1.03), shadow-glow, and brightness increase
- **Play button pulse**: A subtle ring animation that expands outward from the play icon when audio is playing

### 1.8 Breakpoints
| Name | Width | Layout |
|---|---|---|
| Mobile | `< 640px` | Single column, stacked |
| Tablet | `640px – 1024px` | 2-column grids |
| Desktop | `1025px – 1440px` | Full layout, sidebar filters |
| Wide | `> 1440px` | Max container 1400px, centered |

### 1.9 Container & Grid
- **Max container width**: 1400px, centered with `auto` margins
- **Section padding**: 80px vertical (desktop), 48px vertical (mobile)
- **Grid**: CSS Grid with `auto-fill, minmax(280px, 1fr)` for sample cards
- **Gutter**: 24px

---

## 🧩 PART 2 — REUSABLE COMPONENTS

Build these as standalone, self-contained components. Each component must be fully styled, interactive, and responsive.

### 2.1 Navigation Bar (`<nav>`)
- **Position**: Fixed top, `z-index: 1000`
- **Background**: `var(--glass-bg)` with `backdrop-filter: var(--glass-blur)` and `var(--glass-border)` at the bottom
- **Height**: 72px (desktop), 64px (mobile)
- **Layout**:
  - Left: Logo (waveform icon + "SampleHeaven" text)
  - Center: Nav links — Browse, Upload, Packs, Pricing, Blog
  - Right: Search icon (opens expandable search), notification bell, user avatar dropdown (or "Sign In" / "Sign Up" if logged out)
- **Mobile**: Hamburger icon opens a full-screen overlay menu with links stacked vertically, centered, with staggered fade-in animation. Close button (×) top right.
- **Active state**: Active nav link has `var(--accent-primary)` color and a 2px bottom underline with accent gradient
- **Scroll behavior**: On scroll down > 50px, add a subtle `box-shadow: var(--shadow-sm)` and reduce padding slightly for a compact header

### 2.2 Sample Card
The most important reusable component on the platform. Used on homepage, browse, search results, category, and profile pages.

- **Size**: Responsive, min 280px wide
- **Background**: `var(--bg-secondary)` with `var(--border)` border, `var(--radius-lg)` corners
- **Layout** (top to bottom):
  1. **Waveform thumbnail area** (160px height): Display a stylized static waveform visualization in `var(--accent-secondary)` on transparent background. On hover, the waveform animates subtly. Overlay a centered **play/pause button** (48px circle, semi-transparent dark bg with accent border, ▶ icon).
  2. **Info section** (padding 16px):
     - **Title** (H4, `--text-primary`, 1 line truncated with ellipsis)
     - **Creator name** (Body Small, `--text-secondary`, with small avatar 20px circle inline) — clickable, navigates to creator profile
     - **Metadata row**: Horizontal flex with pill-shaped tags:
       - BPM badge (e.g., "128 BPM")
       - Key badge (e.g., "C Minor")
       - Type badge (e.g., "Loop" or "One-Shot")
       - Format badge (e.g., "WAV")
       - Use `var(--bg-tertiary)` background, `var(--text-muted)` text, `var(--radius-sm)` border-radius
  3. **Action row** (border-top `var(--border)`, padding 12px 16px):
     - Left: Download count (icon + number, `--text-muted`)
     - Right: **Download button** (small, `var(--accent-primary)` bg, white text, rounded) + **Save/Bookmark** icon button (heart or bookmark outline, toggles filled on click)
- **Hover state**: `transform: translateY(-4px)`, `box-shadow: var(--shadow-md)`, border transitions to `hsla(265,90%,65%,0.3)`
- **Playing state**: When audio is playing, add a glowing accent border and animate the waveform in the thumbnail area

### 2.3 Waveform Audio Player (Detail Page)
A full-width interactive audio waveform player for the sample detail page.

- **Container**: Full width of content area, 120px height, `var(--bg-secondary)` background, `var(--radius-lg)` rounded
- **Waveform**: Draw using `<canvas>` or SVG bars. Unplayed section: `var(--text-muted)` with 0.3 opacity. Played section: filled with `var(--accent-gradient)`. Bars should have 3px width and 2px gap.
- **Playhead**: A thin vertical line (2px) in `var(--accent-primary)` at current position
- **Interaction**: Click anywhere on the waveform to seek. Drag to scrub. Show time tooltip on hover (e.g., "0:14 / 0:32")
- **Controls below waveform**:
  - Play/Pause button (large, 56px circle, accent gradient background)
  - Current time / Total time display
  - Volume slider (horizontal, small)
  - Download button (primary)
  - Share button (icon)
  - Add to Library button (icon)
- **Loading state**: Show a skeleton shimmer waveform while loading

### 2.4 Genre Card
Used in "Browse by Genre" section.

- **Size**: Rectangular, aspect ratio ~16:10, min 200px wide
- **Background**: Full-bleed background image with dark gradient overlay (`linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)`)
- **Content**: Genre name in H3 (Outfit, white, bold) at bottom-left with 20px padding. Sample count below in Body Small (`--text-secondary`).
- **Hover**: Image scales to 1.05, gradient lightens slightly, text gets a subtle text-shadow glow
- **Border-radius**: `var(--radius-lg)`
- **Overlay icon**: A subtle music-note or waveform icon at top-right corner, 0.2 opacity, increases on hover

### 2.5 Creator Card
Used in "Featured Creators" section and search results.

- **Size**: 280px wide (or fluid in grid)
- **Layout**: Centered, vertical stack
  1. **Avatar** (80px circle, `var(--border)` ring, 3px accent gradient border on hover)
  2. **Username** (H4, `--text-primary`)
  3. **Bio excerpt** (Body Small, `--text-secondary`, 2 lines max, clipped)
  4. **Stats row**: "X Samples · Y Followers" in Caption style
  5. **Follow button**: Outline style (`var(--accent-primary)` border, transparent bg). On hover fills with accent. If already following, shows "Following ✓" with filled bg.
- **Background**: `var(--bg-secondary)`, `var(--radius-lg)`, `var(--border)` border
- **Hover**: Subtle lift `translateY(-4px)` and `box-shadow: var(--shadow-md)`

### 2.6 Pack Card (Staff Picks / Sample Packs)
- **Size**: Larger than sample cards — min 360px wide or spanning 2 grid columns
- **Layout**: Horizontal on desktop (image left, info right), vertical stack on mobile
  - Left: Cover art image (square, 200×200, `var(--radius-md)`)
  - Right:
    - Pack title (H3)
    - Creator name (with inline avatar)
    - Description (2 lines, `--text-secondary`)
    - Stats: "24 Samples · 12.4K Downloads"
    - Tags: genre pills
    - CTA: "Download Pack" button (primary, full width on mobile)
- **Background**: `var(--bg-secondary)` with subtle accent gradient border-left (4px)
- **Hover**: Same lift and shadow treatment as sample cards

### 2.7 Search Bar (Global)
- **Appearance**: Rounded input (`var(--radius-full)`), 48px height, `var(--bg-tertiary)` background, `var(--border)` border, search icon (🔍) left-padded inside
- **Placeholder**: "Search samples, loops, one-shots, SFX..." in `--text-muted`
- **Focus state**: Border transitions to `var(--accent-primary)`, `box-shadow: var(--shadow-glow)`
- **Hero version**: Wider (max 700px), 56px height, larger text
- **Autocomplete dropdown**: On typing, show a dropdown panel below with:
  - **Suggestions** grouped by: Samples, Packs, Creators, Tags
  - Each suggestion row: icon (type-specific) + title + secondary info
  - Keyboard navigation support (arrow keys, Enter to select)
  - `var(--bg-tertiary)` background, `var(--shadow-lg)` shadow, `var(--radius-lg)` corners

### 2.8 Filter Sidebar (Browse Page)
- **Position**: Fixed left sidebar on desktop (280px width), collapsible slide-in drawer on mobile
- **Background**: `var(--bg-secondary)` with `var(--border)` right border
- **Sections** (each collapsible with chevron toggle):
  1. **Type**: Checkbox group — Loop, One-Shot, SFX, MIDI, Vocal
  2. **Genre**: Checkbox group with search — Hip-Hop, Electronic, Lo-Fi, Cinematic, Pop, R&B, Trap, Ambient, Jazz, Rock
  3. **BPM Range**: Dual-handle range slider with numeric inputs (60–200). Track filled between handles with accent gradient.
  4. **Key**: Dropdown select — All keys + Major/Minor options
  5. **Format**: Checkbox group — WAV, MP3, MIDI, FLAC
  6. **License**: Toggle buttons — Free / Premium / All
  7. **Sort By**: Dropdown — Newest, Most Downloaded, Trending, Top Rated
- **Apply / Reset**: Sticky at bottom of sidebar. "Apply Filters" primary button + "Reset" text link.
- **Active filter count**: Show a badge circle with count on the filter toggle button (mobile)

### 2.9 Buttons
Define these button variants:

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `var(--accent-primary)` | white | none | `var(--accent-primary-hover)`, `shadow-glow`, scale(1.03) |
| Secondary / Outline | transparent | `var(--accent-primary)` | 1.5px `var(--accent-primary)` | fill bg with accent at 10% opacity |
| Ghost | transparent | `var(--text-secondary)` | none | bg `var(--bg-hover)` |
| Danger | `var(--error)` | white | none | darken 10% |
| Icon Button | `var(--bg-tertiary)` | `var(--text-secondary)` | `var(--border)` | bg `var(--bg-hover)`, text `var(--text-primary)` |

All buttons: `var(--radius-md)`, padding `12px 24px`, `font-weight: 600`, transition on all properties.

### 2.10 Tags / Badges / Pills
- **Background**: `var(--bg-tertiary)`
- **Text**: `var(--text-muted)`, Caption size
- **Padding**: `4px 10px`
- **Border-radius**: `var(--radius-sm)`
- **Hover** (if clickable): bg lightens, text `var(--text-primary)`
- **Accent variant** (for active/selected): `var(--accent-primary)` bg at 15% opacity, `var(--accent-primary)` text

### 2.11 Modal / Dialog
- **Backdrop**: `rgba(0,0,0,0.7)` with `backdrop-filter: blur(4px)`
- **Container**: Centered, max 560px wide, `var(--bg-tertiary)`, `var(--radius-xl)`, `var(--shadow-lg)`, padding 32px
- **Animation**: Fade in backdrop + modal scales from 0.95 → 1.0 with opacity 0 → 1
- **Close button**: Top-right × icon, Ghost style
- **Used for**: Login, signup, download confirmation, share, report

### 2.12 Toast / Notification
- **Position**: Fixed bottom-right, stacked vertically
- **Appearance**: `var(--bg-tertiary)`, `var(--radius-md)`, `var(--shadow-md)`, 12px padding, icon left + message + optional close button
- **Variants**: Success (green left border), Error (red left border), Info (accent left border)
- **Animation**: Slide in from right, auto-dismiss after 4 seconds

### 2.13 Form Inputs
- **Text input**: 48px height, `var(--bg-tertiary)` bg, `var(--border)` border, `var(--radius-md)`, `--text-primary` text, `--text-muted` placeholder
- **Focus**: border `var(--accent-primary)`, `shadow-glow`
- **Error state**: border `var(--error)`, red error message below (Body Small)
- **Label**: Body Small, `--text-secondary`, `font-weight: 500`, 6px margin-bottom
- **Textarea**: Same style, min-height 120px, resizable vertically
- **Select/Dropdown**: Same style as text input, with custom chevron icon right-aligned
- **Checkbox / Radio**: Custom styled using accent gradient for checked state
- **File Upload Zone**: 
  - Dashed border (`var(--border)`), `var(--bg-tertiary)` bg, `var(--radius-lg)`, 160px min-height
  - Center: Upload icon (cloud + arrow) in `--text-muted`, "Drag & drop your files here" text, "or browse" link in accent color
  - **Drag-over state**: Dashed border becomes accent color, background pulses slightly
  - **After upload**: Show file list with filename, size, and a remove (×) button

---

## 📄 PART 3 — PAGE-BY-PAGE BUILD SPECIFICATIONS

### Page 3.1 — Homepage (`index.html`)

Build all 11 sections in order. This is the most important page.

#### Section 1: Hero Banner
- **Full viewport height** (100vh) on initial load, min-height 600px
- **Background**: Dark base (`--bg-primary`) with an animated audio waveform canvas or SVG spanning the full width at 30% opacity. The waveform should animate with smooth sine-wave oscillations in `var(--accent-primary)` and `var(--accent-secondary)`.
- **Gradient overlay**: Radial gradient from center (`transparent`) to edges (`--bg-primary`) to create a vignette
- **Content** (centered vertically and horizontally, max-width 800px):
  - SampleHeaven logo (large, 40px font)
  - H1: **"Discover, Share & Download Free Audio Samples"** (56px, white, `letter-spacing: -0.02em`)
  - Subtitle: "Join 10,000+ producers sharing loops, one-shots, MIDI, and sound effects — all royalty-free" (Body Large, `--text-secondary`)
  - **Search bar** (hero variant, 56px tall, max-width 680px, centered)
  - **Popular searches**: Row of small clickable pills below search — "808 Drums", "Lo-Fi Piano", "Trap Hi-Hats", "Ambient Pads", "Vocal Chops"
  - **Two CTA buttons** below: "Explore Samples" (Primary) + "Start Uploading" (Outline)
  - **Trust signal strip**: "50,000+ Samples · 10,000+ Creators · 100% Royalty-Free" in Caption, `--text-muted`, centered
- **Scroll indicator**: Animated chevron-down icon bouncing at bottom center

#### Section 2: Quick Category Navigation
- **Background**: `var(--bg-primary)`
- **Layout**: Horizontal scrollable row of category pills/chips (or wrap on desktop)
- **Each pill**: Icon (SVG or emoji) + label text, `var(--bg-secondary)` bg, `var(--border)` border, `var(--radius-full)`, padding `10px 20px`
- **Hover**: bg `var(--bg-hover)`, border accent, icon color accent
- **Categories**: 🥁 Drum Loops · 🎹 Melodic Loops · 🎯 One-Shots · 🎸 Bass · 🎤 Vocals · 💥 SFX · 🎼 MIDI · 🌊 Ambient · 🎬 Foley
- **Scroll behavior**: Horizontal scroll on mobile with hidden scrollbar, fade edges

#### Section 3: Trending Samples
- **Section heading**: H2 "🔥 Trending Samples" left-aligned + "View All →" link right-aligned
- **Layout**: Horizontal scrollable carousel (CSS scroll-snap) with 4 visible cards on desktop, 1.2 on mobile
- **Cards**: Use Sample Card component (Section 2.2)
- **Carousel controls**: Left/right arrow buttons (Icon Button style) at edges, hidden on mobile
- **Data**: 8–12 sample cards with mock data (creative, realistic names and metadata)

#### Section 4: Curated Packs / Staff Picks
- **Section heading**: H2 "⭐ Staff Picks" + "View All Packs →"
- **Layout**: 2-column grid on desktop (each spanning full width), stacked on mobile
- **Cards**: Use Pack Card component (Section 2.6)
- **Visual**: A subtle "Staff Pick" badge (gold/amber accent) pinned at the top-right corner of each card
- **Data**: 4 mock packs with creative names, cover art placeholders, and descriptions

#### Section 5: Browse by Genre
- **Section heading**: H2 "Browse by Genre"
- **Layout**: CSS Grid, 5 columns on desktop (2 rows of 5), 2 columns on tablet, 1 column on mobile. First row items are taller (aspect 16:9), second row standard (16:10).
- **Cards**: Use Genre Card component (Section 2.4)
- **Genres** (10 total): Hip-Hop, Electronic, Lo-Fi, Cinematic, Pop, R&B, Trap, Ambient, Jazz, Rock
- **Images**: Use generated images or solid gradient backgrounds with genre-specific accent colors

#### Section 6: How It Works
- **Background**: `var(--bg-secondary)`, full-width strip
- **Section heading**: H2 "How It Works" (centered)
- **Layout**: 3 equal columns on desktop, stacked on mobile
- **Each step**:
  - Large icon in a 80px circle with accent gradient bg (Search 🔍, Headphones 🎧, Download ⬇️)
  - Step number: "01", "02", "03" in large Outfit font, `--text-muted`, 0.15 opacity, positioned behind the icon
  - Title (H4): "Search", "Preview", "Download"
  - Description (Body Small, `--text-secondary`): One sentence explaining the step
- **Connector lines**: On desktop, draw a subtle dashed line or gradient line connecting the three circles horizontally
- **Animation**: Each step fades in sequentially on scroll (stagger 200ms)

#### Section 7: Featured Creators
- **Section heading**: H2 "🎤 Featured Creators" + "View All →"
- **Layout**: 4-column grid on desktop, horizontal scroll on mobile
- **Cards**: Use Creator Card component (Section 2.5)
- **Data**: 4 mock creators with realistic producer usernames, bio excerpts, sample counts

#### Section 8: Recent Uploads
- **Section heading**: H2 "🆕 Latest Uploads" + "View All →"
- **Layout**: CSS Grid, 4 columns on desktop, 2 on tablet, 1 on mobile
- **Cards**: Use Sample Card component (Section 2.2)
- **Data**: 8 mock samples (different from Trending section)
- **Animation**: Cards fade in with stagger on scroll

#### Section 9: Community Stats
- **Background**: Full-width strip with the accent gradient as background at 8% opacity, creating a subtle colored band
- **Layout**: 4 equal columns, centered
- **Each stat**:
  - Large number (H1 size, Outfit, `--text-primary`, bold) — animates counting up from 0 when scrolled into view
  - Label below (Body Small, `--text-secondary`)
- **Stats**: "52,400+" Samples · "1.2M+" Downloads · "10,800+" Creators · "120+" Countries
- **Dividers**: Thin vertical lines (`--border`) between each stat on desktop

#### Section 10: Newsletter CTA
- **Background**: Accent gradient background (full bleed), or a dark bg with gradient border
- **Layout**: 2 columns on desktop — text left, form right. Stacked on mobile.
- **Left column**:
  - H2: "Get Weekly Sample Drops in Your Inbox"
  - Body: "Subscribe for curated packs, production tips, and exclusive freebies every week."
- **Right column**:
  - Email input + "Subscribe" button inline (same row), both 48px height
  - Below: "🎁 Get a free sample pack on signup" in Caption accent color
  - Privacy note: "We respect your inbox. Unsubscribe anytime." in Caption, `--text-muted`

#### Section 11: Footer
- **Background**: `var(--bg-secondary)`, top border `var(--border)`
- **Layout**: 4-column grid on desktop, 2 on tablet, stacked on mobile
- **Column 1** (Brand):
  - Logo
  - Short description (2 lines, `--text-secondary`)
  - Social icons row: Twitter/X, Instagram, YouTube, Discord, SoundCloud — icon buttons, `--text-muted`, hover `--accent-primary`
- **Column 2** (Explore): Browse, Categories, Trending, New Uploads, Sample Packs
- **Column 3** (Creators): Upload, Dashboard, Pricing, Community Guidelines
- **Column 4** (Support): Help Center, Contact, DMCA, Licensing, Terms, Privacy
- **Bottom bar**: Full width, `var(--border)` top border, flex between "© 2026 SampleHeaven. All rights reserved." and "Made with ♥ for producers everywhere"

---

### Page 3.2 — Browse / Explore (`browse.html`)

The main discovery page where users filter and browse the entire sample library.

- **Layout**: Sidebar (left, 280px, desktop) + main content area (right, fluid)
- **Sidebar**: Use Filter Sidebar component (Section 2.8). Collapsible on mobile (slide-in drawer triggered by a "Filters" button with filter icon and active filter count badge).
- **Top bar** (above grid, below nav):
  - **Breadcrumb**: Home > Browse (or Home > Category > Sub-category)
  - **Results count**: "Showing 1,248 samples" in `--text-secondary`
  - **View toggle**: Grid view (default) / List view — icon buttons
  - **Sort dropdown**: Right-aligned
- **Grid content**: CSS Grid of Sample Cards, `auto-fill, minmax(280px, 1fr)`, 24px gap
- **List view**: Each sample as a horizontal row — waveform mini-player (inline, 200px wide) + title + creator + metadata + actions. Alternating row bg for readability.
- **Pagination**: Bottom — show numbered page buttons + Previous/Next. Or implement infinite scroll with "Load More" button.
- **Empty state**: If no results match filters, show a friendly illustration, "No samples found" heading, suggestion to adjust filters, and link to browse all.

---

### Page 3.3 — Sample Detail (`sample.html`)

A dedicated page for a single sample with full audio player, metadata, and related content.

- **Layout**: Full-width hero area + 2-column content below (main left 65%, sidebar right 35%)
- **Hero section**:
  - Full-width Waveform Audio Player component (Section 2.3)
  - Below player: Title (H1), creator name (linked, with avatar), and action buttons inline (Download, Add to Library, Share, Report)
- **Main content (left column)**:
  - **Description**: User-provided text, markdown-rendered
  - **Metadata table** (styled, not a raw table):
    - Type, Genre, BPM, Key, Scale, Instrument, Format, File Size, Duration, Sample Rate, Bit Depth, License Type
    - Displayed as a 2-column key-value grid with `--bg-secondary` background
  - **Tags**: Row of clickable tag pills linking to search
  - **Comments section**:
    - Comment input (logged-in users) with avatar, textarea, and "Post" button
    - Comments list: avatar + username + timestamp + message. Threaded replies supported. Like button per comment.
- **Sidebar (right column)**:
  - **Creator info card**: Avatar (large, 64px), username, bio excerpt, sample count, follower count, "Follow" button, "View Profile" link
  - **More by this creator**: Vertical list of 3–5 Sample Cards (compact variant — smaller, no waveform, just title + type + BPM)
  - **Related samples**: Vertical list of 4–6 Sample Cards (compact) based on similar genre/tags
- **Download behavior**: On clicking "Download", if logged out → show login modal. If free user and limit reached → show upgrade modal. Otherwise → trigger download + show toast "Download started".

---

### Page 3.4 — Upload (`upload.html`)

The page where creators upload new samples. Requires authentication.

- **Layout**: Single centered column, max-width 720px
- **Page heading**: H1 "Upload Your Samples", subtitle "Share your sounds with the community"
- **Upload form** (use form input styles from Section 2.13):
  1. **File upload zone** (full width, 200px height): Drag & drop zone component. Accept `.wav, .mp3, .flac, .aiff, .mid`. Show accepted file types as helper text. Support multi-file upload (up to 10 files).
  2. **Uploaded files list**: After dropping, show each file as a row: filename, file size, file type icon, "×" remove button. If uploading a pack (>1 file), show a group container.
  3. **Per-file metadata** (shown for each uploaded file or as shared fields for a pack):
     - Title (text input, required)
     - Description (textarea, optional)
     - Type (segmented control: Loop | One-Shot | SFX | MIDI)
     - Genre (multi-select dropdown, required)
     - BPM (number input, shown only when Type = "Loop", auto-detect if possible)
     - Key (dropdown, shown for melodic types)
     - Tags (tag input — type and press Enter to add, max 10, shown as removable pills)
     - Instrument (tag input, optional)
  4. **License selection**: Radio group — "Free (Royalty-Free)" / "Premium" / "Custom" with description text for each
  5. **Cover art upload**: Small image upload zone (200×200px preview), optional, with crop/resize hint
  6. **Pack options** (if multiple files): Pack title, pack description
  7. **Terms checkbox**: "I confirm I own the rights to these samples and agree to the Terms of Service"
  8. **Submit button**: "Publish Sample" (primary, full width, large). Disabled until all required fields are filled.
- **Publishing flow**: On submit → show progress bar/spinner → on success → navigate to sample detail page with success toast
- **Draft saving**: Auto-save form state to localStorage. "Save as Draft" secondary button.

---

### Page 3.5 — Creator Profile (`profile.html`)

Public profile page for a creator.

- **Header section**: Full-width background with subtle gradient or banner image
  - **Avatar**: 120px circle, accent gradient border
  - **Username**: H1
  - **Bio**: Body, max 2-3 lines, `--text-secondary`
  - **Stats row**: "X Samples · Y Downloads · Z Followers" in Body Small
  - **Social links**: Icons for linked platforms (SoundCloud, Twitter, Instagram, YouTube)
  - **Actions**: "Follow" button (primary if not following, outline "Following ✓" if following) + "Share Profile" (ghost) + "Message" (ghost)
- **Tabs** below header:
  - **Samples** (default): Grid of Sample Cards showing all uploads
  - **Packs**: Grid of Pack Cards
  - **Favorites**: Grid of samples this creator has liked/saved
  - **About**: Extended bio, gear list, collaborators
- **Tab content**: Each tab loads a filtered grid below. Include sort options (Newest, Most Popular, Most Downloaded).
- **Empty tab state**: Friendly message + relevant CTA (e.g., "No packs yet. Create your first pack →")

---

### Page 3.6 — Pricing (`pricing.html`)

Clear, conversion-optimized pricing page.

- **Page heading**: H1 "Choose Your Plan" (centered), subtitle "Start free, upgrade when you're ready" (`--text-secondary`)
- **Toggle**: Monthly / Yearly with a "Save 20%" badge on yearly option
- **Pricing cards** (3 columns on desktop, stacked on mobile):

  | Feature | Free | Pro ($9.99/mo) | Studio ($19.99/mo) |
  |---|---|---|---|
  | Card style | `--bg-secondary` | Accent gradient border (highlighted, "Most Popular" badge) | `--bg-secondary` |
  | Downloads/day | 5 | Unlimited | Unlimited |
  | Upload limit | 50 samples | 500 samples | Unlimited |
  | Audio quality | MP3 only | WAV + MP3 | WAV + FLAC + MP3 |
  | Analytics | Basic | Advanced | Advanced + API |
  | Profile badge | — | ✨ Pro badge | ⚡ Studio badge |
  | Priority support | — | — | ✅ |
  | CTA | "Get Started Free" (outline) | "Go Pro" (primary, large, glowing) | "Go Studio" (primary) |

- **Feature comparison table**: Below cards, a full-width table listing all features with checkmarks (✓) and dashes (—). Alternate row striping with `--bg-secondary`.
- **FAQ section**: Below table, accordion-style Q&A (5-6 questions about billing, cancellation, what's included)
- **Bottom CTA**: "Still have questions? Contact us" link

---

### Page 3.7 — Auth Pages (`login.html`, `signup.html`, `forgot-password.html`)

#### Sign Up
- **Layout**: Centered card (max 480px), `--bg-secondary`, `--radius-xl`, `--shadow-lg`, padding 40px
- **Logo** at top, centered
- **Heading**: H2 "Create Your Account"
- **OAuth buttons** (top, full-width each):
  - "Continue with Google" (with Google icon)
  - "Continue with Discord" (with Discord icon)
- **Divider**: "or" centered between two horizontal lines
- **Form fields**: Username, Email, Password (with show/hide toggle + strength indicator), Account Type (segmented: Creator / Listener)
- **Terms checkbox**: "I agree to the Terms of Service and Privacy Policy" (links)
- **Submit**: "Create Account" (primary, full width)
- **Bottom**: "Already have an account? Log in" link
- **Background**: The page behind the card uses a subtle animated waveform at low opacity, same as hero

#### Log In
- Same card layout
- **Heading**: H2 "Welcome Back"
- OAuth buttons + divider
- **Fields**: Email/Username, Password (with show/hide)
- "Forgot Password?" link below password field
- **Submit**: "Log In" (primary, full width)
- "Don't have an account? Sign up" link

#### Forgot Password
- Same card layout
- **Heading**: H2 "Reset Your Password"
- **Description**: "Enter your email and we'll send you a reset link"
- **Field**: Email
- **Submit**: "Send Reset Link" (primary)
- "Back to Log In" link

---

### Page 3.8 — Contact (`contact.html`)

- **Layout**: 2 columns on desktop — form left (60%), info right (40%). Stacked on mobile.
- **Left column**: Contact/Support Form (Section 2.13 forms):
  - H1 "Get In Touch"
  - Fields: Name, Email, Subject (dropdown), Message (textarea), Attachment (optional file upload)
  - "Send Message" button (primary)
- **Right column**:
  - **Email**: support@sampleheaven.com (clickable mailto)
  - **Response time**: "We typically respond within 24 hours"
  - **FAQ shortcuts**: 3-4 common questions with links to help articles
  - **Social links**: icons
  - **DMCA notice**: "For copyright concerns, see our DMCA Policy"

---

### Page 3.9 — Blog / Resources (`blog.html`)

- **Page heading**: H1 "Blog & Resources"
- **Category tabs**: All, Production Tips, Tutorials, Creator Spotlights, News
- **Layout**: Featured post (large card, full-width, with large image + title + excerpt + author + date) on top. Below: 3-column grid of post cards.
- **Blog post card**:
  - Thumbnail image (aspect 16:9, `--radius-lg`)
  - Category badge (top-left of image)
  - Title (H4, 2 lines max)
  - Excerpt (Body Small, 2 lines, `--text-secondary`)
  - Author avatar + name + date (Caption)
  - Hover: image scale, card lift
- **Pagination**: Same as browse page
- **Sidebar** (optional, right column on desktop): Popular posts, Tags cloud, Newsletter CTA

---

### Page 3.10 — About (`about.html`)

- **Hero**: H1 "About SampleHeaven", centered, with subtitle about the mission
- **Mission section**: Large text block, beautifully typeset (Body Large), explaining the vision — open sound sharing, empowering creators, building community
- **Story section**: How and why the platform was started, timeline-style
- **Stats strip**: Same as homepage community stats section
- **Team section**: Grid of team member cards (avatar, name, role, short bio)
- **Values section**: 3-column grid of value cards (icon + title + description): "Community First", "Creator Empowerment", "Open Access"
- **Bottom CTA**: "Join the Community" button linking to signup

---

### Page 3.11 — My Library / Downloads (`library.html`)

User's private page showing their downloaded and saved samples. Requires auth.

- **Page heading**: H1 "My Library"
- **Tabs**: Downloads, Saved / Bookmarked, History
- **Each tab**: List/grid of Sample Cards with additional info:
  - Download date/time
  - "Re-download" button
  - "Remove from Library" button
- **Search within library**: Small search bar at top to filter own library
- **Empty state**: "Your library is empty. Start exploring →" with link to browse page

---

### Page 3.12 — Creator Dashboard (`dashboard.html`)

Private dashboard for creators to manage uploads and view analytics. Requires auth.

- **Sidebar navigation** (left, 240px):
  - Overview
  - My Uploads
  - Analytics
  - Earnings (if applicable)
  - Settings
- **Overview panel**:
  - Welcome message with username
  - Quick stats cards (row): Total Uploads, Total Downloads (of their samples), Total Plays, Followers
  - Recent activity feed: Latest downloads of their samples, new followers, comments
  - Quick upload CTA button
- **My Uploads panel**: Table/list view of all uploaded samples with columns:
  - Title, Type, Genre, Upload Date, Downloads, Plays, Status (Published/Draft/Under Review), Actions (Edit / Delete / Unpublish)
  - Bulk actions: Select multiple → Delete / Change License
  - Pagination
- **Analytics panel**:
  - Line chart: Downloads over time (last 7/30/90 days toggle)
  - Bar chart: Top 10 most downloaded samples
  - Pie chart: Downloads by genre
  - Geo map: Downloads by country (simplified)
  - Use CSS-drawn charts or simple SVG charts (no heavy chart library)

---

## 🎨 PART 4 — VISUAL POLISH & MICRO-INTERACTIONS

### 4.1 Page Transitions
- When navigating between pages, content fades out (200ms) and the new page fades in (300ms) from opacity 0 + translateY(10px)

### 4.2 Scroll Animations
- Use `IntersectionObserver` with `threshold: 0.15`
- Elements start with `opacity: 0; transform: translateY(30px)`
- Animate to `opacity: 1; transform: translateY(0)` over 600ms
- Stagger child elements by 80ms
- Apply to: Section headings, cards, stat numbers, how-it-works steps

### 4.3 Audio Player Interactions
- **Play button**: Ripple effect on click. Icon morphs from ▶ to ❚❚ with smooth transition
- **Waveform hover**: Show a time tooltip that follows the cursor along the waveform
- **Playing state**: Subtle glow around the player, waveform bars animate with a shimmer effect in the played region

### 4.4 Loading States
- **Skeleton screens**: Show for all card-based content. Use `--bg-secondary` base with a lighter shimmer animation (`--bg-hover` sweeping left to right)
- **Spinner**: Simple accent-colored circular spinner with `border` technique, 24px size
- **Progress bar**: Used during upload — thin horizontal bar, accent gradient, animated fill

### 4.5 Hover Effects Summary
| Element | Hover Effect |
|---|---|
| Sample Card | translateY(-4px), shadow-md, border-glow |
| Genre Card | Image scale(1.05), text glow |
| Creator Card | translateY(-4px), shadow-md |
| Button (primary) | scale(1.03), shadow-glow, brightness(1.1) |
| Button (outline) | fill with accent at 10% opacity |
| Nav link | accent color, underline slide-in from left |
| Tag/pill | bg lighten, text lighten |
| Icon button | bg lighten, icon color lighten |
| Footer link | accent color, slight translateX(2px) |

### 4.6 Focus States (Accessibility)
- All interactive elements must have visible focus rings: `outline: 2px solid var(--accent-primary); outline-offset: 2px;`
- Use `:focus-visible` only (not `:focus`) to avoid showing focus rings on click

### 4.7 Dark Mode Considerations
- The design is dark-mode-first. All colors are already defined for dark mode.
- If implementing a light mode toggle (optional):
  - Swap `--bg-primary` → `hsl(0,0%,98%)`, `--bg-secondary` → `hsl(0,0%,100%)`, etc.
  - Swap text colors: `--text-primary` → `hsl(240,10%,10%)`, etc.
  - Use `prefers-color-scheme` media query + toggle in nav
  - Store preference in `localStorage`

---

## 📱 PART 5 — RESPONSIVE DESIGN SPECIFICATIONS

### 5.1 Mobile-First Approach
Write CSS mobile-first, then use `min-width` media queries to layer on tablet/desktop styles.

### 5.2 Key Responsive Behaviors

| Component | Mobile (< 640px) | Tablet (640–1024px) | Desktop (> 1024px) |
|---|---|---|---|
| **Nav** | Hamburger + overlay menu | Same as mobile | Full horizontal nav |
| **Hero** | Smaller H1 (32px), stacked CTAs, search full-width | H1 40px | H1 56px, side-by-side CTAs |
| **Category pills** | Horizontal scroll, single row | Wrap 2 rows | Wrap, centered |
| **Sample cards** | 1 column, full width | 2-column grid | 3-4 column grid |
| **Genre grid** | 1 column stacked | 2 columns | 5 columns (2 rows) |
| **How it Works** | Stacked vertical | 3 columns | 3 columns with connectors |
| **Creator cards** | Horizontal scroll | 2-column grid | 4-column grid |
| **Stats** | 2×2 grid | 4-column row | 4-column row |
| **Newsletter** | Stacked (text, then form) | 2 columns | 2 columns |
| **Footer** | Stacked single column | 2-column grid | 4-column grid |
| **Filter sidebar** | Slide-in drawer from left | Slide-in drawer | Fixed sidebar |
| **Sample detail** | Single column, stacked | Single column | 2 columns (65/35) |
| **Pricing cards** | Stacked | 3 columns | 3 columns |
| **Auth cards** | Full width with padding | Centered 480px | Centered 480px |
| **Dashboard** | Bottom tab nav, no sidebar | Collapsible sidebar | Fixed sidebar |

### 5.3 Touch Targets
- Minimum touch target: 44×44px for all interactive elements on mobile
- Increase button padding on mobile
- Ensure dropdowns and selects are large enough to tap

### 5.4 Performance on Mobile
- Lazy-load all images and waveform canvases below the fold
- Use `loading="lazy"` for images
- Reduce animation complexity on mobile (use `prefers-reduced-motion` media query to disable non-essential animations)
- Defer non-critical JavaScript

---

## 📂 PART 6 — FILE STRUCTURE

```
sampleheaven/
├── index.html                 # Homepage
├── browse.html                # Browse / Explore page
├── sample.html                # Sample Detail page
├── upload.html                # Upload page
├── profile.html               # Creator Profile page
├── pricing.html               # Pricing page
├── login.html                 # Log In page
├── signup.html                # Sign Up page
├── forgot-password.html       # Forgot Password page
├── contact.html               # Contact page
├── blog.html                  # Blog listing page
├── about.html                 # About page
├── library.html               # My Library / Downloads page
├── dashboard.html             # Creator Dashboard page
├── css/
│   ├── variables.css          # Design tokens (colors, fonts, spacing, shadows)
│   ├── reset.css              # CSS reset / normalize
│   ├── base.css               # Base typography, body, links, global styles
│   ├── components.css         # All reusable components (nav, cards, buttons, inputs, modals, toasts)
│   ├── layout.css             # Grid system, containers, responsive utilities
│   ├── animations.css         # Keyframes, scroll animations, transitions
│   ├── pages/
│   │   ├── homepage.css       # Homepage-specific styles
│   │   ├── browse.css         # Browse page styles
│   │   ├── sample-detail.css  # Sample detail page styles
│   │   ├── upload.css         # Upload page styles
│   │   ├── profile.css        # Profile page styles
│   │   ├── pricing.css        # Pricing page styles
│   │   ├── auth.css           # Auth pages (login, signup, forgot-password)
│   │   ├── contact.css        # Contact page styles
│   │   ├── blog.css           # Blog page styles
│   │   ├── about.css          # About page styles
│   │   ├── library.css        # My Library page styles
│   │   └── dashboard.css      # Dashboard page styles
├── js/
│   ├── main.js                # Global initialization, nav, scroll animations, theme
│   ├── audio-player.js        # Waveform player logic, audio playback
│   ├── search.js              # Search autocomplete, filter logic
│   ├── upload.js              # Upload form, drag-and-drop, file validation
│   ├── carousel.js            # Horizontal scroll carousels
│   ├── counter.js             # Animated stat counters
│   ├── modal.js               # Modal/dialog management
│   ├── toast.js               # Toast notification system
│   ├── tabs.js                # Tab switching logic
│   ├── filters.js             # Filter sidebar logic, URL params sync
│   └── forms.js               # Form validation, newsletter signup
├── assets/
│   ├── images/
│   │   ├── logo.svg           # SampleHeaven logo
│   │   ├── logo-icon.svg      # Waveform icon only
│   │   ├── genres/            # Genre background images (10 images)
│   │   ├── avatars/           # Mock creator avatars
│   │   ├── packs/             # Mock pack cover art
│   │   └── icons/             # Category icons, UI icons
│   └── fonts/                 # If self-hosting (optional with Google Fonts)
└── README.md
```

---

## 🔧 PART 7 — TECHNICAL REQUIREMENTS

### 7.1 HTML Standards
- Use semantic HTML5: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`
- Every page has a unique `<title>` and `<meta name="description">`
- Single `<h1>` per page, proper heading hierarchy
- All interactive elements have unique `id` attributes
- All images have `alt` text
- Use `<button>` for actions, `<a>` for navigation — never mix
- ARIA labels on icon-only buttons (e.g., `aria-label="Play sample"`)

### 7.2 CSS Standards
- No frameworks (no Tailwind, no Bootstrap). Vanilla CSS only.
- Use CSS Custom Properties (variables) for all design tokens
- Mobile-first media queries (`min-width`)
- Use CSS Grid and Flexbox for layouts (no floats)
- Use `clamp()` for fluid typography where appropriate
- BEM-like naming convention: `.sample-card`, `.sample-card__title`, `.sample-card--playing`

### 7.3 JavaScript Standards
- Vanilla JavaScript only (no React, no jQuery)
- ES6+ syntax: `const/let`, arrow functions, template literals, destructuring
- Use `IntersectionObserver` for scroll-triggered animations and lazy loading
- Use `Web Audio API` for audio playback and waveform rendering
- Event delegation where appropriate
- Store user preferences (theme, volume) in `localStorage`
- Handle keyboard navigation for accessibility (Tab, Enter, Escape)

### 7.4 Performance Targets
- Lighthouse Performance score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Total page weight: < 1MB (excluding audio files)
- Minimize HTTP requests — consider combining CSS files for production

### 7.5 Accessibility (WCAG 2.1 AA)
- Color contrast ratio: minimum 4.5:1 for body text, 3:1 for large text
- Visible focus indicators on all interactive elements
- Screen-reader compatible: ARIA labels, roles, and live regions
- Reduced motion support via `prefers-reduced-motion`
- Keyboard-navigable: all features accessible without a mouse

### 7.6 SEO
- Schema.org structured data: `MusicRecording`, `AudioObject` on sample pages
- Open Graph meta tags on every page (title, description, image, URL)
- Canonical URLs on all pages
- Semantic heading hierarchy
- Descriptive URL slugs

---

## 📝 PART 8 — MOCK DATA

Use the following realistic mock data throughout the frontend. This ensures the UI looks authentic and populated.

### 8.1 Sample Data (use across all pages)

```
1. Title: "Midnight 808 Punch"        | Creator: KVNG Beats    | Type: One-Shot | Genre: Trap      | BPM: —   | Key: C  | Format: WAV | Downloads: 14,302
2. Title: "Lo-Fi Jazz Piano Loop"     | Creator: ChillWave     | Type: Loop     | Genre: Lo-Fi     | BPM: 85  | Key: Dm | Format: WAV | Downloads: 9,847
3. Title: "Cinematic Tension Riser"   | Creator: SoundForge    | Type: SFX      | Genre: Cinematic | BPM: —   | Key: —  | Format: WAV | Downloads: 7,221
4. Title: "Trap Hi-Hat Pattern 01"    | Creator: 808Mafia_Fan  | Type: Loop     | Genre: Trap      | BPM: 140 | Key: —  | Format: WAV | Downloads: 12,540
5. Title: "Ambient Pad - Ethereal"    | Creator: NebulaSounds  | Type: Loop     | Genre: Ambient   | BPM: 70  | Key: Gm | Format: FLAC| Downloads: 5,100
6. Title: "Funky Bass Groove"         | Creator: GrooveMaster  | Type: Loop     | Genre: R&B       | BPM: 110 | Key: Eb | Format: WAV | Downloads: 6,890
7. Title: "Vocal Chop - Heavenly"     | Creator: VoxLab        | Type: One-Shot | Genre: Pop       | BPM: —   | Key: Ab | Format: MP3 | Downloads: 11,200
8. Title: "Drill Slide Bass"          | Creator: UKDrillBeats  | Type: One-Shot | Genre: Hip-Hop   | BPM: —   | Key: F  | Format: WAV | Downloads: 18,700
9. Title: "Synthwave Arpeggio"        | Creator: RetroWaveX    | Type: Loop     | Genre: Electronic| BPM: 120 | Key: Am | Format: WAV | Downloads: 8,330
10. Title: "Foley Rain on Window"     | Creator: FieldRecPro   | Type: SFX      | Genre: Foley     | BPM: —   | Key: —  | Format: WAV | Downloads: 4,560
11. Title: "Neo Soul Keys"            | Creator: KeysMaster    | Type: Loop     | Genre: Jazz      | BPM: 95  | Key: Bb | Format: WAV | Downloads: 7,100
12. Title: "Future Bass Chord Stack"  | Creator: WaveformX     | Type: MIDI     | Genre: Electronic| BPM: 150 | Key: Cm | Format: MIDI| Downloads: 9,950
13. Title: "Acoustic Guitar Strum"    | Creator: StringTheory  | Type: Loop     | Genre: Pop       | BPM: 100 | Key: G  | Format: WAV | Downloads: 6,400
14. Title: "Dark Ambient Drone"       | Creator: VoidSounds    | Type: Loop     | Genre: Ambient   | BPM: 60  | Key: Em | Format: FLAC| Downloads: 3,200
15. Title: "Boom Bap Drum Break"      | Creator: ClassicBeats  | Type: Loop     | Genre: Hip-Hop   | BPM: 90  | Key: —  | Format: WAV | Downloads: 15,800
16. Title: "Cinematic Whoosh"         | Creator: SoundForge    | Type: SFX      | Genre: Cinematic | BPM: —   | Key: —  | Format: WAV | Downloads: 22,100
```

### 8.2 Creator Data

```
1. KVNG Beats     | 142 Samples | 3,200 Followers | Bio: "Trap & hip-hop producer from Atlanta. Making beats since 2015."
2. ChillWave      | 89 Samples  | 2,100 Followers | Bio: "Lo-fi beats and jazzy textures. Coffee and vinyl vibes."
3. SoundForge     | 234 Samples | 5,800 Followers | Bio: "Professional sound designer for film & TV. 10+ years experience."
4. NebulaSounds   | 67 Samples  | 1,400 Followers | Bio: "Ambient soundscapes and ethereal textures from outer space."
5. VoxLab         | 112 Samples | 2,900 Followers | Bio: "Vocal processing wizard. Chops, harmonies, and FX."
6. GrooveMaster   | 78 Samples  | 1,800 Followers | Bio: "Funk, soul, and R&B grooves. All live-recorded instruments."
```

### 8.3 Pack Data

```
1. "Midnight Trap Essentials"    | Creator: KVNG Beats   | 24 Samples | 12,400 Downloads | Genre: Trap
2. "Lo-Fi Bedroom Sessions"     | Creator: ChillWave    | 18 Samples | 8,900 Downloads  | Genre: Lo-Fi
3. "Cinematic Sound Design Vol.1"| Creator: SoundForge   | 32 Samples | 15,200 Downloads | Genre: Cinematic
4. "Ambient Textures Collection" | Creator: NebulaSounds | 20 Samples | 6,100 Downloads  | Genre: Ambient
```

### 8.4 Blog Post Data

```
1. "10 Tips for Chopping Samples Like a Pro"    | Category: Production Tips  | Author: KVNG Beats   | Date: May 28, 2026
2. "The Ultimate Guide to Lo-Fi Production"     | Category: Tutorial         | Author: ChillWave    | Date: May 25, 2026
3. "Creator Spotlight: SoundForge"               | Category: Spotlight        | Author: SampleHeaven | Date: May 22, 2026
4. "Free vs. Premium: Understanding Licensing"  | Category: News             | Author: SampleHeaven | Date: May 20, 2026
5. "How to Build Your Own Sample Pack"          | Category: Tutorial         | Author: VoxLab       | Date: May 18, 2026
6. "Best Free DAWs for Beginners in 2026"       | Category: Tool Reviews     | Author: SampleHeaven | Date: May 15, 2026
```

---

## ✅ PART 9 — BUILD ORDER

Execute in this exact sequence:

1. **Set up file structure** — Create all directories and empty files
2. **CSS Design System** — Build `variables.css`, `reset.css`, `base.css` with all tokens
3. **Component CSS** — Build `components.css` with all reusable component styles
4. **Layout CSS** — Build `layout.css` with grid system and responsive utilities
5. **Animation CSS** — Build `animations.css` with all keyframes and scroll animation classes
6. **Global JS** — Build `main.js` with nav, scroll animations, theme toggling
7. **Homepage** — Build `index.html` + `homepage.css` with all 11 sections
8. **Browse page** — Build `browse.html` + `browse.css` + `filters.js`
9. **Sample Detail** — Build `sample.html` + `sample-detail.css` + `audio-player.js`
10. **Upload page** — Build `upload.html` + `upload.css` + `upload.js`
11. **Auth pages** — Build `login.html`, `signup.html`, `forgot-password.html` + `auth.css`
12. **Creator Profile** — Build `profile.html` + `profile.css` + `tabs.js`
13. **Pricing** — Build `pricing.html` + `pricing.css`
14. **Remaining pages** — Contact, Blog, About, Library, Dashboard
15. **Polish pass** — Review all pages for consistency, responsive bugs, animation timing
16. **Accessibility audit** — Keyboard nav, focus states, ARIA, contrast check

---

## 🚫 DO NOTs

- ❌ Do NOT use any CSS framework (Tailwind, Bootstrap, Bulma, etc.)
- ❌ Do NOT use any JS framework (React, Vue, Angular, etc.)
- ❌ Do NOT use jQuery
- ❌ Do NOT use placeholder images from external URLs — generate or use local solid-color / gradient placeholders
- ❌ Do NOT use inline styles — all styling through CSS files
- ❌ Do NOT hardcode colors — always use CSS custom properties
- ❌ Do NOT skip mobile responsiveness on any page
- ❌ Do NOT leave any section with "coming soon" or "lorem ipsum" — use the mock data provided
- ❌ Do NOT create a minimal/basic design — this must look and feel premium and production-ready
