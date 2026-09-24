# Codebase design reference

Read this file for full glossary definitions, deep-versus-shallow diagrams, rejected framings, or longer testability examples.

## Glossary

Use these terms exactly; do not substitute “component,” “service,” “API,” or “boundary.” Consistent language is the point.

**Module:** anything with an interface and an implementation. It is deliberately scale-agnostic: a function, class, package, or tier-spanning slice. Avoid “unit,” “component,” and “service.”

**Interface:** everything a caller must know to use the module correctly: type signature, invariants, ordering constraints, error modes, required configuration, and performance characteristics. Avoid “API” and “signature,” which describe only the type-level surface.

**Implementation:** what is inside a module—its body of code. This differs from **Adapter**: a small adapter may have a large implementation, such as a Postgres repository, while a large adapter may have a small implementation, such as an in-memory fake. Use “adapter” when the seam is the topic and “implementation” otherwise.

**Depth:** leverage at the interface: behavior a caller or test can exercise per unit of interface it must learn. A module is **deep** when much behavior sits behind a small interface and **shallow** when the interface is nearly as complex as the implementation.

**Seam** _(Michael Feathers)_: a place where behavior can be altered without editing in that place; the location where a module's interface lives. Seam placement is a design decision separate from what goes behind it. Avoid “boundary,” which is overloaded by DDD's bounded context.

**Adapter:** a concrete thing that satisfies an interface at a seam. It describes role—the slot it fills—not the substance inside it.

**Leverage:** what callers get from depth: more capability per unit of interface learned. One implementation pays back across N call sites and M tests.

**Locality:** what maintainers get from depth. Change, bugs, knowledge, and verification concentrate rather than spreading across callers. Fix once, fixed everywhere.

## Deep versus shallow

A deep module has a small interface over substantial hidden implementation:

```text
┌─────────────────────┐
│   Small Interface   │  ← Few methods, simple params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← Complex logic hidden
│                     │
└─────────────────────┘
```

A shallow module has a large interface over little implementation and should generally be avoided:

```text
┌─────────────────────────────────┐
│       Large Interface           │  ← Many methods, complex params
├─────────────────────────────────┤
│  Thin Implementation            │  ← Just passes through
└─────────────────────────────────┘
```

When designing an interface, ask whether methods or parameters can be reduced and whether more complexity can be hidden inside.

## Testability examples

Accept dependencies instead of creating them:

```typescript
// Testable
function processOrder(order, paymentGateway) {}

// Hard to test
function processOrder(order) {
  const gateway = new StripeGateway();
}
```

Return results instead of producing side effects:

```typescript
// Testable
function calculateDiscount(cart): Discount {}

// Hard to test
function applyDiscount(cart): void {
  cart.total -= discount;
}
```

Keep the surface small. Fewer methods require fewer behavioral cases; fewer parameters reduce setup.

## Rejected framings

- **Depth as implementation-lines divided by interface-lines** (Ousterhout): it rewards padding. Use depth-as-leverage instead.
- **“Interface” as only the TypeScript `interface` keyword or public class methods:** too narrow; the interface includes every fact a caller must know.
- **“Boundary”:** overloaded with DDD's bounded context. Say **seam** or **interface**.