// app.js

import express from "express";
import connect from "./schemas/index.js";
import todosRouter from "./routes/todo.router.js";
import ErrorHandlerMiddleware from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// static Middleware, express.static()을 사용하여 정적 파일을 제공합니다.
app.use(express.static("./assets"));

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hi!" });
});

app.use("/api", [router, todosRouter]);

app.use(ErrorHandlerMiddleware); // 에러 핸들링 미들웨어 등록

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요!");
});
