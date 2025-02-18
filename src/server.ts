import express from "express";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import ENV_CONFIG from "./config/config";
import cookieParser from "cookie-parser";

import appRouter from "./routes/index";

const app = express();

// middlewares
app.use(cookieParser());

app.use(
    bodyParser.urlencoded({ 
        limit: (ENV_CONFIG.MAX_REQUEST_SIZE as string | number) || '100kb', 
        extended: true 
    })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
 next();
});

app.use(cors({
  origin: ["http://localhost:3000" ],
  credentials: true,
  methods: ["GET", "POST", "DELETE", "PUT"],
}));


app.use(express.json());

if (ENV_CONFIG.NODE_ENV === "development") {
    app.use(morgan("tiny"));
}


// api route
app.get("/", (req, res) => {
    res.send("Welcome to the client API");
  });

app.use("/api", appRouter);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });