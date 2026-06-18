import express from "express";
import routes from "./src/routes/index.ts";
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Serve uploaded files: a request to /uploads/x.webp returns the file uploads/x.webp
app.use("/uploads", express.static("uploads"));

app.use(routes);

export default app;

