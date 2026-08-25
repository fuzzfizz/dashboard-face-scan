# Design Spec: Smart Sci-Fi Scanner Continuous Animations

## Overview
This document specifies the design for continuous, high-tech, ambient animations ("Smart Sci-Fi Scanner") in the Face Scan Dashboard. These animations run continuously in the background to provide a lively, futuristic, and engaging experience for event check-in displays, kiosk terminals, and mobile users.

## Core Features & Animations

### 1. Continuous Laser Scan Beam (`animate-laser-scan`)
- **Location**: QR Code container and Participant Photo container in `LeftPanel.jsx`.
- **Visuals**:
  - A glowing horizontal laser line (Cyan/Indigo: `#06b6d4` / `#4f46e5` with `box-shadow: 0 0 12px rgba(6, 182, 212, 0.8)`).
  - A gradient scan area trailing behind the laser beam (`linear-gradient(to top, rgba(6, 182, 212, 0.15), transparent)`).
  - Keyframe movement: travels from `top: 0%` to `top: 96%` and back in a smooth 3.5s loop.

### 2. Dual Rotating HUD Target Rings (`animate-hud-cw` & `animate-hud-ccw`)
- **Location**: Surrounding the Participant Avatar / Photo in `LeftPanel.jsx`.
- **Visuals**:
  - **Outer Ring**: Segmented tech circle with 4 gaps rotating clockwise (30s linear infinite).
  - **Inner Ring**: Precision reticle ring rotating counter-clockwise (20s linear infinite).
  - Responsive scaling for mobile, desktop, and 3xl kiosk screens.

### 3. Live Radar Concentric Waves (`animate-radar-wave`)
- **Location**: Behind the avatar and live status badges.
- **Visuals**:
  - Concentric circular waves expanding from `scale(0.9)` to `scale(1.35)` with fading opacity.
  - Adds depth and energy without obstructing text or photo clarity.

### 4. Corner Focus Reticle Brackets (AI Scanner Target Brackets)
- **Location**: 4 corners of the QR Code card and Participant photo frame.
- **Visuals**:
  - Crisp `L`-shaped corner brackets (Cyan/Indigo) with subtle ambient glow (`0.5px` border glow).

## Architecture & Code Changes

### Files to Modify:
1. `src/index.css`:
   - Add keyframes: `laser-scan`, `hud-cw`, `hud-ccw`, `radar-wave`, `corner-glow`.
   - Add utility classes: `.animate-laser-scan`, `.animate-hud-cw`, `.animate-hud-ccw`, `.animate-radar-wave`.
2. `src/components/event-detail/LeftPanel.jsx`:
   - Integrate laser scanner beam into QR code container.
   - Integrate dual HUD rings, radar waves, and corner brackets around the Participant Avatar.
   - Add corner reticle accents to the QR container and Participant card.

## Non-Functional Requirements
- **Performance**: Use CSS transforms and `opacity` properties for 60fps GPU acceleration without CPU overhead.
- **Dark & Light Mode Compatibility**: High-contrast glow in dark mode, crisp tinted accents in light mode.
- **Responsive Scalability**: Full support across mobile (<640px), desktop, and large displays (3xl).
