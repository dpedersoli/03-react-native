import { UserDTO } from "@dtos/UserDTO";
import { api } from "@services/api";
import { ReactNode, createContext, useState } from "react";

export type AuthContextDataProps = {
  user: UserDTO;
  signIn: (email: string, password: string) => Promise<void>; // é uma função que lida com uma Promise, porém ela não tem retorno, então continua sendo 'void' também
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserDTO>({} as UserDTO); //faço a tipagem como 'UserDTO' para que o TS entenda que mesmo que a var 'user' esteja vazia, o tipo dela sempre será de UserDTO

  async function signIn(email: string, password: string) {
    //aqui recebo as informações da tela que chama essa função e faço a requisição de validação no backend para ver se os dados inseridos pelo usuário são semelhantes aos do DB para validar a função (caso seja válido), ou retornar um erro (caso não seja válido)
    try {
      const { data } = await api.post("/sessions", { email, password });

      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      throw error;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
