---
name: Serene Interface
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3f484c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6f787d'
  outline-variant: '#bfc8cd'
  surface-tint: '#02677f'
  primary: '#02677f'
  on-primary: '#ffffff'
  primary-container: '#7ec8e3'
  on-primary-container: '#005468'
  inverse-primary: '#87d1ec'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#89511c'
  on-tertiary: '#ffffff'
  tertiary-container: '#f7ae71'
  on-tertiary-container: '#73400b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#87d1ec'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#ffdcc2'
  tertiary-fixed-dim: '#ffb77c'
  on-tertiary-fixed: '#2e1500'
  on-tertiary-fixed-variant: '#6c3a05'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-padding: 24px
  grid-gutter: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
This design system prioritizes clarity, accessibility, and a sense of calm reliability. Target users are professionals and casual web users seeking a low-friction, high-legibility experience. 

The aesthetic is **Corporate Modern with a Soft Twist**, blending the structured reliability of enterprise SaaS with the approachable warmth of consumer-facing lifestyle apps. The UI utilizes generous whitespace, subtle tonal shifts for depth, and high-quality typography to ensure the interface feels premium yet accessible. The primary goal is to minimize cognitive load while providing a stable, centered environment for content consumption and interaction.

## Colors
The palette is anchored by a soft baby blue primary hue, used purposefully for interactive elements and brand accents. 

- **Primary**: #7EC8E3 is the core interactive color, used for primary buttons, active states, and highlights.
- **Secondary**: A deep slate (#0F172A) provides high-contrast grounding for text and dark-mode elements.
- **Neutral**: The background is a clean, cool white/grey (#F8FAFC), ensuring the baby blue accents remain vibrant without being overwhelming.
- **Success/Warning/Error**: Utilize standard semantic tokens (Green/Amber/Red) but softened to match the desaturated tone of the primary brand color.

## Typography
The system uses a pairing of **Plus Jakarta Sans** (substituted for Poppins for a more contemporary, balanced geometric feel) for headlines and **Inter** for body text. 

- **Headlines**: Set in Plus Jakarta Sans with tighter letter spacing for a modern, high-end editorial feel.
- **Body**: Inter is used for all long-form text and interface labels to ensure maximum legibility across all screen densities.
- **Scale**: The hierarchy is strict. Use `display-lg` only for hero sections. `headline-lg` should drop to `headline-lg-mobile` on screens smaller than 768px.

## Layout & Spacing
The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a centered 1000px container to prevent excessive line lengths on wide monitors.

- **Desktop (1024px+):** A 2-column grid is the default layout for main content areas, utilizing a 32px gutter. Sidebars or secondary info blocks should occupy one column, while primary content occupies the other.
- **Tablet (768px - 1023px):** The container width becomes fluid with 40px side margins. The 2-column grid is maintained unless content density requires a stack.
- **Mobile (< 768px):** The grid collapses to a single 1-column layout. The container padding reduces to 16px to maximize screen real estate.
- **Rhythm**: All spacing (margins, padding) should be multiples of 8px to maintain a consistent vertical rhythm.

## Elevation & Depth
This design system uses **Tonal Layers** and **Ambient Shadows** to define hierarchy. 

- **Surface 0 (Background)**: #F8FAFC.
- **Surface 1 (Cards/Containers)**: Pure white (#FFFFFF) with a very soft, 15% opacity shadow: `0px 4px 20px rgba(15, 23, 42, 0.05)`.
- **Surface 2 (Popovers/Modals)**: Pure white with a more pronounced elevation: `0px 10px 30px rgba(15, 23, 42, 0.1)`.
- **Interaction**: On hover, interactive cards should slightly lift (increase shadow spread) rather than change color, maintaining the "soft" feel of the brand.

## Shapes
The shape language is defined by **High-Radius Geometry**. Standard components use a 16px corner radius, while larger containers (cards, modals) use 20px. 

- **Small Components (Buttons, Inputs)**: 16px (`rounded-lg` equivalent).
- **Large Components (Cards, Sections)**: 20px (`rounded-xl` equivalent).
- **Full Rounding**: Used only for tags, chips, and iconography backgrounds to provide visual variety against the structured grid.

## Components
- **Buttons**: Primary buttons are filled with #7EC8E3, using white text for contrast. They feature 16px rounded corners and a subtle scale-down effect on click (0.98).
- **Input Fields**: Borders are 1px solid #E2E8F0. On focus, the border transitions to #7EC8E3 with a 3px soft outer glow (soft baby blue at 20% opacity).
- **Cards**: Cards are the primary layout unit. They must have a 20px corner radius, a white background, and the "Surface 1" ambient shadow.
- **Chips**: Used for categorization. These should be pill-shaped with a light tint of the primary color (#7EC8E3 at 15% opacity) and dark blue text.
- **Lists**: Use 16px vertical padding between list items, with a 1px #F1F5F9 separator that stops 16px short of the container edges.
- **Navigation**: Desktop navigation should be a simple horizontal bar at the top of the 1000px container, using `label-md` for links.