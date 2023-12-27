import { AppError } from "@utils/AppError";
import axios, { AxiosInstance } from "axios";

type SignOut = () => void;

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void; //função que recebe o método de 'signOut' do tipo 'void', que receberá uma outra função, e que terá o seu retorno 'void' (ou seja, não tem retorno)
}; //aqui determino na tipage que o 'APIInstanceProps' será igual ao 'AxiosInstance' (terá seus métodos de tipagem) e (&) terá o que mais eu passar em suas props

const api = axios.create({
  baseURL: "http://192.168.0.130:3333/",
}) as APIInstanceProps; //colocando 'as APIInstanceProps' eu consigo usar o método de 'registerInterceptTokenManager' por meio da const 'api' exportada

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.data) {
        return Promise.reject(new AppError(error.response.data.message));
      } else {
        return Promise.reject(error);
      }
    }
  ); //'interceptTokenManager' será o interceptador para poder usar ele como um método 'interceptador'

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
