# Design System Component Coverage — Figma vs Code

## Context

Mapped all components visible in the Figma Components page (`15:477`) against the two-tier component architecture in `packages/design-system/src/components/`. Analyzed variant/property alignment for Button and IconButton via Figma metadata.

## Findings

### Component Mapping

| Figma Component | Code ui/ | Code patterns/ | Status |
|-----------------|----------|----------------|--------|
| Icon Button | — | icon-button.tsx | MATCH |
| Button | button.tsx | — | MATCH |
| Fill | — | — | MISSING in code |
| Input | input.tsx | input-field.tsx | MATCH |
| Dropdown Option | — | — | MISSING in code |
| Dropdown Item | dropdown-menu.tsx | — | MATCH |
| Dropdown/Select | select.tsx | — | MATCH |
| Card Setup | — | card/ | MATCH |
| Values | amount.tsx | balance.tsx | PARTIAL (unclear mapping) |
| Card Small | — | card/ | MATCH |
| Card Large | — | card/ | MATCH |
| Pill | — | pill.tsx | MATCH |
| Tabs | tab.tsx | tabs.tsx | MATCH |
| Toast | — | — | MISSING in code (planned, will use lib) |

### Components in Code but NOT in Figma

These exist in code but have no Figma representation:

**ui/ tier**: calendar.tsx, currency-input.tsx, dialog.tsx, form.tsx, avatar.tsx, popover.tsx, scroll-area.tsx, separator.tsx, spinner.tsx, field.tsx, label.tsx

**patterns/ tier**: date-picker.tsx, fab.tsx, field-input.tsx

Total: ~14 components without Figma counterparts. Some are utility/infrastructure (form.tsx, label.tsx, field.tsx) that reasonably don't need Figma specs. Others like Dialog, Calendar, FAB, and DatePicker are user-facing and should ideally have Figma designs.

### Button — Variant API Comparison

Figma properties → Code variants:

| Figma Property | Figma Values | Code Prop | Code Values | Status |
|----------------|-------------|-----------|-------------|--------|
| Hierarchy | Primary, Secondary, Tertiary | variant | primary, secondary, tertiary | MATCH |
| Type | Default, Destructive, Ghost | intent | default, destructive, ghost | MATCH (renamed) |
| State | Active, Hover, Disabled | — | CSS pseudo-classes | MATCH (different mechanism) |
| Dark-Mode | yes, no | — | not implemented | MISSING |

The naming difference (Hierarchy→variant, Type→intent) is fine — Figma uses design language, code uses developer-friendly names. The semantic mapping is correct.

Dark mode is a planned feature but has zero implementation in code currently.

### IconButton — Variant API Comparison

| Figma Property | Figma Values | Code Prop | Code Values | Status |
|----------------|-------------|-----------|-------------|--------|
| Nome | Ocultar, Mostrar, Fechar, Voltar, Ir, Filtro, Deletar | icon | keyof Icons | MATCH (different mechanism) |
| Status | Default, Hover | — | CSS hover: | MATCH |
| Dark-Mode | yes, no | — | not implemented | MISSING |
| — | — | size | default, sm | EXTRA in code |
| — | — | variant | default, dashed | EXTRA in code |

Code has `size` and `variant` props that don't exist in Figma. This means code evolved beyond the original design — either Figma needs updating or these are implementation-only concerns.

## Decisions / Open Questions

- Decision: Toast will be implemented using a library (sonner recommended — shadcn/ui default, lightweight, Tailwind-friendly)
- Decision: Dark mode is a real planned feature, not abandoned
- Open: Should the ~14 code-only components be added to Figma for design consistency?
- Open: Should IconButton's `size` and `dashed` variants be reflected in Figma?
- Open: What is the "Fill" component in Figma? No clear code counterpart found.

## References

- `packages/design-system/src/components/ui/` — primitives tier (19 entries)
- `packages/design-system/src/components/patterns/` — composed tier (10 entries)
- `packages/design-system/src/components/ui/button.tsx` — Button implementation with CVA
- `packages/design-system/src/components/patterns/icon-button.tsx` — IconButton with tailwind-variants
- Figma Components page: node `15:477` in file `a8ftE9e7at7JQBLCm9wOoj`
