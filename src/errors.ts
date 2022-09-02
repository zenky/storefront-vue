import { ZenkyError } from '@zenky/api';

export interface ApiErrorHandlerData {
  e: any;
  error?: ZenkyError | null;
  message?: string | null;
}

export type ApiErrorHandler = (data: ApiErrorHandlerData) => any;
export type OptionalApiErrorHandler = ApiErrorHandler | null | undefined;

export function getApiErrorHandler(
  providedHandler: OptionalApiErrorHandler,
  composableName: string,
  defaultMessage: string,
): ApiErrorHandler {
  if (typeof providedHandler === 'function') {
    return providedHandler;
  }

  return function ({ e, error, message }): void {
    console.error(`[${composableName}] ${defaultMessage}`, {
      message,
      error,
      e,
    });

    console.info(`[@zenky/storefront] Pass errorHandler argument to the ${composableName}() composable to properly handle this error.`);
  };
}
