# Accessibility Guidelines

ARIA patterns, keyboard navigation, and focus management for Mantine React components.

## General Principles

1. **Semantic HTML First**: Use `<button>`, `<nav>`, `<main>`, etc. over `<div>` with ARIA roles
2. **Progressive Enhancement**: Ensure basic functionality without JavaScript
3. **Keyboard Navigation**: All interactive elements must be keyboard-accessible
4. **Screen Reader Support**: Provide clear labels and state information
5. **Focus Management**: Visible focus indicators and logical focus order

## Semantic HTML

### Button Elements

❌ **Bad:**
```typescript
<div onClick={handleClick} role="button" tabIndex={0}>
  Click me
</div>
```

✅ **Good:**
```typescript
<button onClick={handleClick}>
  Click me
</button>
```

### Navigation

❌ **Bad:**
```typescript
<div className="nav">
  <div className="link">Home</div>
</div>
```

✅ **Good:**
```typescript
<nav>
  <a href="/">Home</a>
</nav>
```

### Headings Hierarchy

✅ **Good:**
```typescript
<article>
  <h2>Section Title</h2>
  <p>Content</p>
  <h3>Subsection</h3>
  <p>More content</p>
</article>
```

## ARIA Attributes

### Labels

```typescript
// Visible label
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// aria-label for icon buttons
<button aria-label="Close dialog">
  <CloseIcon />
</button>

// aria-labelledby for composite widgets
<div role="dialog" aria-labelledby="dialog-title">
  <h2 id="dialog-title">Confirm Action</h2>
</div>
```

### Descriptions

```typescript
// aria-describedby for additional context
<input
  id="password"
  type="password"
  aria-describedby="password-hint"
/>
<span id="password-hint">
  Password must be at least 8 characters
</span>
```

### State

```typescript
// Toggle state
<button aria-pressed={isPressed}>
  Toggle
</button>

// Expanded state
<button aria-expanded={isOpen} aria-controls="menu">
  Menu
</button>
<div id="menu" hidden={!isOpen}>
  {/* menu items */}
</div>

// Selected state
<div role="option" aria-selected={isSelected}>
  Option
</div>
```

### Live Regions

```typescript
// Announce dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Assertive for important updates
<div aria-live="assertive" role="alert">
  {errorMessage}
</div>
```

## Keyboard Navigation

### Tab Order

```typescript
// Natural tab order (default)
<button>First</button>
<button>Second</button>

// Skip tab order (for programmatic focus only)
<div tabIndex={-1}>Focus target</div>

// Add to tab order (avoid if possible, prefer semantic elements)
<div tabIndex={0} role="button" onClick={...}>
  Custom button
</div>
```

### Arrow Key Navigation

Example pattern for composite widgets:

```typescript
import { useRef } from 'react';

function List({ items }: { items: string[] }) {
  const listRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    const currentIndex = items.indexOf(event.currentTarget.textContent || '');
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = (currentIndex + 1) % items.length;
      focusItem(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = (currentIndex - 1 + items.length) % items.length;
      focusItem(prev);
    }
  };
  
  const focusItem = (index: number) => {
    const item = listRef.current?.children[index] as HTMLElement;
    item?.focus();
  };
  
  return (
    <div ref={listRef} role="listbox">
      {items.map((item, i) => (
        <div
          key={item}
          role="option"
          tabIndex={i === 0 ? 0 : -1}
          onKeyDown={handleKeyDown}
        >
          {item}
        </div>
      ))}
    </div>
  );
}
```

### Keyboard Shortcuts

Common patterns:

```typescript
function handleKeyDown(event: React.KeyboardEvent) {
  // Escape to close
  if (event.key === 'Escape') {
    onClose();
  }
  
  // Enter/Space to activate
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onActivate();
  }
  
  // Cmd/Ctrl + K for search
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    openSearch();
  }
}
```

## Focus Management

### Focus Trap

Use Mantine's `useFocusTrap` hook:

```typescript
import { useFocusTrap } from '@mantine/hooks';

function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const focusTrapRef = useFocusTrap(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <div ref={focusTrapRef} role="dialog" aria-modal="true">
      <h2>Modal Title</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Focus Return

```typescript
import { useRef, useEffect } from 'react';

function Dialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const triggerRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store element that triggered dialog
      triggerRef.current = document.activeElement as HTMLElement;
    } else if (triggerRef.current) {
      // Return focus when dialog closes
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);
  
  // ...
}
```

### Programmatic Focus

```typescript
import { useRef, useEffect } from 'react';

function Component({ autoFocus }: { autoFocus?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);
  
  return <input ref={inputRef} />;
}
```

## Data Attributes for State

Expose component state for both CSS and accessibility:

```typescript
function Toggle({ pressed }: { pressed: boolean }) {
  return (
    <button
      aria-pressed={pressed}
      data-pressed={pressed}
      className="toggle"
    >
      {pressed ? 'On' : 'Off'}
    </button>
  );
}
```

CSS can target state:
```css
.toggle[data-pressed="true"] {
  background: var(--color-primary);
}
```

## Common ARIA Patterns

### Accordion

```typescript
function Accordion({ items }: { items: Array<{ title: string; content: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>
          <button
            aria-expanded={openIndex === i}
            aria-controls={`panel-${i}`}
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
          >
            {item.title}
          </button>
          <div
            id={`panel-${i}`}
            role="region"
            aria-labelledby={`button-${i}`}
            hidden={openIndex !== i}
          >
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Tabs

```typescript
function Tabs({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  const [activeTab, setActiveTab] = useState(0);
  
  return (
    <div>
      <div role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={activeTab === i}
            aria-controls={`panel-${i}`}
            tabIndex={activeTab === i ? 0 : -1}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={i}
          id={`panel-${i}`}
          role="tabpanel"
          aria-labelledby={`tab-${i}`}
          hidden={activeTab !== i}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

### Modal Dialog

```typescript
function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const focusTrapRef = useFocusTrap(isOpen);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />
      
      {/* Dialog */}
      <div
        ref={focusTrapRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title">{title}</h2>
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </>
  );
}
```

### Disclosure (Show/Hide)

```typescript
function Disclosure({ summary, children }: { summary: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const contentId = useId();
  
  return (
    <div>
      <button
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(!isOpen)}
      >
        {summary}
      </button>
      <div id={contentId} hidden={!isOpen}>
        {children}
      </div>
    </div>
  );
}
```

## Testing Accessibility

### Query by Role

```typescript
import { render, screen } from '@mantine-tests/core';

test('button is accessible', () => {
  render(<button>Click me</button>);
  
  // Query by role (preferred)
  const button = screen.getByRole('button', { name: 'Click me' });
  expect(button).toBeInTheDocument();
});
```

### Accessible Name

```typescript
test('input has accessible label', () => {
  render(
    <>
      <label htmlFor="name">Name</label>
      <input id="name" />
    </>
  );
  
  const input = screen.getByLabelText('Name');
  expect(input).toBeInTheDocument();
});
```

### ARIA Attributes

```typescript
test('button shows pressed state', () => {
  render(<button aria-pressed={true}>Toggle</button>);
  
  const button = screen.getByRole('button', { name: 'Toggle', pressed: true });
  expect(button).toHaveAttribute('aria-pressed', 'true');
});
```

## Resources

- **MDN ARIA Practices**: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA
- **W3C ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **Mantine Accessibility**: https://mantine.dev/guides/accessibility/
- **Testing Library Queries**: https://testing-library.com/docs/queries/about

## Checklist

Before shipping a component, verify:

- [ ] All interactive elements are keyboard-accessible
- [ ] Focus indicators are visible
- [ ] ARIA labels are present for icon-only controls
- [ ] State changes are announced to screen readers
- [ ] Color is not the only indicator of state
- [ ] Focus is trapped in modals/dialogs
- [ ] Focus returns to trigger element when dialogs close
- [ ] Heading hierarchy is logical
- [ ] Semantic HTML is used where possible
- [ ] Tab order is logical
- [ ] Component works with keyboard only
- [ ] Component works with screen reader
