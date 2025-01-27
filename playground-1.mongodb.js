/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use("GabiGotuje");

// Insert a few documents into the sales collection.
db.getCollection("recipies").insertMany([
  {
    title: "Ciastka z kawałkami czekolady",
    ingredients: [
      "115g masła",
      "100g drobnego cukru do wypieków",
      "100g brązowego cukru",
      "1 duże jajko",
      "1 łyżeczka ekstraktu z wanilii",
      "200 g mąki pszennej",
      "1/2 łyżeczki sody oczyszczonej",
      "1/4 łyżeczki soli",
      "150 g gorzkich drobinek czekoladowych",
    ],
    steps: [
      "Wszystkie składniki powinny być w temperaturze pokojowej.",
      "Masło i oba cukry umieścić w misie miksera. Utrzeć do powstania bardzo puszystej masy maślanej, następnie dodać jajko i wanilię, dalej ucierając, do dokładnego połączenia się składników.",
      "Do masy dodać mąkę pszenną, sodę oczyszczoną i sól, następnie zmiksować do połączenia się składników.",
      "Na sam koniec wsypać 110 g chocolate chips (resztę zostawić do posypania) i wymieszać szpatułką do połączenia.",
      "Płaską dużą blachę do ciasteczek wyłożyć papierem do pieczenia. Z ciasta formować kulki wielkości małego orzecha włoskiego. Układać je na blaszce pozostawiając kilkucentymetrowe odstępy między nimi, rozpłyną się mocno na boki; nie trzeba ich spłaszczać przed pieczeniem.",
      "Ciastka z kawałkami czekolady piec w temperaturze 175ºC, z termoobiegiem, przez około 11, 12 minut lub do momentu, gdy brzegi (i lekko środek) zaczną się zarumieniać.",
      "Od razu po upieczeniu ciasteczka bedą bardzo miękkie, pozostawić je więc przez kilka minut do przestygnięcia na blaszce, następnie przenieść na kratkę do całkowitego wystudzenia.",
    ],
    created_at: new Date("2025-01-14T08:00:00Z"),
  },
]);

// Run a find command to view items sold on April 4th, 2014.
// const salesOnApril4th = db.getCollection('sales').find({
//   date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
// }).count();

// // Print a message to the output window.
// console.log(`${salesOnApril4th} sales occurred in 2014.`);

// // Here we run an aggregation and open a cursor to the results.
// // Use '.toArray()' to exhaust the cursor to return the whole result set.
// // You can use '.hasNext()/.next()' to iterate through the cursor page by page.
// db.getCollection('sales').aggregate([
//   // Find all of the sales that occurred in 2014.
//   { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
//   // Group the total sales for each product.
//   { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: [ '$price', '$quantity' ] } } } }
// ]);
