import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // esta opcion elimina campos no permitidos
      forbidNonWhitelisted: true, // esta da error si envían campos extra
      transform: true,
      exceptionFactory: (errors: ValidationError[]) => {

        const messages: string[] = [];

        const formatErrors = (
          errorsArray: ValidationError[],
          parent = '',
        ): void => {
          for (const error of errorsArray) {

            const propertyPath = parent
              ? `${parent}.${error.property}`
              : error.property;

            // Campos no permitidos
            if (error.constraints?.whitelistValidation) {
              messages.push(
                `El campo '${propertyPath}' no está permitido`,
              );
            }

            // Validaciones normales
            if (error.constraints) {
              for (const [key, msg] of Object.entries(error.constraints)) {

                // Se va a ignorar el mensaje feo original de property
                if (key === 'whitelistValidation') continue;

                messages.push(msg);
              }
            }

            // Errores anidados
            if (error.children && error.children.length > 0) {
              formatErrors(error.children, propertyPath);
            }
          }
        };

        formatErrors(errors);

        return new BadRequestException({
          message: messages,
          error: 'Bad Request',
          statusCode: 400,
        });
      },
    }),
  );

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
