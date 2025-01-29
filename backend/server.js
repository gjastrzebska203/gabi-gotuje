const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./routes");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Połączono z bazą danych MongoDB Atlas"))
  .catch((err) => console.error("Błąd połączenia z bazą danych:", err));

app.use("/api", routes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serwer działa na porcie ${PORT}`));
