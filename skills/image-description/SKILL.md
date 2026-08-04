---
name: image-description
description: Converts an uploaded mockup, wireframe, screenshot, or style-reference image into a structured set of goals (functional and non-functional) that describe design intent rather than pixel-exact layout. Use this skill whenever the user uploads or references an image and asks to "turn it into requirements", "extract goals", "describe the design intent", "generate a spec from this mockup/screenshot/moodboard", or when building or feeding a low-code/no-code (LCNC) or LLM-driven website/landing-page generator that needs a goal-level intermediate representation instead of raw HTML/CSS. Also trigger for style-example images (mood boards, palettes, reference screenshots of "the look we want") even if no full page layout is shown — these should be reduced to style/non-functional goals. Do NOT use this skill just to describe an image in plain prose, or to generate code directly from an image — this skill's job stops at producing the goal specification, one abstraction level before code generation.
---

# Image → Goals

Turns a visual artifact (page mockup, wireframe, screenshot, or style-reference
image) into a structured, hierarchical **goal specification**: a description
of _what the design is trying to achieve and constrain_, not a pixel-for-pixel
transcription of it. The output is meant to sit between "image" and "code" in
a Design-to-Code / LCNC pipeline, so an LLM (or a human) can later generate
markup from the goals without re-deriving intent from the picture each time.

Goals are simply AND/OR-decomposable statements of what an actor wants the
design to achieve or preserve — a root goal for the overall purpose, broken
into sub-goals per section, refined by concrete leaf constraints. No
literature references are needed in the output; keep it practical and
focused on what's actually visible in the image.

## When NOT to use this

- The user just wants a plain-language description of what's in the image →
  answer directly, no goal structure needed.
- The user wants you to write the actual HTML/CSS/component code from the
  image right now → do that directly; you may still produce goals internally
  as scratch reasoning, but the deliverable is code, not this skill's output.
- No image is actually present (path mentioned but nothing uploaded) →
  check first, don't assume.

## Inputs this skill handles

1. **Full-page mockups / wireframes** — a complete or near-complete layout
   (hero, nav, sections, footer, forms, etc.), hand-drawn or digital.
2. **Screenshots of existing sites/apps** — used as a structural or stylistic
   reference ("make it look like this").
3. **Style-example images** — mood boards, color palettes, typography
   samples, single UI components, brand imagery — no full layout implied.

Determine which of these you're looking at first; it changes what kind of
goals you can responsibly extract (a style-example image should not produce
invented layout goals, see below).

## Process

### 1. Visual inventory (don't skip this even for simple images)

Look at the image and list, in your own working notes, what you actually
see — don't jump straight to goals:

- **Structure**: sections/regions present (header, nav, hero, content
  blocks, sidebar, cards, forms, footer, grid/column layout), and their
  relative order and proportions.
- **Components**: concrete UI elements (buttons, inputs, nav items, cards,
  badges, carousels, images, icons) and how many/what states are visible.
- **Style attributes**: color palette (name the dominant and accent colors,
  not just "blue"), typography (serif/sans, weight, size hierarchy),
  spacing/density (airy vs. dense), corner radius/sharpness, imagery style
  (photographic, illustrated, iconographic), overall tone (playful, formal,
  minimal, brutalist, corporate, etc.).
- **Content cues**: any real or placeholder text/labels that hint at page
  purpose (e.g. "Book a demo", "Add to cart") — these hint at functional
  intent even from a static image.

For style-example images, most of this reduces to the style-attributes
bullet only — do not fabricate a page structure that isn't implied.

### 2. Derive goals from the inventory

Convert inventory items into goal statements, not element lists. A goal
answers "what is this trying to achieve/preserve", phrased so it stays valid
even if the exact implementation changes. Use two categories:

- **Functional goals** — what the page/section must let a user _do_, or
  what content/structure it must present. Phrase as:
  `The system SHALL <capability>, satisfying <sub-goals/constraints>.`
  Example: "The system SHALL let a visitor submit a contact request via a
  form capturing name, email, and message."
- **Non-functional / style goals** — qualities the design must preserve:
  visual tone, accessibility, responsiveness cues visible in the image,
  brand consistency. Phrase as:
  `The design SHALL convey/preserve <quality>, evidenced by <observed cue>.`
  Example: "The design SHALL convey a minimal, trustworthy tone, evidenced
  by generous whitespace, a muted blue/white palette, and a single sans-serif
  typeface."

Organize goals hierarchically, AND/OR-decomposition style:

- **Root goal**: one sentence capturing the overall purpose of the page/
  artifact as implied by the image (e.g. "Present a SaaS product landing
  page that converts visitors into trial sign-ups").
- **Sub-goals**: one per major section/region from the inventory, each
  inheriting from the root.
- **Leaf constraints**: concrete, testable details (specific colors, exact
  copy if legible, component counts) attached to the sub-goal they refine.

Do not invent functionality that has no visual evidence (e.g. don't add a
"search" goal because most sites have one — only if a search element is
actually visible or its absence would contradict a stated purpose the user
gave you).

### 3. Output format

Default to this Markdown structure (use it inline in chat, not necessarily
as a file — see file-creation rules below):

```
## Root Goal
<one sentence>

## Sub-Goals
### <Section name, e.g. "Hero">
- Goal: <functional or style goal statement>
  - Constraint: <leaf detail>
  - Constraint: <leaf detail>
### <Section name, e.g. "Navigation">
...

## Global Style Goals
- <non-functional goal>
- <non-functional goal>
```

If the user's downstream system expects machine-readable input (common for
an LCNC pipeline step), instead emit JSON with this shape and say so:

```json
{
  "root_goal": "string",
  "sections": [
    {
      "name": "string",
      "goals": [
        {
          "type": "functional|style",
          "statement": "string",
          "constraints": ["string", "..."]
        }
      ]
    }
  ],
  "global_style_goals": [{ "statement": "string", "evidence": "string" }]
}
```

Ask the user which format they want if it's not already clear from context
(e.g. earlier in the conversation they've been working with a JSON schema
for their prototype) — otherwise default to the Markdown form for
readability.

### 4. Sanity check before returning

- Every sub-goal traces back to something actually visible in the image —
  if you can't point to the evidence, drop it or mark it as an assumption.
- Style-example images produce only global style goals, no invented section
  structure.
- Goals are phrased as intents/capabilities, not as implementation
  instructions (avoid "use a `<div class="hero">`" — that's code, not goal).
- Keep leaf constraints concrete enough to be testable later (a color name
  or hex-ish description, not "nice colors").

## Notes for use inside a larger LCNC/Design-to-Code pipeline

This skill's output is meant to be the intent-layer artifact that a
downstream code-generation step consumes, keeping the two concerns
separate: goal extraction (this skill) vs. code synthesis (a separate step).
Keep the two decoupled so the goal spec stays reusable even if the
generation approach changes later.
