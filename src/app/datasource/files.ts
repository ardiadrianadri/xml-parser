import { readFile, existsSync, writeFile } from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { Response, ErrorApp, appResponses } from '../entities/index';

class Files {
    async writeFile (path: string, content: string): Promise<Response<undefined> | ErrorApp> {
        const realPath = join(process.cwd(), path);
        const writeFileAsync = promisify(writeFile);

        return writeFileAsync (realPath, content, 'utf-8')
            .then(() => new Response<undefined>(appResponses.OK, `File ${path} created`))
            .catch((err) => new ErrorApp(appResponses.WRITE_FILE_ERROR, `Error trying to write the file ${path}`, err?.stack || 'File.writeFile'));
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