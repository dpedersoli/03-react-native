import { AppError } from "@utils/AppError";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.130:3333/",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      //verifica se o erro é um erro já tratado no backend -> então eu reaproveito ela no frontend e uso
      return Promise.reject(new AppError(error.response.data.message));
    } else {
      return Promise.reject(error); //retorno de erro genérico
    }
  }
); //se der certo ele irá enviar o 'response'; se der errado vai enviar o 'error'

export { api };
