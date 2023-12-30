import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosError, AxiosInstance } from "axios";

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void; //função que recebe o método de 'signOut' do tipo 'void', que receberá uma outra função, e que terá o seu retorno 'void' (ou seja, não tem retorno)
}; //aqui determino na tipage que o 'APIInstanceProps' será igual ao 'AxiosInstance' (terá seus métodos de tipagem) e (&) terá o que mais eu passar em suas props

const api = axios.create({
  baseURL: "http://192.168.0.130:3333/",
}) as APIInstanceProps; //colocando 'as APIInstanceProps' eu consigo usar o método de 'registerInterceptTokenManager' por meio da const 'api' exportada

let failedQueue: Array<PromiseType> = []; //requisições do tipo Array, tipada como em 'PromiseType'
let isRefreshing = false;

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          requestError.response.data?.message === "token.expired" ||
          requestError.response.data?.message === "token.invalid"
        ) {
          const { refresh_token } = await storageAuthTokenGet(); //aqui eu recupero o 'refresh_token' direto do LS para validar sua existência

          if (!refresh_token) {
            signOut();
            return Promise.reject(requestError);
          } //se o 'refresh_token' não existir, eu deslogo o usuário e retorno o erro do interceptor

          const originalRequestConfig = requestError.config; //aqui tenho TODAS as configurações/detalhes da requisição que foi feita

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess: (token: string) => {
                  originalRequestConfig.headers = {
                    Authorization: `Bearer ${token}`,
                  };
                  resolve(api(originalRequestConfig));
                },
                onFailure: (error: AxiosError) => {
                  reject(error);
                },
              });
            });
          } //se há uma solicitação de um novo Token (se 'isRefreshing' for true), então eu retorno uma Promise e vou adicionar o método de 'onSuccess' e 'onFailure'; no 'onSuccess' eu passo o 'authorization' com o 'token' atual no Header da requisição -> então passo o 'resolve' que irá passar a api que irá devolver e processar a requisição; Porém, se der errado e cair no 'onFailure', então a requisição será rejeitada

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post("/sessions/refresh-token", {
                refresh_token,
              }); //rota de solicitação de um novo token; 'refresh_token' é o 'token' utilizado para atualizar o token
              await storageAuthTokenSave({
                token: data.token,
                refresh_token: data.refresh_token,
              }); //aqui eu passo a informação do novo 'token' + 'refresh_token' para dentro do LS

              if (originalRequestConfig.data) {
                originalRequestConfig.data = JSON.parse(
                  originalRequestConfig.data
                );
              }

              originalRequestConfig.headers = {
                Authorization: `Bearer ${data.token}`,
              };
              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.token}`;

              failedQueue.forEach((request) => {
                request.onSuccess(data.token);
              });

              resolve(api(originalRequestConfig));
            } catch (error: any) {
              failedQueue.forEach((request) => {
                request.onFailure(error);
              }); //se der erro, vou passar em cada requisição falando que deu erro

              signOut();
              reject(error); //deslogo o usuário e rejeito o erro
            } finally {
              isRefreshing = false;
              failedQueue = [];
            }
          });
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
