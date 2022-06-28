export type ApiErrorHandler = (e: any) => any;
export type OptionalApiErrorHandler = ApiErrorHandler | null | undefined;

export function getApiErrorHandler(
  providedHandler: OptionalApiErrorHandler,
  defaultHandler: ApiErrorHandler,
): ApiErrorHandler {
  return providedHandler ? providedHandler : defaultHandler;
}
