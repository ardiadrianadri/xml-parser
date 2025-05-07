import { ResponseCode } from "./response-code";

export class Response<T> {
    constructor(
        public code: ResponseCode,
        public message: string,
        public payload?: T
    ) { }
}