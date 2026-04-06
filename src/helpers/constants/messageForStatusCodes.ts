import { StatusCodes, type StatusCode } from "./statusCodes.js";

export const StatusMessages: Record<StatusCode, string> = {
  [StatusCodes.OK]: "Request processed successfully.",
  [StatusCodes.CREATED]: "Resource created successfully.",
  [StatusCodes.ACCEPTED]: "Request accepted and is being processed.",
  [StatusCodes.NO_CONTENT]: "Request successful. No content to return.",

  [StatusCodes.MOVED_PERMANENTLY]:
    "Resource has been permanently moved to a new URL.",
  [StatusCodes.FOUND]: "Resource temporarily located at a different URL.",
  [StatusCodes.NOT_MODIFIED]: "Cached version of the resource is still valid.",

  [StatusCodes.BAD_REQUEST]:
    "The request is malformed or contains invalid parameters.",
  [StatusCodes.UNAUTHORIZED]:
    "Authentication is required. Please provide a valid token.",
  [StatusCodes.FORBIDDEN]:
    "You do not have permission to access this resource.",
  [StatusCodes.NOT_FOUND]: "The requested resource could not be found.",
  [StatusCodes.METHOD_NOT_ALLOWED]:
    "The HTTP method used is not supported for this endpoint.",
  [StatusCodes.REQUEST_TIMEOUT]:
    "The request took too long to complete. Please try again.",
  [StatusCodes.CONFLICT]:
    "Request conflicts with the current state of the resource.",
  [StatusCodes.GONE]: "The requested resource has been permanently deleted.",
  [StatusCodes.PAYLOAD_TOO_LARGE]:
    "The request payload exceeds the allowed size limit.",
  [StatusCodes.UNSUPPORTED_MEDIA_TYPE]:
    "The Content-Type of the request is not supported.",
  [StatusCodes.UNPROCESSABLE_ENTITY]:
    "Validation failed. Please check the submitted data.",
  [StatusCodes.TOO_MANY_REQUESTS]:
    "Rate limit exceeded. Please slow down your requests.",

  [StatusCodes.INTERNAL_SERVER_ERROR]:
    "An unexpected server error occurred. Please try again later.",
  [StatusCodes.NOT_IMPLEMENTED]: "This feature is not yet implemented.",
  [StatusCodes.BAD_GATEWAY]:
    "Received an invalid response from an upstream service.",
  [StatusCodes.SERVICE_UNAVAILABLE]:
    "The server is temporarily unavailable. Please try again later.",
  [StatusCodes.GATEWAY_TIMEOUT]:
    "The upstream service did not respond in time.",
};

export function getStatusMessage(code: StatusCode): string {
  return StatusMessages[code] ?? "An unknown error occurred.";
}
