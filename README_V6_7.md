# V6.7 – Mobile-first UI polish (Test)

This release builds on V6.6. Keep running against `test_2010`; it does not require a new SQL migration.

## UI refinements
- Mobile: Chibi is collapsed by default into a compact floating control; opening a photo viewer or the love-stamp celebration hides Chibi.
- Polaroid album cards: single-column layout on phones; more compact heart controls and a stamp sticker anchored on the photo/card area. Stamp replay never writes another stamp (the optional view event remains).
- Form: role-aware instructions/placeholder, phone-width send action, responsive text, and upload/save-specific labels.
- Stamp dates: more legible Vietnamese date/time; reduced-motion CSS alternative.
- Fixed malformed role-aware `setFormError` string from V6.6.

## Verification and deployment
1. Run `npm install`, `npm run lint`, `npm run build` on the developer workstation.
2. Run `npx vercel dev` with Development variables pointing ONLY to Supabase `test_2010`.
3. Test at 360px, 390px, tablet and desktop. Confirm photo modal, Chibi floating button, stamps, likes, login/logout, gift flow, loading and error states.
4. Check browser console and Network for errors; DO NOT publish until actual builds and smoke tests pass.

### Notes
- No changes to server API, session security or database structure in this UI-focused release.
- Existing limitations (common password, public Cloudinary URLs, centralized rate-limiting pending) remain.
- The build was **not** verified in the generation environment because dependency installation timed out. TypeScript files were syntax-parsed only.
