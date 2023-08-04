import Express, { Application } from "express";
import cors from "cors";
import router from "./routes";

const app: Application = Express();
const bodyParser = Express.json;

//middleware
app.use(cors());
app.use(bodyParser());

//routes
app.use(router);

export default app;
