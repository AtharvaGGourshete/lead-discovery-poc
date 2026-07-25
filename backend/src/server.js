import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import discoverRouter from "./routes/discover.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/discover", discoverRouter);

app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import axios from "axios";
// import discoverRouter from "./routes/discover.js";
// import { enrichCompany } from "./services/yahoo.service.js";
// import { applyFilters } from "./utils/filterEngine.js";

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// app.use(cors());
// app.use(express.json());

// app.use("/discover", discoverRouter);

// // TEMP TEST
// // async function testYahoo() {
    

// //     const finance = await enrichCompany("Infosys");

// //     console.log(finance);
// //     console.log(applyFilters(finance));

// // }

// // testYahoo();

// async function testIndianAPI() {
//     try {
//         const response = await axios.get(
//             "https://stock.indianapi.in/stock",
//             {
//                 params: {
//                     name: "Infosys"
//                 },
//                 headers: {
//                     "x-api-key": process.env.INDIAN_API_KEY
//                 }
//             }
//         );

//         //console.log(response.data);
//         console.log(
//     JSON.stringify(
//         response.data.financials[0].stockFinancialMap,
//         null,
//         2
//     )
// );

//     } catch (err) {
//         console.log(err.response?.data || err.message);
//     }
// }

// testIndianAPI();

// app.listen(PORT, () => {
//     console.log(`Server running on ${PORT}`);
// });