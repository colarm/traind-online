import express from "express";
import cookieParser from "cookie-parser";
import routes from "./routes";

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use("/api", routes);

export default app;