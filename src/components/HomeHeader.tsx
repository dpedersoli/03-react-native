import { MaterialIcons } from "@expo/vector-icons";
import { HStack, Heading, Icon, Text, VStack } from "native-base";

import defaultUserPhotoImg from "@assets/userPhotoDefault.png";
import { useAuth } from "@hooks/userAuth";
import { api } from "@services/api";
import { TouchableOpacity } from "react-native";
import { UserPhoto } from "./UserPhoto";

export function HomeHeader() {
  const { user, signOut } = useAuth();

  return (
    <HStack bg="gray.600" pt={16} pb={5} px={8} alignItems="center">
      <UserPhoto
        source={
          user.avatar
            ? { uri: `${api.defaults.baseURL}avatar/${user.avatar}` } //aqui eu passo o baseURL e a rota em que a imagem está + o nome da imagem na rota (como se fosse seu ID)
            : defaultUserPhotoImg
        }
        size={16}
        alt="Imagem do usuário"
        mr={4}
      />
      <VStack flex={1}>
        <Text color="gray.100" fontSize="md">
          Olá,
        </Text>

        <Heading color="gray.100" fontSize="md" fontFamily="heading">
          {user.name}
        </Heading>
      </VStack>

      <TouchableOpacity onPress={signOut}>
        <Icon as={MaterialIcons} name="logout" color="gray.200" size={7} />
      </TouchableOpacity>
    </HStack>
  );
}
