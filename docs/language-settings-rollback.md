# Language Settings Rollback

This document covers verification and rollback for the language settings work.
It is intentionally documentation-only and does not require source changes.

## Scope

Language settings are expected to add a compact flag/code locale button, a
click-open language picker, English as the default language, Ukrainian as the
first picker option, and localized UI strings for Ukrainian plus the 24 official
EU languages.

Rollback should remove only the language settings work. Do not revert unrelated
work in the same branch or worktree.

## Expected Changed Files

For the current implementation, the language settings work is contained in:

- `src/App.tsx`
- `src/App.css`
- `src/i18n/locales.ts`
- `src/i18n/siteCopy.ts`
- `docs/language-settings-rollback.md`

This repo had unrelated uncommitted edits in `src/App.tsx` and `src/App.css`
before the language settings work. Do not run a broad restore on those files
unless you intentionally want to discard those unrelated edits too.

Safer rollback from the current uncommitted state:

```sh
git restore -p src/App.tsx src/App.css
rm -rf src/i18n docs/language-settings-rollback.md
```

When prompted by `git restore -p`, accept only hunks related to locale routing,
language selector UI, i18n imports, localized copy access, and language-control
CSS. Reject pre-existing passive-recorder/source-coverage hunks. Use the `rm`
command only if `src/i18n/` and `docs/language-settings-rollback.md` still
contain only this language-settings work. This repo currently has other
unrelated dirty files, so do not use broad reset commands.

The language settings implementation is expected to touch some or all of these
areas:

- `src/App.tsx`: locale routing, the flag/code language button, click-open
  picker, selected-locale state, and localized text wiring.
- `src/App.css`: responsive header layout plus language picker styling for
  desktop and mobile.
- `src/index.css`: global text, focus, or directionality adjustments if needed.
- `src/main.tsx`: app-level provider wiring if the implementation adds one.
- `src/i18n/**`, `src/locales/**`, `src/translations/**`, or similar: locale
  definitions and translation catalogs if introduced.
- `src/**/*.test.*` or `tests/**`: locale selector and translation coverage if
  introduced.
- `package.json` and `package-lock.json`: only if a localization dependency is
  added.
- `README.md` or `docs/**`: only if user-facing language setting instructions
  are added.

Before rollback, compare the actual feature branch against the target branch and
confirm that every file being reverted belongs to the language settings work.

## Rollback Plan

1. Confirm the worktree state.

   ```sh
   git status --short
   git diff --name-only
   git diff --cached --name-only
   ```

2. Identify the language settings commits or merge commit.

   ```sh
   git log --oneline --decorate --max-count=30
   git log --oneline --all --grep='language'
   git log --oneline --all --grep='locale'
   ```

3. Inspect the files that would be reverted.

   ```sh
   git show --name-only --stat <language-settings-commit>
   git diff --name-only <target-branch>...HEAD
   ```

4. Create a rollback branch from the current branch.

   ```sh
   git switch -c rollback-language-settings
   ```

5. Revert the language settings commit without committing immediately.

   ```sh
   git revert --no-commit <language-settings-commit>
   ```

   If the work landed through a merge commit, use the mainline parent that keeps
   the target branch history:

   ```sh
   git revert --no-commit -m 1 <language-settings-merge-commit>
   ```

6. Review the pending rollback before committing.

   ```sh
   git status --short
   git diff --name-only
   git diff
   ```

7. If unrelated files appear in the pending rollback, stop and split the revert
   before continuing. Do not use `git reset --hard` in a shared worktree.

8. Run verification commands from this document.

9. Commit the rollback after verification passes.

   ```sh
   git commit -m "Rollback language settings"
   ```

## Commands To Run

Install dependencies if needed:

```sh
npm ci
```

Static checks:

```sh
npm run lint
npm run build
git diff --check
```

Local manual verification:

```sh
npm run dev -- --host 127.0.0.1
```

Production preview verification:

```sh
npm run build
npm run preview -- --host 127.0.0.1
```

If Python recorder files are touched by mistake during rollback, restore the
rollback scope before continuing and run the existing recorder tests only after
the scope is corrected:

```sh
python -m unittest discover recorder/tests
```

## Manual Verification Checklist

Run this checklist before accepting the language settings work and again after a
rollback. Before rollback, every locale should be selectable and should keep the
application usable. After rollback, the language selector should be absent, and
the app should return to the previous default language behavior.

For every locale option below:

- Open the app in a clean browser profile or clear the app's local storage.
- Confirm `/` opens with English selected, even if old locale values exist in
  local storage.
- Confirm Ukrainian is the first selectable language at the top of the picker.
- Select the locale from the language settings control.
- Confirm visible UI text changes to the selected locale where translations
  exist.
- Refresh the page and confirm URL-prefixed locale routes such as `/uk`, `/bg`,
  and `/nl` keep the selected locale.
- Navigate through the primary app flows and confirm no blank labels,
  untranslated keys, broken layout, console errors, or clipped text.
- Confirm keyboard navigation and visible focus state work on the selector.
- Confirm the header trigger stays compact and does not show long strings such
  as `Nederlands · Dutch` or `Magyar · Hungarian`.
- Confirm the picker opens only after clicking/tapping the language button,
  closes on outside click, Escape, close button, and selection, and preserves
  the current route query string and hash.
- Confirm language search finds native and English language names, including
  `Magyar` / `Hungarian` and non-Latin names.
- Confirm the setting works on desktop and mobile viewport widths.

Locale options to verify:

- `bg-BG` Bulgarian
- `hr-HR` Croatian
- `cs-CZ` Czech
- `da-DK` Danish
- `nl-NL` Dutch
- `en-IE` English
- `et-EE` Estonian
- `fi-FI` Finnish
- `fr-FR` French
- `de-DE` German
- `el-GR` Greek
- `hu-HU` Hungarian
- `ga-IE` Irish
- `it-IT` Italian
- `lv-LV` Latvian
- `lt-LT` Lithuanian
- `mt-MT` Maltese
- `pl-PL` Polish
- `pt-PT` Portuguese
- `ro-RO` Romanian
- `sk-SK` Slovak
- `sl-SI` Slovenian
- `es-ES` Spanish
- `sv-SE` Swedish
- `uk-UA` Ukrainian

## Rollback Acceptance Criteria

- `npm run lint` passes.
- `npm run build` passes.
- The app starts with no language settings UI if the feature is fully rolled
  back.
- Previously persisted locale values do not override the English default on `/`
  or break app startup.
- Browser console shows no runtime errors on initial load or primary flows.
- The rollback diff contains only language settings files and intentional
  documentation updates.
