//arquivo para padronizar as mensagens de erro / excessões que são tratadas por mim dentro da aplicação

export class AppError {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}
