# Errors

This API uses the following error codes:

Error Code | Meaning
---------- | -------
400 | Bad Request -- Your request is invalid.
401 | Unauthorized -- Your JWT is missing, invalid or expired.
403 | Forbidden -- You don't have permission to perform the requested operation. This may be due to missing scopes, or contextual reasons (e.g. you can edit your own user record, but not others')
404 | Not Found -- The requested resource could not be found.
405 | Method Not Allowed -- You tried to access a kitten with an invalid method.
406 | Not Acceptable -- You requested a format that isn't json.
409 | Conflict -- A unique constraint was not satisfied (usually the record already exists)
413 | Payload Too Large -- The request was bigger than the server can accept
414 | URI Too Long -- The request URI was longer than the server can accept
422 | Unprocessable Entity -- Usually, the request body parameter is malformed
429 | Too Many Requests -- You're requesting too frequently! Slow down!
431 | Request Header Fields Too Large -- The size of the headers is larger than the server can handle
500 | Internal Server Error -- We had a problem with our server. Try again later.
501 | Not Implemented -- The endpoint is still under development
503 | Service Unavailable -- We're temporarily offline for maintenance. Please try again later.
