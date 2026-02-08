# DogTrainr UI Redesign — Design Language & Improvements

## Reference
Based on the Instagram-style reference screenshot: clean, modern mobile-friendly UI with soft colors, rounded cards, generous whitespace, and clear visual hierarchy.

## Design Language

### Colors
- **Background**: `bg-gray-50` (#f8fafc) — soft light gray
- **Cards/Surfaces**: `bg-white` with `shadow-sm` and `rounded-2xl`
- **Primary text**: `text-slate-800` (#1e293b) — dark navy
- **Secondary text**: `text-slate-500` (#64748b)
- **Accent/Links**: `text-blue-600` (#2563eb) — blue for interactive elements
- **Primary buttons**: `bg-blue-600 text-white` with `hover:bg-blue-700`
- **Danger buttons**: `bg-red-50 text-red-600` with `hover:bg-red-100`
- **Borders**: `border-slate-200` (#e2e8f0) — subtle dividers

### Typography
- **Page titles**: `text-2xl font-bold text-slate-800`
- **Section headings**: `text-lg font-semibold text-slate-700`
- **Body text**: `text-base text-slate-600`
- **Small/meta text**: `text-sm text-slate-500`

### Spacing
- **Page padding**: `px-4 py-6` (mobile), `px-6 py-8` (desktop)
- **Card padding**: `p-4` to `p-6`
- **Between sections**: `space-y-6`
- **Between list items**: `space-y-3`
- **Between form fields**: `space-y-5`

### Components

#### Cards
```
bg-white rounded-2xl shadow-sm p-4
```
Used for: list items, detail views, form containers

#### Buttons
- **Primary**: `bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors`
- **Secondary**: `bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-medium hover:bg-slate-200 transition-colors`
- **Danger**: `bg-red-50 text-red-600 px-6 py-3 rounded-xl font-medium hover:bg-red-100 transition-colors`
- **Link-style**: `text-blue-600 hover:text-blue-700 font-medium`

#### Inputs
```
w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800
focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
```

#### Select dropdowns
Same as inputs: `rounded-xl bg-slate-50 border border-slate-200`

#### Navigation
- **Header**: `bg-white shadow-sm` sticky top with logo + title
- **Bottom nav**: `fixed bottom-0 bg-white border-t border-slate-200` with icon+label tabs
- **Back links**: Left arrow `←` + text, `text-slate-600`

#### List Items (card-style rows)
```
bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between
```
With chevron `>` on the right side for navigable items.

#### Tables (schedule)
Replace raw HTML tables with a card-based grid layout:
```
grid grid-cols-7 gap-2
```
Each day as a card column with rounded header.

### Layout
- **Max width**: `max-w-lg mx-auto` (mobile-first, centered)
- **Min height**: `min-h-screen bg-gray-50`
- **Content area**: Between header and bottom nav, with padding

---

## Page-by-Page Improvements

### App Shell (App.tsx, index.css, App.css)
- Remove dark theme entirely — light-only design
- Replace pipe-separated nav with a fixed bottom navigation bar (3 tabs: Dogs, Trainings, Plans)
- Header: white bg, sticky, logo + "DogTrainr" title left-aligned, clean shadow
- Body: `bg-gray-50 min-h-screen`
- Remove all legacy CSS from index.css and App.css (replaced by Tailwind)

### Dog List (`/`)
- Page title "Your Dogs" left-aligned with "+" button on the right
- Dog items as cards: photo (48px circle) + name, with chevron right
- Empty state: centered illustration-style message with prominent CTA button
- Remove `<ul>/<li>` — use `div` with card styling

### Dog Form (`/dogs/new`)
- Back arrow + "Register a Dog" header
- Card container for the form
- Styled text input with label above
- File input replaced with a photo upload area (rounded circle with camera icon placeholder)
- Full-width submit button at bottom

### Dog Profile (`/dogs/:id`)
- Back arrow + dog name as header
- Large dog photo (rounded-2xl, max-height constrained)
- "Training Plan" section as a card
- Styled select dropdown and assign button
- Plan schedule in card-based layout
- Unassign as a danger-styled button

### Training List (`/trainings`)
- Same pattern as Dog List: title + "+" button
- Training items as cards with chevron
- Empty state with CTA

### Training Form (`/trainings/new`)
- Back arrow + "Create Training" header
- Card form container
- Styled name input
- MD editors with labels, proper spacing
- Full-width submit button

### Training Detail (`/trainings/:id`)
- Back arrow + training name as header
- Procedure section in a card
- Tips section in a card
- Edit button as primary action (bottom or header)
- Back link styled as arrow

### Training Edit (`/trainings/:id/edit`)
- Same layout as Training Form but with "Edit Training" header
- Pre-filled fields

### Plan List (`/plans`)
- Same pattern as Dog List / Training List
- Plan items as cards with chevron

### Plan Form (`/plans/new`)
- Back arrow + "Create Plan" header
- Card form container for name input
- Schedule editor: card-based day columns in a horizontal scroll or grid
- Checkboxes styled with proper spacing
- Full-width submit button

### Plan Detail (`/plans/:id`)
- Back arrow + plan name header
- Schedule display as card-based day grid
- Edit button as primary action

### Plan Edit (`/plans/:id/edit`)
- Same layout as Plan Form but "Edit Plan" header

### TrainingPlanSchedule (shared component)
- Replace HTML table with a responsive card grid
- Day headers as rounded pills/badges
- Training names as links inside each day card
