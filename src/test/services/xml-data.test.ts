/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { convertXML } from 'simple-xml-to-json';
import { existsSync } from 'fs';
import { promisify } from 'util';

import { files } from '../../app/datasource';
import { appResponses, ErrorApp, Response } from '../../app/entities';
import { xmlData } from '../../app/services';

jest.mock('simple-xml-to-json', () => ({
    convertXML: jest.fn()
}));

jest.mock('fs', () => ({
    readFile: jest.fn(),
    existsSync: jest.fn(),
    writeFile: jest.fn()
}));

var mockReadFileAsync = jest.fn();
jest.mock('util', () => ({
    promisify: () => mockReadFileAsync
}));
describe('Service XmlData', () => {

    const testPath = 'test/path/file.xml';
    const xmlInfo = '<data>OK</data>';
    const jsObject = {
        data: {
            content: 'OK'
        }
    };

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Integration test', () => {
        describe('loadData method', () => {
            it('should return an XML_FILE_NOT_FOUND error if the file doesnt exist', async () => {
                (existsSync as jest.Mock).mockReturnValue(false);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_FILE_NOT_FOUND);
                expect(result.message).toContain(testPath);
            });

            it('should return an XML_READ_ERROR if the app cant read the file', async () => {
                const errorTest = new Error('error test');
                (existsSync as jest.Mock).mockReturnValue(true);
                mockReadFileAsync.mockRejectedValue(errorTest);

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_READ_ERROR);
                expect(result.payload).toBe(errorTest.stack);
            });

            it('should return an JS Object created from the XML file if everything goes as expected', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(jsObject);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                const result = await xmlData.loadData(testPath);

                expect((convertXML as jest.Mock)).toHaveBeenCalledWith(xmlInfo);
                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(jsObject);

            });
        });
    });

    describe('Unit Test', () => {
        describe('loadData method', () => {
            beforeEach(() => {
                files.readFile = jest.fn();
            });

            it('should return an invalid path error if the path is null', async () => {
                const result = await xmlData.loadData('');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_PATH_ERROR);
            });

            it('should return an ErrorApp if the files.readFiles fails', async () => {
                const errMsg = 'test error';
                const errStack = 'test';
                const err = new ErrorApp(appResponses.XML_READ_ERROR, errMsg, errStack);
                (files.readFile as jest.Mock).mockRejectedValue(err);

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_READ_ERROR);
                expect(result.message).toBe(errMsg);
                expect(result.payload).toBe(errStack);
            });

            it('should return an error if the convertXML library fails', async () => {
                const err = new Error('test error');
                (files.readFile as jest.Mock).mockResolvedValue(xmlInfo);
                (convertXML as jest.Mock).mockImplementation(() => {
                    throw err;
                });

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_PARSE_ERROR);
                expect(result.payload).toEqual(err.stack);
            });

            it('should restun the class path if the error throw by convertXML doesnt have stack trace', async () => {
                const err = 'test error';
                (files.readFile as jest.Mock).mockResolvedValue(xmlInfo);
                (convertXML as jest.Mock).mockImplementation(() => {
                    throw err;
                });

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_PARSE_ERROR);
                expect(result.payload).toBe('XmlData.loadDAta');
            });

            it('should return an JS object if everything goes right', async () => {
                (files.readFile as jest.Mock).mockResolvedValue(xmlInfo);
                (convertXML as jest.Mock).mockReturnValue(jsObject);

                const result = await xmlData.loadData(testPath);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(jsObject);
            });
        });
        describe('isThereData methd', () => {
            beforeEach(() => {
                xmlData.clearData();
            });

            it('should return false if there isnt any data stored', () => {
                const result = xmlData.isThereData();

                expect(result).toBe(false);
            });

            it('should return true if there is data stored', async () => {
                (files.readFile as jest.Mock).mockResolvedValue(xmlInfo);
                (convertXML as jest.Mock).mockReturnValue(jsObject);

                await xmlData.loadData(testPath);

                expect(xmlData.isThereData()).toBe(true);
            });
        });
    });
});