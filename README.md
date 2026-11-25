# WorthIt

App for CP frozen and ready-to-eat products at 7-Eleven. Scan the barcode to see nutrition and price, and see how it ranks against other CP products (protein, calories, sugar, etc).

AU CS/IT Senior Project.

## Setup

You need Node.js and the Expo Go app on your phone.

```
git clone https://github.com/WipobJind/worthit.git
cd worthit/app
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or the camera app (iPhone). Phone and laptop need to be on the same wifi. If it doesn't connect try `npx expo start --tunnel`.

After pulling, run `npm install` again if package.json changed.

## Folders

- `app` - the mobile app
- `data` - products.csv and package photos
- `scripts` - script to check the csv
- `docs` - test notes
