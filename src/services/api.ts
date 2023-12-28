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
    (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          requestError.response.data?.message === "token.expired" ||
          requestError.response.data?.message === "token.invalid"
        ) {
        } //se o token é 'invalid/expired', então aqui eu vou fazer uma busca por um novem token; porém, se ele não não for um problema de token 'invalid' ou 'expired' então eu sigo dando um 'signOut()' nele para o usuário fazer um novo login e uma busca de um novo token em todo o fluxo de autenticação

        signOut();
      } //se o status do erro é '401', então temos uma requisição não-autorizada (indício que o erro é relacionado ao token)

      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      } else {
        return Promise.reject(requestError);
      }
    }
  ); // no 'registerInterceptTokenManager' eu já consigo acessar o método de 'signOut' pra dentro da função; Em 'interceptTokenManager' será o interceptador para poder usar ele como um método 'interceptador'

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  }; //usa o método 'eject' do 'axios' no 'interceptTokenManager'
};

export { api };
