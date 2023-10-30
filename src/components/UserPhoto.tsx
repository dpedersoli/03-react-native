import { Center, IImageProps, Image } from "native-base";

type Props = IImageProps & {
  size: number;
};

export function UserPhoto({ size, ...rest }: Props) {
  return (
    <Center rounded="full">
      <Image
        w={size}
        h={size}
        rounded="full"
        borderWidth={2}
        borderColor="gray.400"
        {...rest}
      />
    </Center>
  );
}
