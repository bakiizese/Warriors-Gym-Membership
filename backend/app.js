import express from "express";
import sequelize from "./config/database.js";
import "./models/Member.js";
import "./models/Admin.js";
import "./models/AttendanceLog.js";
import "./models/TransactionHistory.js";
import "./models/MembershipPlan.js";
import "./models/WorkoutPlan.js";
import "./models/Image.js";
import "./models/Video.js";
import association from "./models/Association.js";
import authRouter from "./routes/auth_route.js";
import adminRouter from "./routes/admin_route.js";
import memberRouter from "./routes/member_route.js";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";

const PORT = 5000;
const HOST = "0.0.0.0";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors()
);

dotenv.config();
association();

sequelize
  .sync({ alter: true })
  .then(() => console.log("tables created successfuly"));

//routes
app.use("/auth", authRouter);
app.use("/admin", adminRouter);
app.use("/member", memberRouter);

app.get("/ping", (req, res) => {
  return res.status(200).json({ ping: "success" });
});

app.listen(PORT, HOST, () => console.log("server running....."));

export default app;
