## 1. How to run

No installation needed. Just open `index.html` in any browser —
double-click it, or drag it into Chrome/Firefox.

Or use VS Code with the Live Server extension:
- Right-click `index.html` → "Open with Live Server"

**Deployed URL:** https://harsh-dubey20.github.io/habit-tracker/


## 2. Stack & design choices

**Stack: Vanilla HTML, CSS, and JavaScript**

I picked vanilla JS because it's what I'm most comfortable with
and it's the most practical choice for this task. No build step,
no dependencies, no framework to fight — anyone can open
index.html and it just works. For a single-page app with no
backend, adding React would have been unnecessary complexity.

**Visual decision 1 — The grid layout**

The habit name column uses CSS Grid with `minmax(130px, 1fr)` —
it's fluid and expands on wide screens, while the 7 day columns
stay a fixed size. I made this choice because responsiveness
matters: on a phone the name column compresses but stays readable,
and the cells stay large enough to tap. A fixed-width layout would
have broken on narrow screens or forced horizontal scrolling, which
kills the at-a-glance readability the app depends on.

**Visual decision 2 — Color hierarchy**

Green is reserved only for checked cells — it's the reward. Missed
past days get a very faint red tint, not a big ✕, because a habit
tracker should motivate you, not make you feel guilty. A loud red
cross for every missed day would feel punishing and users would
stop opening the app. Today's column gets a blue highlight so your
eye lands there instantly without having to read the date. Color is
used intentionally — loud where it should celebrate, quiet where it
should not judge.


## 3. Responsive & accessibility

**Responsive behavior**

On a 360px phone, the grid compresses gracefully — the habit name
column shrinks and long names truncate with an ellipsis (...) so
they never overflow into the cells. The day columns stay a fixed
minimum size (32px) so they remain tappable. On a 1440px laptop,
the name column expands fluidly and the whole layout breathes with
more space. No horizontal scrolling at any screen size.

**Accessibility — what I handled**

Keyboard navigation works throughout. You can Tab through the cells
and press Enter to toggle a checkmark. The "Add habit" input field
auto-focuses when opened so you can type immediately without
clicking. Each cell has an aria-label describing the habit name,
day, and checked state so screen readers can announce it correctly.

**Accessibility — what I knowingly skipped**

I did not add a `prefers-reduced-motion` media query. The pop
animation on cell check and the form slide-in animation would play
even for users who have reduced motion enabled in their OS settings.
I skipped this due to time, but the fix is straightforward — wrap
the animations in `@media (prefers-reduced-motion: no-preference)`
so they only run for users who are okay with motion.

I also skipped a day-by-day expanded view. A useful next step would
be letting users toggle between a weekly grid view and a day-focused
view, so on very small screens each habit shows just today's status.
I didn't build this because it would have required a more complex
layout switching system than the time allowed.


## 4. AI usage

I used Claude (Anthropic) as a guide throughout this project.

**What I used it for:**

1. **Project structure** — I asked Claude to help me think through
   the folder structure and how to break the app into logical parts
   (HTML skeleton first, then CSS, then JS in stages). It suggested
   the three-file vanilla approach which matched my own thinking.

2. **Cell styling** — I asked for help with the checked/unchecked
   cell states. Claude gave me a basic border + background approach.
   I kept the green checked state but changed the missed-day styling
   — the original suggestion had a more visible red which felt too
   harsh, so I went with a very faint red tint instead so the app
   feels motivating rather than punishing.

3. **Progress bar** — Claude suggested the gradient fill bar that
   grows as you complete habits across the week. I understood the
   logic — it divides done checkmarks by total possible checkmarks
   up to today — and kept it because it gives an immediate sense of
   how the week is going at a glance.

**Something I changed and why:**

When I was testing in the browser console early on, I ran the
`habits.push()` command twice by mistake and ended up with two
duplicate "Exercise" rows. I caught this myself by looking at the
output and understood that the array was being mutated directly —
a page reload cleared it because localStorage hadn't been called
yet. This told me the render function was working correctly and
that saveToStorage() needed to be called deliberately, not
automatically on every state change. I made sure every user action
(add, delete, toggle) explicitly calls saveToStorage() before
render().


## 5. Honest gap

**What isn't polished enough: CSS styling**

The visual design and CSS was largely written with AI assistance.
I understood what each property was doing — the grid layout, the
color tokens, the responsive breakpoints — but I could not have
written the full stylesheet from scratch at this point. The design
decisions (why green for checked, why faint red for missed, why
fluid name column) were my own reasoning, but the implementation
was guided by AI.

With another day I would go through the CSS line by line, rewrite
the parts I don't fully own yet, and experiment with the visual
details myself — spacing, hover states, animation timing — until
the code feels mine rather than borrowed.

**What I would add with more time: day/week toggle view**

The weekly grid works well on laptop but on very small screens,
a day-focused view would be more useful — just show today's habits
and whether each one is done. The assessment didn't require this
so I didn't build it, but it's the one UX improvement I'd prioritise
next. It would need a view toggle button and a different layout
component that renders a single column instead of seven.