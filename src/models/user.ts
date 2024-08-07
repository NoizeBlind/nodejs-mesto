import mongoose from "mongoose";
import { urlRegExp } from "../constants";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: "Жак-Ив Кусто",
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 200,
    default: "Исследователь",
  },
  avatar: {
    type: String,
    required: [true, 'Поле "link" должно быть заполнено'],
    validate: {
      validator: (v: string) => urlRegExp.test(v),
      message: 'Поле "link" должно быть валидным url-адресом.',
    },
    default:
      "https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png",
  },
});

export default mongoose.model<typeof userSchema>("user", userSchema);
