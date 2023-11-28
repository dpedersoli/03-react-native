import { UserDTO } from "@dtos/UserDTO";
import { ReactNode, createContext } from "react";

export type AuthContextDataProps = {
  user: UserDTO;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
); //é do tipo "<AuthContextDataProps>" e o valor inicial é um "{}" do tipo "AuthContextDataProps"

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  return (
    <AuthContext.Provider
      value={{
        user: {
          id: "1",
          name: "Daniel",
          email: "daniel@email.com",
          avatar: "daniel.png",
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
