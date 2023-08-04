import server from "./server";
import dotenv from "dotenv";

dotenv.config();

const port = process.env.PORT;

const startServer = () => {
  server.listen(port, () => {
    console.log(`[Server]: server started on port ${port}`);
  });
};

startServer();
