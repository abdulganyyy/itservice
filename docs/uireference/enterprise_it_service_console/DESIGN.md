---
name: Enterprise IT Service Console
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0d1c2e'
  on-tertiary-container: '#77859a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  title-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies the rigor, precision, and velocity required for mission-critical enterprise IT operations. The target audience comprises system administrators, site reliability engineers, IT service desk managers, and security operations personnel who spend 8+ hours a day resolving incidents, tracking service requests, and managing infrastructure changes.

### Design Principles
- **Clarity Over Novelty:** Prioritize functional clarity and instantaneous pattern recognition over decorative flourishes. Visual embellishments that do not communicate state or data hierarchy are omitted.
- **Operational Cadence & Density:** Enable rapid triaging and keyboard-driven workflows. Information density must remain high enough to minimize pagination while maintaining vertical scanning lanes that prevent cognitive fatigue.
- **Definitive Status Telemetry:** State, severity, and urgency must be unequivocally recognizable through dual visual encoding (color tone paired with explicit typographic labels or directional icons), ensuring immediate triage accuracy under high-pressure outage scenarios.
- **Aesthetic Direction:** Corporate modernism anchored in industrial slate neutrals, deep technical navy chrome, and crisp functional status indicators. Surfaces are structured with fine 1px administrative dividers rather than expressive shadows.

## Colors

The color architecture is built around a rigorous functional hierarchy. The foundation uses cool slate neutrals to minimize eye strain during extended operational shifts, while vibrant semantic accents provide instant operational telemetry.

### Palette Architecture
- **Brand Navy / Primary Shell (`#0F172A`, `#1E293B`):** Governs the global operational shell, top-level navigation, and prominent structural frames, instilling technical authority and spatial orientation.
- **Interactive Action (`#2563EB`):** Dedicated exclusively to actionable affordances—primary triggers, focused input states, active tabs, and primary action links.
- **System Neutral (`#F8FAFC` to `#0F172A`):** 
  - Canvas Base: `#F8FAFC`
  - Card/Module Surface: `#FFFFFF`
  - Subtle Surface Alt: `#F1F5F9`
  - Subtle Hairline Divider: `#E2E8F0`
  - Active Hairline/Border: `#CBD5E1`
  - Secondary Text: `#475569`
  - Primary Content Text: `#0F172A`

### Severity & Priority Tiers
- **Low Priority / Operational Nominal:** Emerald (`#059669` fill / `#10B981` border & text accents, background tint `#ECFDF5`).
- **Medium Priority / Degraded Attention:** Warm Amber (`#D97706` fill / `#F59E0B` border, background tint `#FFFBEB`).
- **High Priority / Critical Incidents:** Urgent Ruby (`#DC2626` fill / `#EF4444` border, background tint `#FEF2F2`).

### Lifecycle Status Semantic Badges
The 10 canonical lifecycle states utilize explicit hue pairings to distinguish stages across discovery, execution, and closure:
1. **Report:** Light Cool Slate (`#F1F5F9` bg / `#475569` text / `#CBD5E1` border)
2. **Notification:** Sky Cyan (`#F0F9FF` bg / `#0284C7` text / `#BAE6FD` border)
3. **Operational Queue:** Violet (`#F5F3FF` bg / `#7C3AED` text / `#DDD6FE` border)
4. **Initial Assessment:** Indigo (`#EEF2FF` bg / `#4F46E5` text / `#C7D2FE` border)
5. **Assignment:** Cobalt (`#EFF6FF` bg / `#2563EB` text / `#BFDBFE` border)
6. **In Progress:** Warm Amber (`#FFFBEB` bg / `#D97706` text / `#FDE68A` border)
7. **Pending / On Hold:** Rose-Zinc (`#FFF1F2` bg / `#E11D48` text / `#FECDD3` border)
8. **Resolution:** Mint Teal (`#F0FDFA` bg / `#0D9488` text / `#99F6E4` border)
9. **Verification:** Emerald (`#ECFDF5` bg / `#059669` text / `#A7F3D0` border)
10. **Closed:** Neutral Charcoal Slate (`#F8FAFC` bg / `#64748B` text / `#E2E8F0` border)

## Typography

Typography delivers dense, structured data with total clarity. The platform exclusively uses **Inter** for all display, structural, and interface typography, complemented by **JetBrains Mono** for terminal output, ticket UUIDs, IP addresses, and payload configurations.

### Usage Standards
- **Tabular Figures:** Always apply `font-variant-numeric: tabular-nums;` to tables, metrics cards, timestamps, SLA count-downs, and identifier badges to prevent horizontal jitter during real-time telemetry updates.
- **Section & Column Titles:** `label-sm` utilizes uppercase casing with `0.04em` tracking for table headers and sidebar categories, establishing clear structural divisions without demanding heavy visual weight.
- **Responsive Handling:** Operational dashboards prioritize screen real estate over scale jumps. Headings do not exceed 30px, ensuring maximum display height remains allocated to queue records and contextual breadcrumbs.

## Layout & Spacing

The layout model is anchored in a continuous fluid workspace optimized for high-resolution desktop terminals (1440px to 2560px), with graceful degradation for 1024px tablet field units.

### Layout Topology
- **Shell Architecture:** A fixed 64px collapsed / 240px expanded global rail navigation on the left, paired with a dynamic 100% fluid content canvas.
- **Work Area Grids:** Multi-pane layouts (list-detail views, ticket triage split screens) utilize persistent fluid columns with strict minimum boundary constraints:
  - Incident Queue pane: min 360px, flexible up to 45% viewport width.
  - Detail/Telemetry canvas: fills remainder (min 600px).
- **Table Density & Rhythm:** Data rows maintain a strict 40px compact height for standard density and 48px for comfortable mode. Cell padding adheres strictly to `space-sm` vertically and `space-md` horizontally.
- **Breakpoint Rules:**
  - **Desktop Large (>= 1440px):** Multi-column split views with contextual right-side metadata drawer always pinned.
  - **Desktop Standard (1024px - 1439px):** Contextual drawer collapses into an overlay slide-out. Table displays prioritize ID, Status, Severity, Summary, and Assignee, collapsing secondary metrics into expandable row panels.
  - **Field Tablet (< 1024px):** Single-pane full-width view with top-level tabs replacing split-pane views.

## Elevation & Depth

The design system prioritizes a zero-to-low elevation visual strategy. Depth is conveyed primarily through tonal layering and hair-thin structural lines rather than diffuse drop shadows, preserving an unambiguous, professional, utility-first console environment.

### Surface Tiers & Hairline Delimiters
- **Layer 0 (Canvas):** `#F8FAFC`. Background bedrock hosting all layout zones.
- **Layer 1 (Card & Module Workspaces):** `#FFFFFF`. Defined by a continuous 1px solid border (`#E2E8F0`). Flat elevation.
- **Layer 2 (Hover States & Nested Panels):** `#F1F5F9`. Applied inside data tables on row hover or nested logs.
- **Layer 3 (Floating Overlays & Menus):** `#FFFFFF`. Context dropdowns, date pickers, and filter modals utilize a crisp 1px border (`#CBD5E1`) paired with an ultra-subtle directional shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Layer 4 (Critical Modal Dialogs):** `#FFFFFF`. Supported by a full viewport dark backdrop (`#0F172A` at 60% opacity) to force absolute operational focus on incident confirmations or escalation triggers.

## Shapes

The interface embraces a disciplined, tight shape language (`roundedness: 1`). Soft, technical corners emphasize engineered precision rather than consumer-app playfulness.

### Geometry Specifications
- **Micro Affordances (Badges, Tags, Checkboxes):** 2px to 4px radius (`0.125rem` to `0.25rem`). Ensures concise vertical and horizontal footprint in dense data grids.
- **Form Controls & Action Buttons:** 4px radius (`0.25rem`). Delivers clear tactile containment with crisp vector definition.
- **Cards, Filter Bars, and Containers:** 6px to 8px radius (`0.375rem` to `0.5rem`). Modest containment that harmonizes with nested rectangular components.
- **Modal Windows & Slide-out Panels:** 8px radius (`0.5rem`) on exposed corners.
- **Pills:** Never used for full-width structural containers. Restrained solely to circular status dot indicators and numeric counter badges.

## Components

### Buttons
- **Primary:** Solid `#2563EB`, text `#FFFFFF`, hover `#1D4ED8`, active `#1E40AF`. 32px height (compact) or 36px (default), `0.25rem` radius, semi-bold 13px Inter.
- **Secondary / Neutral:** Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`, hover `#F8FAFC`.
- **Destructive / Urgent:** Background `#DC2626`, text `#FFFFFF`, hover `#B91C1C`. Reserved for hard service reboots, incident escalation, or ticket deletion.
- **Ghost / Table Inline:** Transparent background, text `#475569`, hover `#F1F5F9` with text `#0F172A`.

### Status Badges & Lifecycle Indicators
- **Specification:** Height of 20px, uppercase `label-sm` (11px, weight 600), horizontal padding `0.375rem`, border radius `0.25rem`, 1px solid border matching semantic color family.
- **Priority Badges:** Must include an explicit visual icon or leading circle glyph alongside the text (e.g., solid 6px dot) to maintain accessibility under non-color viewing environments:
  - `P1 - High`: Ruby badge with solid crimson dot.
  - `P2 - Med`: Amber badge with warm amber dot.
  - `P3 - Low`: Emerald badge with subtle green dot.

### Data Tables
- **Header:** Height 36px, background `#F8FAFC`, border-bottom 1px solid `#CBD5E1`. Headers use `label-sm` typography, colored `#475569`.
- **Rows:** Height 40px standard. Alternating backgrounds are avoided in favor of 1px bottom dividers (`#E2E8F0`) and immediate hover feedback (`#F1F5F9`).
- **Active Selection:** Background `#EFF6FF` with a 2px solid `#2563EB` left-edge indicator bar.

### Input Fields & Filter Bars
- **Inputs:** 32px or 36px height, background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#0F172A`, placeholder `#94A3B8`.
- **States:** Focus rings use a crisp 1px ring `#2563EB` with an additional 2px outer outline of `#DBEAFE`. Error states substitute `#DC2626`.
- **Filter Groups:** Monolithic input groups with integrated icon prefix, dismissible chip tags, and quick-filter dropdown triggers.

### Checkboxes & Radios
- **Geometry:** 16px square (checkbox) or circle (radio), border 1.5px solid `#94A3B8`, background `#FFFFFF`.
- **Checked:** Background `#2563EB`, border `#2563EB`, white checkmark or center pip. Indeterminate states display a solid 8px horizontal center bar.

### Cards & Container Modules
- Clean `#FFFFFF` panels with 1px solid `#E2E8F0` outlines.
- Header bars within cards are separated with a 1px solid `#E2E8F0` divider and padded using `space-sm` vertically and `space-md` horizontally, preventing wasted real estate.