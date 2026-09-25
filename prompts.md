You are a senior product designer, UX architect, design strategist, and frontend engineer.

I have an existing application in this workspace. I want to create a COMPLETELY NEW UI/UX DESIGN for it using Figma Make.

Your job is NOT to preserve or improve the existing design.

Your job is to deeply understand the PRODUCT and then create a design-context document that allows Figma Make to redesign the entire application from scratch.

The existing frontend is ONLY a source of PRODUCT FUNCTIONALITY, CONTENT, USER FLOWS, DATA, and BUSINESS LOGIC.

DO NOT treat the existing UI as a visual reference.

DO NOT reproduce the current layout.

DO NOT reuse the current visual hierarchy unless it is absolutely required by functionality.

DO NOT preserve existing colors, typography, spacing, cards, buttons, navbar, sidebar, forms, page layouts, or component styling.

We are replacing the visual design completely.

Think of this as:

EXISTING APPLICATION
→ extract product requirements
→ discard existing visual design
→ rethink UX and information architecture
→ create a completely new design direction
→ give Figma Make the context to build it

---

# PART 1 — UNDERSTAND THE PRODUCT

Inspect the entire repository.

Understand:

* What the application actually does
* Who uses it
* What problem it solves
* Main user roles
* Main workflows
* Core entities
* Important business rules
* Authentication requirements
* Permissions
* Search
* Filters
* Sorting
* CRUD operations
* Dashboard functionality
* Messaging
* Notifications
* Payments if present
* Uploads
* Favorites/wishlist
* Admin functionality
* Any other meaningful functionality

Use the actual source code as the source of truth.

DO NOT invent functionality.

---

# PART 2 — IGNORE THE EXISTING DESIGN

Explicitly identify the current visual implementation, but DO NOT use it as the basis for the redesign.

Record it only under:

CURRENT DESIGN — TO BE DISCARDED

Include:

* Existing colors
* Existing typography
* Existing navbar
* Existing sidebar
* Existing cards
* Existing page layouts
* Existing spacing
* Existing visual patterns
* Existing component styling
* Existing aesthetic

This information is ONLY to make sure we intentionally move away from it.

Do not recommend preserving any of these elements.

---

# PART 3 — EXTRACT FUNCTIONAL REQUIREMENTS

Create a clean product specification independent of the current UI.

For each page/route identify:

PAGE NAME
ROUTE
USER ROLE
PURPOSE
PRIMARY USER GOAL
SECONDARY GOALS
INFORMATION REQUIRED
USER ACTIONS
DATA REQUIRED
API DEPENDENCIES
VALIDATION
SUCCESS STATES
ERROR STATES
EMPTY STATES
LOADING STATES
PERMISSION REQUIREMENTS

Focus on functionality, not appearance.

---

# PART 4 — USER JOURNEYS

Map the application's major user journeys.

For each journey:

START
→ USER INTENT
→ ACTION
→ SYSTEM RESPONSE
→ NEXT SCREEN
→ SUCCESS / FAILURE

Identify friction points and unnecessary steps.

Then propose UX improvements based on the functionality.

These improvements may change:

* page structure
* navigation
* information hierarchy
* interaction model
* number of steps
* filtering approach
* form organization
* CTA placement
* mobile behavior

The goal is to improve the PRODUCT EXPERIENCE, not preserve the current implementation.

---

# PART 5 — INFORMATION ARCHITECTURE REDESIGN

Do NOT assume the current navigation is correct.

Based on the actual functionality, create a new information architecture.

Determine:

* What belongs in primary navigation
* What belongs in secondary navigation
* What belongs inside dashboards
* What deserves dedicated pages
* What should be tabs
* What should be modals/drawers
* What should be inline interactions
* What can be grouped
* What should be separated

Optimize for:

* discoverability
* simplicity
* low cognitive load
* fast navigation
* scalability
* responsive/mobile usability

---

# PART 6 — CREATE A COMPLETELY NEW DESIGN CONCEPT

Now think like a world-class product design agency starting from zero.

Do NOT look at the existing design and "make it prettier."

Instead create a NEW design concept.

Explore:

* modern layout philosophy
* modern navigation patterns
* stronger visual hierarchy
* improved content density
* better interaction patterns
* modern responsive behavior
* distinctive brand identity
* purposeful use of whitespace
* meaningful visual emphasis
* polished micro-interactions

The final design should NOT look like a generic AI-generated dashboard/template.

It should feel intentionally designed for this particular product.

---

# PART 7 — PRODUCE 3 DISTINCT DESIGN DIRECTIONS

Before selecting the final direction, develop THREE radically different visual/UX concepts.

For each concept provide:

CONCEPT NAME

DESIGN PHILOSOPHY

LAYOUT PHILOSOPHY

NAVIGATION MODEL

COLOR DIRECTION

TYPOGRAPHY DIRECTION

CARD / CONTENT STYLE

BUTTON STYLE

FORM STYLE

IMAGE STYLE

ICON STYLE

INTERACTION STYLE

MOBILE APPROACH

BRAND PERSONALITY

WHY IT FITS THIS PRODUCT

IMPORTANT:
These must be genuinely different concepts, not the same design with different colors.

Example difference:

Concept A:
Editorial / premium / spacious

Concept B:
Modern SaaS / information-dense / functional

Concept C:
Immersive marketplace / visual-first / image-heavy

Choose directions appropriate to the actual product.

---

# PART 8 — SELECT A DESIGN DIRECTION

After generating the three concepts, select ONE direction to develop further.

Selection must be based on:

* product purpose
* target users
* information complexity
* primary workflows
* usability
* scalability
* responsive requirements

Do NOT select based simply on what looks visually attractive.

Explain the reasoning briefly.

---

# PART 9 — DESIGN SYSTEM FROM SCRATCH

Create a completely new design system for the selected direction.

Define:

## COLOR SYSTEM

* Primary
* Secondary
* Accent
* Background
* Surface
* Border
* Text
* Muted text
* Success
* Warning
* Error
* Info

## TYPOGRAPHY

* Display
* H1
* H2
* H3
* Body
* Small
* Labels
* Buttons
* Metadata

## SPACING

Create a consistent spacing scale.

## COMPONENT LANGUAGE

Define a NEW approach for:

* buttons
* inputs
* dropdowns
* cards
* tables
* badges
* tabs
* modals
* drawers
* alerts
* navigation
* pagination
* breadcrumbs
* avatars
* image galleries
* filters
* search
* loading states
* skeletons
* empty states

## VISUAL CHARACTER

Define:

* border radius
* shadows
* borders
* layering
* visual density
* image treatment
* motion
* hover states
* focus states
* transitions

Everything here should be newly designed.

---

# PART 10 — REDESIGN EVERY SCREEN

For every important screen in the application, create a new UX specification.

Use:

PAGE:
PURPOSE:
USER:
PRIMARY GOAL:
PRIMARY CTA:
SECONDARY ACTIONS:
CONTENT HIERARCHY:
LAYOUT STRUCTURE:
KEY COMPONENTS:
INTERACTIONS:
STATES:
RESPONSIVE BEHAVIOR:

Do NOT describe how the existing page currently looks.

Describe how the NEW page should work and feel.

---

# PART 11 — RESPONSIVE REDESIGN

The redesign must intentionally support:

DESKTOP
TABLET
MOBILE

Do not simply scale desktop downward.

Define structural changes where appropriate.

Examples:

* sidebar → bottom navigation
* filters → filter drawer
* table → cards
* multi-column → stacked
* persistent search → expandable search
* horizontal actions → overflow menu
* large image gallery → swipe gallery

Only recommend patterns relevant to this application.

---

# PART 12 — UX IMPROVEMENTS

Find opportunities where the existing workflow can be improved.

Look for:

* unnecessary screens
* excessive form length
* confusing navigation
* duplicate actions
* unclear terminology
* weak hierarchy
* excessive information density
* poor mobile workflows
* missing feedback
* weak empty states
* poor onboarding
* difficult search/filter experiences

For each:

PROBLEM
CURRENT BEHAVIOR
PROPOSED UX
WHY IT IS BETTER

The proposed UX may intentionally differ from the current implementation.

---

# PART 13 — REALISTIC PRODUCT CONTENT

Inspect the actual domain and generate realistic example content for Figma Make.

Do NOT use meaningless placeholders such as:

"Lorem ipsum"
"Product 1"
"User Name"
"Description here"

Use realistic domain-specific content while keeping it clearly mock/demo data.

---

# PART 14 — FIGMA MAKE MASTER PROMPT

Finally create a MASTER PROMPT specifically for Figma Make.

This prompt must instruct Figma Make to:

1. Design the application from scratch.
2. Ignore the existing frontend's visual design.
3. Do not replicate the current UI.
4. Do not reuse the current color palette.
5. Do not reuse the current typography.
6. Do not reuse current layouts.
7. Do not recreate the existing navbar/sidebar/cards.
8. Use the PRODUCT REQUIREMENTS extracted from the repository.
9. Apply the NEW design concept and design system.
10. Improve information architecture where appropriate.
11. Produce a polished, production-quality experience.
12. Create reusable components.
13. Make the experience responsive.
14. Design meaningful loading, empty, error, and success states.
15. Use realistic product content.
16. Maintain accessibility.
17. Preserve actual product functionality.
18. Avoid inventing unsupported features.
19. Avoid generic AI-template aesthetics.
20. Make the visual identity distinctive and intentional.

The master prompt must include the actual discovered:

* product context
* users
* roles
* routes
* major workflows
* entities
* important forms
* important actions
* redesigned information architecture
* selected visual direction
* design system
* responsive strategy

The output must be detailed enough that I can paste it directly into Figma Make without having to explain the application again.

---

# PART 15 — FINAL OUTPUT STRUCTURE

Return the final document using this structure:

# COMPLETE PRODUCT REDESIGN CONTEXT

## 1. Product Understanding

## 2. Users & Roles

## 3. Functional Requirements

## 4. User Journeys

## 5. Existing Design — TO BE DISCARDED

## 6. New Information Architecture

## 7. Three New Design Concepts

## 8. Selected Design Direction

## 9. New Design System

## 10. Screen-by-Screen Redesign

## 11. Responsive Strategy

## 12. UX Improvements

## 13. Realistic Demo Content

## 14. FIGMA MAKE MASTER PROMPT

## 15. Confirmed Product Facts

## 16. Design Recommendations

---

# CRITICAL FINAL CHECK

Before producing the final document:

Check the repository again.

Make sure:

* Product functionality is based on actual code.
* Routes are real.
* Entities are real.
* Forms are real.
* User flows are real.
* No secret credentials are exposed.
* The new design does NOT copy the current design.
* The three concepts are meaningfully different.
* The selected direction is genuinely a fresh redesign.
* Figma Make receives PRODUCT CONTEXT + NEW DESIGN DIRECTION, not the old UI.

The goal is NOT:

"make my existing website look better."

The goal is:

"understand my existing product and design an entirely new product experience around it."
