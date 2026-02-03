// Módulos Node.js built-in
import os from 'os';
import fs from 'fs';
import path from 'path';

// Librerías externas (third-party)
import { DateTime } from 'luxon';
import * as Sentry from '@sentry/node';
import colors from 'colors';

/**
 * ErrorHandler
 *
 * Clase utilitaria centralizada y unificada para el manejo de logs y errores en toda la aplicación.
 *
 * **Funcionalidades principales:**
 * - Manejo unificado de logs informativos, advertencias y errores
 * - Integración completa con Sentry para monitoreo remoto
 * - Colorización automática en consola según tipo de evento
 * - Guardado opcional en archivos locales (LOG_TO_FILE)
 * - Metadatos del sistema incluidos automáticamente
 * - Formato JSON estructurado para análisis posterior
 *
 * **Métodos disponibles:**
 * - info(): Logs informativos del sistema
 * - warn(): Advertencias y situaciones de atención
 * - success(): Eventos exitosos (como inicio del servidor)
 * - handle(): Manejo general de errores con integración Sentry
 * - handleCritical(): Manejo específico para errores críticos del sistema
 * - handleLegacy(): Compatibilidad con logging legacy (console.log)
 *
 * **Integración con Sentry:**
 * - Envío automático de errores cuando SENTRY_DSN está configurado
 * - Etiquetado contextual para facilitar el debugging
 * - Niveles de severidad configurables
 * - Fingerprinting personalizado para errores críticos
 *
 * **Variables de entorno:**
 * - LOG_TO_FILE: Si es 'true', guarda los logs en /logs/server.log
 * - SENTRY_DSN: Para integración con Sentry
 * - LISTEN_PORT: Puerto incluido en metadatos
 * - MODE: Entorno de ejecución incluido en metadatos
 */
export class ErrorHandler {

    /**
     * Obtiene la fecha y hora actual en formato legible localizado.
     *
     * @private
     * @static
     * @param {string} locale - Código de idioma/región para el formato (por defecto 'es-MX')
     * @returns {string} Cadena con fecha y hora en formato 'dd/mm/yyyy hh:mm:ss'
     */
    private static getTimestamp(locale: string = 'es-MX'): string {
        const now = new Date();
        const date = now.toLocaleDateString(locale);
        const hour = now.toLocaleTimeString(locale);
        return `${date} ${hour}`;
    }

    /**
     * Guarda el log en un archivo local de forma condicional.
     *
     * @private
     * @static
     * @param {string} logString - Contenido del log en formato JSON string
     */
    private static saveToFile(logString: string): void {
        if (process.env.LOG_TO_FILE === 'true') {
            const logPath = path.join(process.cwd(), 'logs', 'server.log');
            fs.mkdirSync(path.dirname(logPath), { recursive: true });
            fs.appendFileSync(logPath, logString + '\n');
        }
    }

    /**
     * Construye el objeto de log estructurado con metadatos del sistema.
     *
     * @private
     * @static
     * @param {string} level - Nivel del log ('info', 'warn', 'error', 'success')
     * @param {string} message - Mensaje del log
     * @param {string} [context] - Contexto adicional
     * @param {Error} [error] - Objeto Error (para logs de error)
     * @param {string} [locale] - Configuración regional para el timestamp
     * @returns {object} Objeto estructurado con toda la información del log
     */
    private static buildLogObject(
        level: string,
        message: string,
        context?: string,
        error?: Error,
        locale?: string
    ) {
        const timestamp = this.getTimestamp(locale);
        const env = process.env.MODE || 'development';
        const host = os.hostname();
        const port = parseInt(process.env.LISTEN_PORT || '3000');

        const logObject: any = {
            level,
            timestamp,
            port,
            env,
            host,
            message,
            context: context || undefined
        };

        if (error) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            logObject.error = error.message;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            logObject.stack = error.stack;
        }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return logObject;
    }

    /**
     * Obtiene la función de colorización correspondiente al nivel de log.
     *
     * @private
     * @static
     * @param {string} level - Nivel del log para determinar el color
     * @returns {Function} Función de colorización de la librería colors
     */
    private static getColor(level: string) {
        switch (level) {
            case 'success': return colors.green;
            case 'error': return colors.red;
            case 'info': return colors.cyan;
            case 'warn': return colors.yellow;
            case 'critical': return colors.magenta;
            default: return (txt: string) => txt;
        }
    }

    /**
     * Método base para mostrar y persistir logs.
     *
     * @private
     * @static
     * @param {string} level - Nivel del log
     * @param {string} message - Mensaje principal
     * @param {string} [context] - Contexto adicional
     * @param {Error} [error] - Objeto Error (opcional)
     * @param {'error'|'warning'|'info'} [sentryLevel] - Nivel para Sentry
     */
    private static log(
        level: string,
        message: string,
        context?: string,
        error?: Error,
        sentryLevel?: 'error' | 'warning' | 'info'
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const logObject = this.buildLogObject(level, message, context, error);
        const divider = colors.white('='.repeat(80));
        const jsonLog = JSON.stringify(logObject, null, 2);

        // Guardar en archivo si está configurado
        this.saveToFile(jsonLog);

        // Mostrar en consola con color
        const colorFn = this.getColor(level);
        console.log(`${divider}\n${colorFn(jsonLog)}\n${divider}\n`);

        // Enviar a Sentry si corresponde y está configurado
        if (sentryLevel && process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
            Sentry.withScope((scope) => {
                scope.setTag('context', context || 'general');
              // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
                scope.setTag('timestamp', logObject.timestamp);
                scope.setLevel(sentryLevel);

                if (error) {
                    Sentry.captureException(error);
                } else {
                    Sentry.captureMessage(message, sentryLevel);
                }
            });
        }
    }

    /**
     * Registra mensajes informativos del sistema.
     *
     * @public
     * @static
     * @param {string} message - Mensaje informativo
     * @param {string} [context] - Contexto opcional
     */
    public static info(message: string, context?: string): void {
        this.log('info', message, context);
    }

    /**
     * Registra advertencias del sistema.
     *
     * @public
     * @static
     * @param {string} message - Mensaje de advertencia
     * @param {string} [context] - Contexto opcional
     */
    public static warn(message: string, context?: string): void {
        this.log('warn', message, context, undefined, 'warning');
    }

    /**
     * Registra eventos exitosos del sistema.
     *
     * @public
     * @static
     * @param {string} message - Mensaje de éxito
     * @param {string} [context] - Contexto opcional
     */
    public static success(message: string, context?: string): void {
        this.log('success', message, context);
    }

    /**
     * Maneja errores de forma centralizada usando Sentry.
     * @param error Error capturado
     * @param context Contexto del error (nombre de la clase/módulo)
     * @param operation Operación que falló (opcional)
     * @param severity Nivel de severidad para Sentry ('error' | 'warning' | 'info')
     */
    public static handle(
        error: unknown,
        context: string,
        operation?: string,
        severity: 'error' | 'warning' | 'info' = 'error'
    ): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const operationMsg = operation ? ` - Operación: ${operation}` : '';
        const message = `${errorMessage}${operationMsg}`;

        this.log('error', message, context, error instanceof Error ? error : new Error(errorMessage), severity);
    }

    /**
     * Maneja errores críticos que requieren atención inmediata.
     * Estos errores se marcan con alta prioridad en Sentry.
     * @param error Error capturado
     * @param context Contexto del error
     * @param operation Operación que falló (opcional)
     */
    public static handleCritical(
        error: unknown,
        context: string,
        operation?: string
    ): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const operationMsg = operation ? ` - Operación: ${operation}` : '';
        const message = `[CRÍTICO] ${errorMessage}${operationMsg}`;

        // Enviar a Sentry con prioridad crítica
        if (process.env.ENABLE_SENTRY === 'true' && process.env.SENTRY_DSN) {
            Sentry.withScope((scope) => {
                scope.setTag('context', context);
                scope.setTag('critical', 'true');
                if (operation) {
                    scope.setTag('operation', operation);
                }
                scope.setLevel('error');
                scope.setFingerprint(['critical-error', context]);

                if (error instanceof Error) {
                    Sentry.captureException(error);
                } else {
                    Sentry.captureMessage(message, 'error');
                }
            });
        }

        // Log local con marcador crítico
        this.log('critical', message, context, error instanceof Error ? error : new Error(errorMessage));
    }

    /**
     * Maneja errores con formato legacy (compatibilidad con console.log)
     * @param error Error capturado
     * @param context Contexto del error
     */
    public static handleLegacy(error: unknown, context: string): void {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Error ${context} a las: ${DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss')}, ${error}`);
    }
}