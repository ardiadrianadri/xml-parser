import { Response } from './response';
import { ResponseCode } from './response-code';

export class ErrorApp extends Response<string> {
    constructor(
        code: ResponseCode,
        message: string,
        stackTrace: string
    ) {
        super(code, message, stackTrace);
    }
}