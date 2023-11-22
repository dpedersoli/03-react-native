import { AuthContext } from "@contexts/AuthContext";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { Box, useTheme } from "native-base";
import { useContext } from "react";
import { AuthRoutes } from "./auth.routes";

export function Routes() {
  const { colors } = useTheme();

  const contextData = useContext(AuthContext); //aqui eu acesso o conteúdo que está sendo compartilhado no contexto da aplicação a partir do valor de 'AuthContext'

  const theme = DefaultTheme;
  theme.colors.background = colors.gray[700];

  return (
    <Box flex={1} bg="gray.700">
      <NavigationContainer theme={theme}>
        <AuthRoutes />
        {/* <AppRoutes/> */}
      </NavigationContainer>
    </Box>
  );
}
