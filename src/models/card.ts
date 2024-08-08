import mongoose from "mongoose";
import { urlRegExp } from "../constants";

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено'],
    validate: {
      validator: (v: string) => urlRegExp.test(v),
      message: 'Поле "link" должно быть валидным url-адресом.',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  likes: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default mongoose.model<typeof cardSchema>("card", cardSchema);
