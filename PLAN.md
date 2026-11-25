# WorthIt: Roles and 10-Week Plan

## Roles

| Member | Role | Responsible for |
| --- | --- | --- |
| Wipob Jindapornsuk | Backend and database | CP product data file, moving the data to a database, connecting the app to the data |
| Jakawat Wongcharuen | Barcode scanning and app | Barcode scanning, app screens, testing on phones |
| Napatra Hanwari | Ranking system | Ranking and comparison by user preference |

All three collect CP product data into one shared CSV file in the GitHub repository. Each product is checked by a second person before it is used.

## Tools

- **App:** React Native with Expo, tested on phones with Expo Go
- **Barcode scanning:** expo-camera
- **Product data:** shared CSV file in GitHub during development
- **Database:** Supabase, from week 5
- **Code:** GitHub
- Other tools to be decided as the project develops

## 10-week plan

Weeks 1 to 6 are before midterm. Exam periods are not included.

### Week 1: Barcode scanning test and data collection
- Create the Expo app and run it on a phone with Expo Go
- Test barcode scanning with expo-camera on CP products
- Create the shared CSV file
- Start collecting CP product data from the CP catalogue and ALL Online
- Visit 7-Eleven to check prices and photograph packages for any data not found online

### Week 2: Load the data into the app
- Convert the CSV so the app can read it
- Scan a barcode and find the product in the data
- Write the ranking formulas on paper

### Week 3: Scan and show product
- Show the product's nutrition and price after scanning
- Not-found message and manual barcode entry
- Keep adding products

### Week 4: Ranking by preference
- Ranking for protein, protein per baht, calories, fat, sugar and sodium
- Compare products in the same category, per 100 g
- Test the ranking on real products

### Week 5: Ranking in the app and moving to a database
- Show the ranking result in the app
- Add custom priorities (combine several preferences)
- Move the CSV data to Supabase and connect the app to it

### Week 6: Testing the core system
- Test the full flow on Android and iPhone
- Fix bugs
- Reach 30 to 50 verified products

### Week 7: Review and new function 1
- Review the core system with the advisor
- Build new function 1 (not decided yet)

### Week 8: New function 2
- Build new function 2 (not decided yet)
- Prepare the app for testers outside the team

### Week 9: More functions and user testing
- More new functions if time allows (not decided yet)
- Let a few people outside the team try the app

### Week 10: Final fixes
- Fix issues from user feedback
- Final tests

If the core system is finished early, we will start adding new functions earlier.
