# Design System Strategy: The Monolithic Logic

## 1. Overview & Creative North Star
**Creative North Star: "The Monolithic Logic"**

This design system transcends the typical "utility tool" aesthetic. It treats JSON data not as a raw string, but as digital architecture. By utilizing **JetBrains Mono** across the entire interface—not just the code editor—we create a seamless, high-end environment that feels like a professional IDE curated for a gallery. 

The system breaks the "standard grid" template by employing **intentional asymmetry**. The layout should feel weighted and deliberate, using vast negative space (negative space is a feature, not a void) and massive monospaced headlines to create an editorial feel. We replace structural rigidity with tonal depth, moving away from "boxes inside boxes" toward a fluid, layered experience where data is the protagonist.

---

## 2. Colors & Surface Philosophy
The palette is rooted in deep, ink-like blacks and functional grays, punctuated by high-energy syntax accents.

*   **Primary (#81ecff):** Use for "Format" or "Execute" actions. It represents the "active" state of the logic.
*   **Secondary (#bc87fe):** Reserved for secondary logic actions like "Copy" or "Minify."
*   **Tertiary (#a0fff0):** Used for subtle successes or specific syntax highlighting (e.g., JSON keys).

### The "No-Line" Rule
Standard UI relies on 1px borders to define sections. **This design system prohibits 1px solid borders for sectioning.** Boundaries must be defined solely through background color shifts. To separate the input area from the output area, transition from `surface-container-low` (#131313) to `surface-container-high` (#20201f). The eye should perceive the edge via the change in luminance, not a drawn line.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers:
1.  **Base Layer:** `surface` (#0e0e0e) for the main application backdrop.
2.  **Navigation/Sidebar:** `surface-container-low` (#131313) to create a subtle recessed feel.
3.  **The Editor Canvas:** `surface-container-highest` (#262626) to bring the code into the foreground, signifying importance.

### The "Glass & Gradient" Rule
Floating panels (like "Settings" or "Language Selection") must utilize **Glassmorphism**. Use `surface-container` tokens with a 70% opacity and a `20px` backdrop-blur. For primary buttons, apply a subtle linear gradient from `primary` (#81ecff) to `primary_dim` (#00d4ec) to give the button "soul" and a slight 3D presence against the flat dark background.

---

## 3. Typography: Monospaced Authority
We utilize **JetBrains Mono** for all UI elements to maintain a singular, technical voice.

*   **Display & Headlines:** Use `display-lg` (3.5rem) for main titles (e.g., "FORMATTER"). Use tight letter-spacing (-2%) to make the monospaced font feel like a heavy editorial headline.
*   **The Code Interface:** Use `body-lg` (1rem) for the JSON text to ensure maximum readability for long debugging sessions.
*   **Labels & Metadata:** Use `label-sm` (0.6875rem) in all-caps for technical metadata (e.g., "SIZE: 1.2KB", "ENCODING: UTF-8").
*   **Turkish Support:** Ensure all typography scales account for the vertical height of Turkish characters (İ, Ğ, Ş). JetBrains Mono’s generous x-height handles these beautifully without breaking line-height integrity.

---

## 4. Elevation & Depth: Tonal Layering
In "The Monolithic Logic," depth is felt, not seen through harsh shadows.

*   **The Layering Principle:** Rather than using `z-index` with shadows, "stack" surface tiers. A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft "lift."
*   **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5)`. The shadow color must be a tinted version of the background, never pure black, to mimic ambient light absorption.
*   **The "Ghost Border" Fallback:** If a separation is visually required for accessibility, use a **Ghost Border**. Use the `outline-variant` (#484847) at 15% opacity. It should be barely visible—a suggestion of an edge rather than a hard boundary.

---

## 5. Components

### Buttons
*   **Primary:** Sharp corners (`none` or `sm`). Background: `primary` gradient. Text: `on-primary` (#005762).
*   **Secondary:** Ghost style. No background, but a `ghost-border` (15% opacity `outline-variant`).
*   **Interaction:** On hover, the button should "glow" by increasing the opacity of a soft `primary` shadow.

### The Editor (Text Fields)
*   **Style:** No visible "input box." The entire right or left half of the screen *is* the input field. 
*   **Focus State:** When the editor is active, the background shifts from `surface-container-high` to `surface-container-highest`.
*   **Error State:** Use `error` (#ff716c) for line numbers where JSON syntax is broken. No red boxes; just a sharp, vertical line (3px width) in the gutter.

### Chips & Tags
*   **Usage:** For "JSON", "YAML", or "XML" format selection.
*   **Style:** `surface-variant` background with `on-surface-variant` text. Sharp corners. Use `1.5` spacing for internal padding.

### Checkboxes & Toggles
*   **Logic:** For "Auto-format" or "Bracket matching." 
*   **Visuals:** High-contrast. Use `primary` for the "checked" state. Ensure the "unchecked" state uses `outline` (#767575) to remain visible but muted.

### Tooltips
*   **Style:** `surface-bright` background with `on-surface` text. Use `0.25rem` (DEFAULT) rounding to distinguish them from the sharp-edged UI elements.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme vertical whitespace (`20` or `24` on the spacing scale) between the header and the editor canvas.
*   **Do** use `primary` and `secondary` colors for syntax highlighting (Keys = `secondary`, Values = `primary`).
*   **Do** ensure all Turkish strings are professionally translated (e.g., use "Biçimlendir" for "Format", "Kopyala" for "Copy").

### Don't
*   **Don't** use dividers or horizontal rules. Separate content using `surface` color shifts or whitespace.
*   **Don't** use `xl` or `full` roundedness. This application is a tool of precision; keep corners sharp (`none`) or slightly softened (`sm`).
*   **Don't** use pure white for body text. Use `on-surface-variant` (#adaaaa) for non-essential text to reduce eye strain in dark mode.