# SDG Icon Assets

Place official SDG icon files in this folder.

Recommended structure:

```text
assets/sdg/
  thumb/
    en/
      sdg-01.webp
      ...
      sdg-17.webp
    th/
      sdg-01.webp
      ...
      sdg-17.webp
  en/
    E-WEB-Goal-01.png
    E-WEB-Goal-02.png
    ...
    E-WEB-Goal-17.png
  th/
    SDG-1.png
    SDG-2.png
    ...
    SDG-17.png
```

Use the official UN SDG artwork without changing colours, proportions, or
cropping. Keep the sheet value as numeric tags such as `1,4,17`; the frontend can
map those tags to these static image files later.

The frontend uses the `thumb/` WebP files by default for speed. Keep the original
PNG files in `en/` and `th/` as source/reference assets.
