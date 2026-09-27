# UI audit — Bobderek Mayaka

Final production audit completed before packaging.

- Brand palette restricted to deep blue, steel blue, warm gold, white, dark neutral text and light neutral surfaces.
- No external template stylesheet or legacy project naming remains.
- Project/canonical domain is `bobderek-mayaka.vercel.app`.
- Home hero uses a law-specific local SVG illustration.
- Inner-page hero visuals are compact panels, not full-screen image slabs.
- All law illustrations are local, unique and used once.
- Bobderek's portrait is used in Bobderek-specific sections; no generic professional substitutes are used.
- Non-hero portrait imagery is constrained to compact tiles/cards.
- Header, navigation, buttons, section spacing, content hierarchy and footer were rebuilt as one consistent system.
- Footer redesigned into a structured three-column layout with stronger brand/contact hierarchy.
- WhatsApp/call dock rebuilt for desktop and mobile; it moves to the bottom-right on small screens to avoid blocking content.
- Mobile menu, buttons, hero stack, forms, cards, footer and contact rail have dedicated small-screen rules down to 560px and below.
- No external image dependencies: production artwork and portraits are local for faster rendering.
- Local links/assets, semantic structure, image alt text, canonical URLs, palette tokens and duplicate content-image usage are checked by `npm run check`.
