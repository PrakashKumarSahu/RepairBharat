---
name: Bharat Repair Logic
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
  on-surface-variant: '#444653'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#006d30'
  on-secondary: '#ffffff'
  secondary-container: '#92f5a4'
  on-secondary-container: '#007233'
  tertiary: '#532a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#743d00'
  on-tertiary-container: '#ffa85d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#95f8a7'
  secondary-fixed-dim: '#79db8d'
  on-secondary-fixed: '#00210a'
  on-secondary-fixed-variant: '#005323'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 20px
  lg: 32px
  xl: 48px
  touch-target: 48px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The brand identity focuses on reliability, speed, and technical competence within the Indian repair ecosystem. The design system adopts a **Modern Corporate** style—a synthesis of high-utility SaaS patterns and approachable mobile-first accessibility. It emphasizes clarity to reduce the cognitive load of technicians in the field and administrators in high-volume workshops. 

The atmosphere is professional and high-utility, utilizing generous white space and a structured hierarchy to convey a sense of "order from chaos." Every element is designed to feel intentional and stable, fostering trust between the service provider and the end customer.

## Colors

The color palette is rooted in a core trio that communicates the status of a repair lifecycle instantly.

- **Primary (Deep Tech Blue):** Used for navigation, primary actions, and brand reinforcement. It establishes a foundation of "Technical Trust."
- **Success (Forest Green):** Reserved for completed repairs, verified payments, and positive status updates.
- **Warning (Amber Orange):** Utilized for pending items, parts on order, or urgent alerts that require attention without causing panic.
- **Neutrals:** A range of cool grays and slates are used for text and borders to maintain a clean, SaaS-inspired aesthetic.

Backgrounds remain off-white to reduce glare, while interactive surfaces are pure white to provide maximum contrast.

## Typography

The design system utilizes **Inter** for its exceptional readability on mobile screens and its neutral, systematic character. The type scale is generous, ensuring that technicians can read repair notes and customer details even in varied lighting conditions. 

Weight is used strategically to create hierarchy: Semi-bold and Bold weights are reserved for actionable headers and status labels, while Regular weights handle descriptions and data entries. Letter spacing is slightly tightened on larger headlines for a more "designed" feel and opened on small labels for clarity.

## Layout & Spacing

This design system employs a **Fluid Grid** model with high-touch sensitivity. Given the operational nature of repair management, the layout prioritizes ease of interaction over density.

- **The 8px Rhythm:** All spacing and sizing are multiples of 8px to ensure a consistent visual beat.
- **Interactive Targets:** Every button and input field maintains a minimum height of 48px (the `touch-target` variable) to accommodate one-handed mobile use in workshop environments.
- **Gutter & Margins:** On mobile, a 16px side margin is enforced. On desktop, a 12-column grid is used with 24px gutters to allow for complex data dashboards without feeling cramped.

## Elevation & Depth

To maintain a minimal and clean appearance, the design system uses **Ambient Shadows** and **Tonal Layers** rather than heavy borders.

- **Level 0 (Flat):** Used for the main background.
- **Level 1 (Subtle):** Used for primary cards and containers. The shadow is a very soft, diffused blur: `0px 2px 4px rgba(30, 64, 175, 0.05)`.
- **Level 2 (Active/Floating):** Used for modals, dropdowns, and buttons being hovered or pressed. The shadow expands to `0px 10px 15px rgba(0, 0, 0, 0.1)`.

This approach creates a clear hierarchy where the most important information (like a "Repair Order" card) physically feels closer to the user.

## Shapes

The shape language is defined by **Rounded** corners, which soften the "technical" nature of the blue palette and make the UI feel modern and approachable. 

- **Standard Elements:** Buttons, input fields, and tags use a `0.5rem` (8px) radius.
- **Large Containers:** Cards and modals use a `1rem` (16px) radius to create a distinct framing for content.
- **Icons:** Should follow a rounded cap and join style to match the UI's geometry.

## Components

- **Buttons:** Primary buttons are solid Deep Tech Blue with white text. Secondary buttons use a subtle gray stroke with blue text. Size is fixed to 48px height for mobile accessibility.
- **Chips / Status Badges:** Use a "Light Tint" background with "Dark Ink" text. For example, a "Completed" chip has a light green background with the Success Green (#15803D) text.
- **Input Fields:** Use a 1px border in a light neutral tone. Upon focus, the border thickens to 2px and changes to Primary Blue with a subtle glow.
- **Lists:** High-contrast list items with 16px internal padding and a bottom-only divider. They include trailing chevron icons to indicate tap-through ability.
- **Cards:** White surfaces with a Level 1 elevation. They feature a vertical color-coded bar on the left edge to indicate job status (Blue for New, Orange for In-Progress, Green for Done).
- **Service-Specific Components:**
  - **Job Progress Tracker:** A vertical stepper showing the timeline from "Device Received" to "Delivered."
  - **Parts Inventory Picker:** A searchable list with large checkboxes for adding components to a repair bill.