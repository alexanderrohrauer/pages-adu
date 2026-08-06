---
name: image-description
description: Describes an uploaded mockup, wireframe, screenshot, or style-reference image and derives design goals from it, then appends that description/goals into the project's existing PRD file (does not create a new PRD). Before doing any of that, checks whether the PRD already has an entry for this image and skips re-processing if so. Use this skill whenever the user uploads or references an image and asks to "add this to the PRD", "extract goals from this", "describe the design intent", or when feeding a low-code/no-code (LCNC) or LLM-driven website/landing-page generator that needs goals recorded per image. Do NOT use this skill just to describe an image in plain prose with no PRD involved, or to generate code directly from an image.
---

# Image → Goals → PRD

For a given mockup/screenshot/style-reference image: write a short
description of what's in it, derive a few goals from that description, and
append both into the project's **existing** PRD file. Never create a new
PRD — this skill only adds to one that's already there.

## Step 0: Check if this image is already in the PRD

Before describing anything, open the existing PRD and check whether it
already has an entry for this image (match on filename, or on a close
description if no filename is available). If it's already there, say so
and stop — do not redo the description or re-append it. This is the whole
point of checking first: the skill should not re-run on images it has
already processed.

If you don't know where the PRD file is, ask once rather than guessing or
creating a new one.

## Step 1: Describe the image

A few sentences: what's shown (layout/sections if it's a mockup, or just
the style if it's a mood board/palette), and the key visual traits (colors,
typography, tone). Keep it short — this is a reference note, not a full
spec.

## Step 2: Derive goals

A short list of goals implied by the image — what the design should
achieve or preserve. Functional goals for structure/behavior visible in a
mockup ("lets a visitor submit a contact form"), style goals for tone/look
("minimal, trustworthy — muted palette, generous whitespace"). Only include
what's actually evidenced by the image; don't invent goals it doesn't
support.

## Step 3: Append to the PRD

Add a new entry to the existing PRD file (don't overwrite other content),
in whatever section/format the PRD already uses for this kind of entry. If
there's no established pattern yet, use something simple like:

```
### <image filename or short label>
Description: <step 1>
Goals:
- <goal>
- <goal>
```

Confirm to the user what was added and where.
