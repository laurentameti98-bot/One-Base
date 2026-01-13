# 🧭 CRM DESIGN BIBLE
Single Source of Truth for UI, UX & Implementation

This document defines the non-negotiable design, layout, and UX rules for this CRM.
All new pages, components, and changes MUST comply with this document.

---

## 0. Purpose & Philosophy

This project uses a strict, code-first design system.

Goals:
- Zero visual drift
- Predictable UX
- Fast iteration with AI tooling (Cursor / Claude)
- No subjective design decisions during implementation

Design is NOT debated at implementation time.
If something is missing → stop and extend the design system first.

---

## 1. Source of Truth (Hierarchy)

The following files are authoritative, in this order:

1. DESIGN_BIBLE.md (this document)
2. crm-design-system.html (reference implementation)
3. /frontend/styles/tokens.css
4. /frontend/styles/layout.css
5. /frontend/styles/components.css

Rules:
- No other visual rules exist
- No inline styles
- No ad-hoc CSS or Tailwind utilities
- No creative interpretation

---

## 2. Absolute Rules (Must Always Be Followed)

DO NOT:
- Introduce new colors
- Introduce new spacing values
- Introduce new font sizes or weights
- Add inline styles
- Create new button variants
- Create new layouts without approval
- Reinterpret mockups creatively

If a needed pattern does not exist:
STOP and ASK before implementing.

---

## 3. Design Tokens (Visual Language)

All visuals are defined via CSS variables in tokens.css.

Token categories:
- Colors (backgrounds, borders, text, semantic states)
- Typography (font sizes, weights, line heights)
- Spacing (xs → 3xl)
- Border radius (sm → lg)
- Shadows
- Transitions

Rules:
- No hardcoded values outside tokens.css
- Tokens are immutable unless explicitly changed

---

## 4. Layout System (Mandatory)

Every page MUST follow this hierarchy:

.page-container  
 ├─ .breadcrumb (optional)  
 ├─ .page-header  
 │   ├─ .page-header-top  
 │   │   ├─ .page-header-title-section  
 │   │   │   ├─ .page-title  
 │   │   │   ├─ .page-subtitle (optional)  
 │   │   │   └─ .page-meta (optional)  
 │   │   └─ .page-actions  
 └─ Content Sections

No alternative structures are allowed.

---

## 5. Page Templates (Composition Rules)

### 5.1 Home / Dashboard

Structure:
- Page Header
- KPI Grid
- Quick Actions
- Recent Activities (Timeline)

Allowed components:
- .kpi-grid
- .kpi-card
- .quick-actions
- .timeline

---

### 5.2 List Pages (Accounts, Contacts, Deals, Activities)

Structure:
- Breadcrumb
- Page Header (title + primary action)
- Search / Filter Bar
- Content Section
  - Table OR Empty State
  - Pagination

Rules:
- Tables must use .table inside .table-container
- Entire row clickable where applicable
- Pagination respects filters and search

---

### 5.3 Detail Pages (Account, Contact, Deal, Activity)

Structure:
- Breadcrumb
- Page Header (title, meta, actions)
- Content Sections:
  - Details (Field Grid)
  - Related Records (Tables)
  - Activities (Timeline)
  - Notes (if applicable)

Rules:
- Details MUST use .field-grid
- Related entities MUST be tables
- No freeform layouts

---

## 6. Component Catalog (Allowed Components Only)

### 6.1 Buttons

Allowed button variants:
- .btn.btn-primary
- .btn.btn-secondary
- .btn.btn-ghost
- .btn.btn-destructive
- Optional size modifier: .btn-sm

No other buttons are allowed.

---

### 6.2 Tables

Rules:
- Wrapper: .table-container
- Table: .table
- Hover states enabled
- Clickable rows where applicable

---

### 6.3 Badges

Allowed badges:
- .badge
- .badge-primary
- .badge-success

Used for:
- Stages
- Status
- Roles
- Flags (Primary, Completed, etc.)

---

### 6.4 Field Grid (Read-only Details)

Structure:
- .field-grid
- .field-row
- .field-label
- .field-value
- .field-value-empty

Used for all read-only entity details.

---

### 6.5 Timeline (Activities)

Mandatory structure:

.timeline  
 ├─ .timeline-entry  
 │   ├─ .timeline-entry-header  
 │   ├─ .timeline-entry-type  
 │   ├─ .timeline-entry-content  
 │   └─ .timeline-entry-details (collapsible)

Rules:
- Clicking entry toggles details
- Actions only appear in expanded state
- Used everywhere activities are displayed

---

## 7. UX Rules (Behavioral Contract)

### 7.1 Empty States

Every list or section must show:
- Clear message
- Primary CTA
- No blank screens

---

### 7.2 Validation & Errors

Rules:
- Server-side validation is authoritative
- UI must render API error messages
- No silent failures
- Field-level + form-level errors allowed

---

### 7.3 Filters

Rules:
- Filters are server-side
- Active filters must be visible
- Filters must be clearable
- Pagination must respect filters

---

### 7.4 Loading States

Rules:
- Do not block entire pages
- Prefer subtle loading indicators
- Never leave the user guessing

---

## 8. Accessibility & Quality

- Buttons must be keyboard focusable
- No hidden interactive elements
- Semantic HTML preferred
- Consistent click targets

---

## 9. Reference Implementation

The file crm-design-system.html is the canonical visual reference.

If behavior or layout is unclear:
Compare against this file.
Do NOT invent alternatives.

---

## 10. Cursor / Claude Execution Contract

MANDATORY INSTRUCTION TO PASTE BEFORE TASKS:

SYSTEM INSTRUCTIONS (MANDATORY):

Before making any UI changes:
- Read and comply with:
  - /design-system/DESIGN_BIBLE.md
  - crm-design-system.html
  - styles/tokens.css
  - styles/layout.css
  - styles/components.css

Rules:
- Do NOT invent UI patterns
- Do NOT add styles
- Use existing classes only
- Follow page templates strictly
- Validate against the design bible before final output

If something is missing or unclear:
STOP and ASK before implementing.

---

## 11. Final Rule

If the UI looks right but violates this document, it is WRONG.

Consistency > creativity  
Contract > interpretation  
System > taste
