import { readFile, existsSync, appendFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { Response, ErrorApp, appResponses } from '../entities/index';

class Files {
    async writeFile(path: string, data:string[]): Promise<Response<string[]> | ErrorApp> {
        const realPath = join(process.cwd(), path);
        const wirteFileAsync = promisify(appendFile);

        if (data.length === 0) {
            return new ErrorApp(appResponses.DATA_FILE_EMPTY, 'The data array is empty', new Error().stack);
        }
        
        try {
            await Promise.all(
                data.map((line: string) => wirteFileAsync(path, line, 'utf8'))
            );

            return new Response(appResponses.OK, `Finish writting the file ${path}`, data);
        } catch (e) {
            return new ErrorApp(appResponses.WRITE_FILE_ERROR, `Error while writting file ${realPath}`, e?.stack || 'Files.writeFile');
        }
    }

    async readFile (path: string): Promise<Response<string> | ErrorApp> {
        const realPath = join(process.cwd(), path);
        const readFileAsync = promisify(readFile);

        if (!existsSync(realPath)) {
            return new ErrorApp(appResponses.XML_FILE_NOT_FOUND, `File ${realPath} not found`, new Error().stack);
        }

        return readFileAsync(realPath, 'utf8')
            .then((data: string) => new Response<string>(appResponses.OK, 'File found', data))
            .catch((err: any) => new ErrorApp(appResponses.XML_READ_ERROR, `Error reading file ${realPath}`, err?.stack || 'Files.readFile'));
    }
}

export const files = new Files();