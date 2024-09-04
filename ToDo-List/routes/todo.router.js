// /routes/todos.router.js

import express from "express";
import joi from "joi";
import Todo from "../schemas/todo.schema.js";

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

router.post("/todos", async (req, res, next) => {
  try {
    // 클라이언트에게 전달받은 데이터를 검증한다.
    // 검증에 성공하면 해당 데이터를 반환한다.
    const validation = await createdTodoSchema.validateAsync(req.body);

    // 1. 클라이언트에게 전달받은 value 데이터를 변수에 저장한다.
    const { value } = validation;

    // 1.1 value가 존재하지 않을 때, 클라이언트에게 에러 메시지를 전달합니다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: "해야할 일 데이터가 존재하지 않습니다." });
    }

    // 2. Todo모델을 사용해, MongoDB에서 'order' 값이 가장 높은 데이터를 조회한다.
    // findOne = 1개의 데이터만 조회한다.
    // sort('컬럼') = '컬럼'을 정렬한다. 기본값은 오름차순으로 앞에 -를 붙이면 내림차순으로 정렬한다.
    const todoMaxOrder = await Todo.findOne().sort("-order").exec();

    // 3. 'order' 값이 가장 높은 도큐멘트의 1을 추가하거나 없다면, 1을 할당합니다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. Todo모델을 이용해, 새로운 '해야할 일'을 생성합니다.
    const todo = new Todo({ value, order });
    await todo.save(); // 생성한 '해야할 일'을 MongoDB에 저장한다.

    return res.status(201).json({ todo });
  } catch (error) {
    // Router 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

// 해야할 일 목록 조회
router.get("/todos", async (req, res, next) => {
  const todos = await Todo.find().sort("-order").exec();

  return res.status(200).json({ todos });
});

// 할일 내용 변경
router.patch("/todos/:todoId", async (req, res) => {
  // 변경할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;
  // 클라이언트가 전달한 순서, 완료 여부, 내용 데이터를 가져옵니다.
  const { order, done, value } = req.body;

  // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  if (order) {
    // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
    currentTodo.order = order;
  }
  if (done !== undefined) {
    // 변경하려는 '해야할 일'의 doneAt 값을 변경합니다.
    currentTodo.doneAt = done ? new Date() : null;
  }
  if (value) {
    // 변경하려는 '해야할 일'의 내용을 변경합니다.
    currentTodo.value = value;
  }

  // 변경된 '해야할 일'을 저장합니다.
  await currentTodo.save();

  return res.status(200).json({});
});

//// 해야할 일 순서 변경
//router.patch('/todos/:todoId', async (req, res) => {
//    // 변경할 '해야할 일'의 ID 값을 가져온다.
//    const { todoId } = req.params;
//    // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져온다.
//    const { order } = req.body;

//    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킨다.
//    const currentTodo = await Todo.findById(todoId).exec();
//    if (!currentTodo) {
//        return res
//            .status(404)
//            .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
//    }

//    if (order) {
//        // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾는다.
//        const targetTodo = await Todo.findOne({ order }).exec();
//        if (targetTodo) {
//            // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장한다.
//            targetTodo.order = currentTodo.order;
//            await targetTodo.save();
//        }
//        // 변경하려는 '해야할 일'의 order 값을 변경한다.
//        currentTodo.order = order;
//    }

//    // 변경된 '해야할 일'을 저장한다.
//    await currentTodo.save();

//    return res.status(200).json({});
//});

//// 순서 변경, 할 일 완료 / 해제
//router.patch('/todos/:todoId', async (req, res) => {
//    // 변경할 '해야할 일'의 ID 값을 가져옵니다.
//    const { todoId } = req.params;
//    // '해야할 일'을 몇번째 순서로 설정할 지 order 값을 가져옵니다.
//    const { order, done } = req.body;

//    // 변경하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
//    const currentTodo = await Todo.findById(todoId).exec();
//    if (!currentTodo) {
//        return res
//            .status(404)
//            .json({ errorMessage: '존재하지 않는 todo 데이터입니다.' });
//    }

//    if (order) {
//        // 변경하려는 order 값을 가지고 있는 '해야할 일'을 찾습니다.
//        const targetTodo = await Todo.findOne({ order }).exec();
//        if (targetTodo) {
//            // 만약, 이미 해당 order 값을 가진 '해야할 일'이 있다면, 해당 '해야할 일'의 order 값을 변경하고 저장합니다.
//            targetTodo.order = currentTodo.order;
//            await targetTodo.save();
//        }
//        // 변경하려는 '해야할 일'의 order 값을 변경합니니다.
//        currentTodo.order = order;
//    }

//    if (done !== undefined) {
//        // 변경하려는 '해야할 일'의 doneAt 값을 변경합니다.
//        currentTodo.doneAt = done ? new Date() : null;
//    }

//    // 변경된 '해야할 일'을 저장합니다.
//    await currentTodo.save();

//    return res.status(200).json({});
//});

// 할 일 삭제
router.delete("/todos/:todoId", async (req, res) => {
  // 삭제할 '해야할 일'의 ID 값을 가져옵니다.
  const { todoId } = req.params;

  // 삭제하려는 '해야할 일'을 가져옵니다. 만약, 해당 ID값을 가진 '해야할 일'이 없다면 에러를 발생시킵니다.
  const todo = await Todo.findById(todoId).exec();
  if (!todo) {
    return res
      .status(404)
      .json({ errorMessage: "존재하지 않는 todo 데이터입니다." });
  }

  // 조회된 '해야할 일'을 삭제합니다.
  // _ 를 붙여 기본키값임을 나타낸다.
  await Todo.deleteOne({ _id: todoId }).exec();

  return res.status(200).json({});
});

export default router;
