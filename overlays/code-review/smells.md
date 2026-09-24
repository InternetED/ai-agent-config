# Fowler smell baseline

Read this file when preparing the Standards sub-agent prompt. Paste this baseline **in full** into that prompt; the sub-agent has no other access to it.

The repository overrides this baseline: suppress a smell when documented repository guidance explicitly endorses it. Every smell is a labelled heuristic and judgment call, never a hard violation. Skip issues tooling already enforces.

Each entry gives the smell, what it is, and the usual correction:

- **Mysterious Name:** a function, variable, or type whose name does not reveal what it does or holds. → Rename it; if no honest name comes, the design is unclear.
- **Duplicated Code:** the same logic shape appears in more than one changed hunk or file. → Extract the shared shape and call it from both.
- **Feature Envy:** a method reaches into another object's data more than its own. → Move the method onto the data it envies.
- **Data Clumps:** the same fields or parameters repeatedly travel together, suggesting a missing type. → Bundle them into one type and pass that.
- **Primitive Obsession:** a primitive or string stands in for a domain concept that deserves a type. → Give the concept its own small type.
- **Repeated Switches:** the same `switch` or `if` cascade over the same type recurs across the change. → Replace it with polymorphism or one shared map.
- **Shotgun Surgery:** one logical change forces scattered edits across many files. → Gather what changes together into one module.
- **Divergent Change:** one file or module is edited for several unrelated reasons. → Split it so each module changes for one reason.
- **Speculative Generality:** abstraction, parameters, or hooks support needs absent from the spec. → Delete them; inline until a real need appears.
- **Message Chains:** long `a.b().c().d()` navigation exposes relationships the caller should not depend on. → Hide the walk behind one method on the first object.
- **Middle Man:** a class or function mostly delegates onward. → Remove it and call the real target directly.
- **Refused Bequest:** a subclass or implementer ignores or overrides most inherited behavior. → Drop inheritance and use composition.