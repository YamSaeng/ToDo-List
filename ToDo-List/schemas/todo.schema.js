// schemas/todo.schema.js

import mongoose from "mongoose";

const TodoSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true, // value �ʵ�� �ʼ� ����Դϴ�.
  },
  order: {
    type: Number,
    required: true, // order �ʵ� ���� �ʼ� ����Դϴ�.
  },
  doneAt: {
    type: Date, // doneAt �ʵ�� Date Ÿ���� �����ϴ�.
    required: false, // doneAt �ʵ�� �ʼ� ��Ұ� �ƴմϴ�.
  },
});

// ����Ʈ���� ������ ���� �ڵ��Դϴ�. �𸣼ŵ� �����ƿ�!
TodoSchema.virtual("todoId").get(function () {
  return this._id.toHexString();
});
TodoSchema.set("toJSON", {
  virtuals: true,
});

// TodoSchema�� �������� Todo���� �����Ͽ�, �ܺη� �������ϴ�.
export default mongoose.model("Todo", TodoSchema);
