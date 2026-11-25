# Product data

One row per product in `products.csv`.

Don't open it in Excel, Numbers or Google Sheets, they change the barcode into a number like 8.85E+12. Edit it in VS Code.

Run this before you commit:

```
node scripts/check-products.mjs
```

## Columns

- barcode - all the digits under the barcode
- product_name - name on the package, Thai is ok
- category - `frozen` or `ready-to-eat`
- image_url - can leave empty
- net_weight_g - weight of the whole pack
- price_baht
- calories_kcal, protein_g, fat_g, carbohydrate_g, sugar_g, sodium_mg - from the nutrition label, numbers only. Leave empty if it's not on the label
- basis - `per_pack` or `per_serving`, same as the label
- serving_size_g - only when basis is per_serving
- data_source - where you got it, e.g. `nutrition: CP catalogue; price: ALL Online`
- entered_by - your name
- verified_by - name of the person who checked it (must be someone else)
- last_verified_date - e.g. 2026-11-30

If a value has a comma in it, put it in quotes.

## Photos

For products checked in store, put photos in `data/photos` named by barcode, e.g. `8850000000003_front.jpg`, `8850000000003_label.jpg`, `8850000000003_price.jpg`.

## Checking

The second person compares the row with the website or photo. If it's correct, fill in verified_by and last_verified_date.
