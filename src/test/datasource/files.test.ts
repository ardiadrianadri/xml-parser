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
            const content = ['line01', 'line02', 'line03'];

            it('should return DATA_FILE_EMPTY if the string array is empty', async () => {
                const result = await files.writeFile(testPath, []);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_FILE_EMPTY);
                expect(mockReadFileAsync).not.toHaveBeenCalled();
            });

            it('should return WRITE_FILE_ERROR if one of the write operations fail', async () => {
                const testError = new Error('test');
                mockReadFileAsync.mockRejectedValue(testError);

                const result = await files.writeFile(testPath, content);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result.payload).toBe(testError.stack);
            });

            it('should return WRITE_FILE_ERROR if one of the write operations fails. If the error doesnt have stack data, it will send the method name', async () => {
                const testError = 'test';
                mockReadFileAsync.mockRejectedValue(testError);

                const result = await files.writeFile(testPath,  content);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result.payload).toBe('Files.writeFile');
            });

            it('should return the data stored in the file if everything goes as expected', async () => {
                mockReadFileAsync.mockResolvedValue('');

                const expectedResult = content.map((line) => `${line}\n`);
                const result = await files.writeFile(testPath, content);

                const calls = mockReadFileAsync.mock.calls.map((args) => args[1]);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(content);
                expect(calls).toEqual(expectedResult);
            });
        });
    });
});