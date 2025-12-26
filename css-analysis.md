# CSS Specificity Issue Analysis

## Problem Identified

The issue is with CSS specificity. From the generated CSS, we have these key selectors:

1. **Dropdown Menu Rule** (higher specificity):
```css
.\[\&_svg\:not\(\[class\*\=\'size-\'\]\)\]\:size-4 svg:not([class*=size-]) {
    width: var(--spacing-4);
    height: var(--spacing-4)
}
```

2. **Direct Size Classes** (lower specificity):
```css
.\!size-6 {
    width: var(--spacing-6) !important;
    height: var(--spacing-6) !important
}

.size-6 {
    width: var(--spacing-6);
    height: var(--spacing-6)
}
```

## Specificity Breakdown

### The Dropdown Selector:
`.\[\&_svg\:not\(\[class\*\=\'size-\'\]\)\]\:size-4 svg:not([class*=size-])`

This translates to:
```css
.[&_svg:not([class*='size-'])]:size-4 svg:not([class*=size-])
```

**Specificity Calculation:**
- 1 class (the escaped class name)
- 1 attribute selector `:not([class*=size-])`  
- 1 element selector (svg)
- 1 additional `:not([class*=size-])` on the svg

**Total: (0,0,2,1)** or approximately 21 specificity points

### The !important class:
`.\!size-6`

**Specificity Calculation:**
- 1 class
- `!important` flag

**Total: (0,0,1,0) + !important**

## Why !important Doesn't Work

The issue is that even with `!important`, the dropdown rule is still more specific because:

1. The dropdown rule uses a **descendant selector** with an attribute selector
2. The `svg:not([class*=size-])` part means it targets SVGs that DON'T have any class containing "size-"
3. When you add `!size-6`, it technically contains "size-" in the class name, but the selector specificity calculation happens BEFORE the CSS cascade

## Solutions

### Solution 1: Use More Specific Selector (Recommended)
Instead of just `!size-6`, use a more specific selector that matches the dropdown's specificity:

```tsx
<Icons.Plus className="size-6 [&]:!size-6" />
```

or

```tsx
<Icons.Plus className="!size-6 ![&]:!size-6" />
```

### Solution 2: Modify the Dropdown Component
Change the dropdown component's CSS to be less aggressive by using a lower specificity selector.

### Solution 3: CSS Custom Properties Override
Use CSS custom properties at the component level:

```tsx
<Icons.Plus 
  className="!size-6" 
  style={{ 
    '--tw-size': 'var(--spacing-6)',
    width: 'var(--tw-size)',
    height: 'var(--tw-size)'
  }} 
/>
```

### Solution 4: Inline Styles (Last Resort)
```tsx
<Icons.Plus 
  className="!size-6" 
  style={{ width: '1.5rem', height: '1.5rem' }} 
/>
```

## Root Cause

The dropdown menu component uses this pattern:
```css
[&_svg:not([class*='size-'])]:size-4
```

This is designed to:
1. Target SVG children that don't have size classes
2. Apply size-4 to them by default
3. But it creates high specificity that's hard to override

The selector `svg:not([class*=size-])` specifically excludes SVGs with size classes, but the parent context selector increases overall specificity.