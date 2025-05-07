/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from 'fs';
import { promisify } from 'util';

import { files } from '../../app/datasource/index';
import { appResponses, ErrorApp, Response } from '../../app/entities/index';

jest.mock('fs', () => ({
    readFile: jest.fn(),
    existsSync: jest.fn(),
    writeFile: jest.fn()
}));

var mockReadFileAsync = jest.fn();
jest.mock('util', () => ({
    promisify: () => mockReadFileAsync
}));

describe('Data source Files', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Unit test', () => {
        const testPath = 'test/path/file.xml';

        describe('Method readFile', () => {

            it('should return an XML_FILE_NOT_FOUND if the file doesnt exist', async () => {
                (existsSync as jest.Mock).mockReturnValue(false);
                const result = await files.readFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_FILE_NOT_FOUND);
            });

            it('should return an error if there is an error reading the file', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                mockReadFileAsync.mockRejectedValue(new Error('Test error'));

                const result = await files.readFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_READ_ERROR);
                expect(result.message).toContain('Error reading file');
            });

            it('should return an error without stack', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                mockReadFileAsync.mockRejectedValue('Test error');

                const result = await files.readFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_READ_ERROR);
                expect(result.payload).toBe('Files.readFile');
            });

            it('should return the content of the file if there isnt any error', async () => {
                const fileConent = '<data>OK</data>';
                (existsSync as jest.Mock).mockReturnValue(true);
                mockReadFileAsync.mockResolvedValue(fileConent);

                const result = await files.readFile(testPath);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toBe(fileConent);
            });
        });

        describe('Method writeFile', () => {
            const content = 'Test content';

            it('should return an error if to write the file fails', async () => {
                const testError = new Error('test app');
                mockReadFileAsync.mockRejectedValue(testError);

                const result = await files.writeFile(testPath, content);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result.payload).toBe(testError.stack);
            });

            it('should return an error with the class and the method if the error returned by the writeFile doesnt have stacktrace', async () => {
                const testError = 'test app';
                mockReadFileAsync.mockRejectedValue(testError);

                const result = await files.writeFile(testPath, content);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result.payload).toBe('File.writeFile');
            });

            it('should return a success response if the file was written', async () => {
                mockReadFileAsync.mockResolvedValue('successs');


                const result = await files.writeFile(testPath, content);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.message).toContain(testPath);
            });
        });
    });
});