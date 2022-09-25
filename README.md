# String Extration For Mutli-lingual purposes

1. Select any text you want to extract for translations.
2. Right click and click on `Extract for translation` or press `ctrl+t`.
3. Enter the `Label` for JSON key and hit enter.
4. Extraction done.

## Common String (keys)

All common string values like `Add`, `Remove`, `Cancel` have common usage across the pages. We have nameing conventions for these keys.

## Quick Sneak Peek

While working with localisation strings, mostly you need to see what is the actual value for the given JSON key (`Label`).
This extension also supports `hover`, so if you hover over the `Label` it will display the actaul value for `'ae (English)'` and `'es (Spanish)'`

> Note: currently it only supports `tsx` files.

# JSON files path

From workspace root path to `/public/locales`.

- [x] /public/locales/ae/common.json
- [x] /public/locales/es/common.json

# Features

- [x] Supports extracting single line text.
- [x] Supports extracting multines text.
- [x] Replaces `tabs`, extra `spaces` and `newlines` from text strings.
- [x] Tootltip when you hover key it show both translation values
- [x] Tootltip when you hover over sizes it shows the conversion from px to rem and rem to px
