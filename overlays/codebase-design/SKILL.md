---
name: codebase-design
description: Design or improve deep module interfaces, seams, testability, and AI navigability. Use when code structure needs leverage and locality.
---

# Codebase Design

Design **deep modules**: substantial behavior behind a small interface, placed at a clean seam and testable through that interface. The goals are leverage for callers, locality for maintainers, and natural verification.

## Use when / Not for

- **Use when:** designing or improving a module interface, finding deepening opportunities, placing a seam, or making code more testable or AI-navigable.
- **Not for:** a full architecture survey—use `improve-codebase-architecture`; implementing a ticket—use `implement`.

## Vocabulary

- **Module:** anything with an interface and implementation, at any scale.
- **Interface:** everything a caller must know to use the module correctly.
- **Implementation:** the behavior hidden inside a module.
- **Depth:** leverage supplied per unit of interface learned.
- **Seam:** the location where behavior can vary without editing the caller.
- **Adapter:** a concrete implementation filling an interface at a seam.
- **Leverage:** capability callers receive from depth.
- **Locality:** concentration of change, bugs, knowledge, and verification.

Read [reference.md](reference.md) only for full glossary definitions, diagrams, rejected framings, or longer testability examples.

A **deep** module hides substantial behavior behind a small interface; a **shallow** module exposes nearly as much complexity as it hides.

## Principles

- Depth belongs to the interface, not implementation size. Internal composition and private seams remain possible.
- Apply the deletion test: if removing the module spreads complexity across callers, it earned its keep; if complexity disappears, it was a pass-through.
- The interface is also the test surface. Wanting to test past it usually signals the wrong module shape.
- One adapter makes a seam hypothetical; two adapters make it real. Introduce variation points only for actual variation.
- Reduce method count, simplify parameters, and hide caller-irrelevant complexity.

## Designing for testability

1. Accept dependencies instead of constructing them internally.
2. Return results instead of mutating hidden state or performing avoidable side effects.
3. Keep the surface area small: fewer methods and parameters mean fewer cases and simpler setup.

## Relationships

- A module has one interface presented to callers and tests.
- Depth is a property of a module measured against that interface.
- A seam is where the module's interface lives; an adapter satisfies it there.
- Depth creates leverage for callers and locality for maintainers.

## Going deeper

Read [DEEPENING.md](DEEPENING.md) when deepening a cluster from its dependencies: dependency categories, seam discipline, and replace-don't-layer testing.

Read [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md) when comparing radically different interfaces on depth, locality, and seam placement.
