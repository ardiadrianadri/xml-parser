/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from 'fs';
import { promisify } from 'util';
import { convertXML } from 'simple-xml-to-json';

import { infoOperations } from '../../app/controler';
import { appResponses, ErrorApp, HelpNode, Response } from '../../app/entities';
import { xmlData } from '../../app/services';

jest.mock('fs', () => ({
    readFile: jest.fn(),
    existsSync: jest.fn(),
    writeFile: jest.fn()
}));

var mockReadFileAsync = jest.fn();
jest.mock('util', () => ({
    promisify: () => mockReadFileAsync
}));

jest.mock('simple-xml-to-json', () => ({
    convertXML: jest.fn()
}));


describe('Info operations controler', () => {
    const testPath = '/test/controller';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Integration test', () => {
        const xmlInfo = '<data>OK</data>';
        const jsObject = {
            data: {
                content: 'OK'
            }
        };

        beforeEach(() => {
            xmlData.clearData();
        });

        describe('loadXmlFile method', () => {
            it('should return an error XML_FILE_NOT_FOUND', async () => {
                (existsSync as jest.Mock).mockReturnValue(false);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                const result = await infoOperations.loadXmlFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_FILE_NOT_FOUND);
                expect(result.message).toContain(testPath);
            });

            it('should return an XML_READ_ERROR if the file reading fails', async () => {
                const testError = new Error('test message');
                (existsSync as jest.Mock).mockReturnValue(true);
                mockReadFileAsync.mockRejectedValue(testError);

                const result = await infoOperations.loadXmlFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.XML_READ_ERROR);
                expect(result.payload).toBe(testError.stack);
            });

            it('should return the jsObject if the file reading goes as expected', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(jsObject);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                const result = await infoOperations.loadXmlFile(testPath);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(jsObject);
                expect(convertXML).toHaveBeenCalledWith(xmlInfo);
                expect(xmlData.isThereData()).toBe(true);
            });

            it('should return DATA_WILL_BE_LOST error if there is alreadey data stored', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(jsObject);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                await infoOperations.loadXmlFile(testPath);
                const result = await infoOperations.loadXmlFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_WILL_BE_LOST);
                expect(convertXML).toHaveBeenCalledTimes(1);
            });

            it('should return the jsObject despite that there is data stored if we run the loadXmlFile in force mode', async () => {
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(jsObject);
                mockReadFileAsync.mockResolvedValue(xmlInfo);

                await infoOperations.loadXmlFile(testPath);
                const result = await infoOperations.loadXmlFile(testPath, true);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(jsObject);
                expect(convertXML).toHaveBeenCalledTimes(2);
            });
        });
    });

    describe('Unit test', () => {
        describe('appHelp method', () => {
            it('should returna an error INVALDID_COMMAND_ERROR if the command list is empty', () => {
                const result = infoOperations.appHelp([]);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_COMMAND_ERROR);
                expect(result.message).toContain('<empty>');
            });

            it('should return an error INVALID_COMMAND_ERROR if the first command is an unknown command', () => {
                const command = 'test';
                const result = infoOperations.appHelp([command]);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_COMMAND_ERROR);
                expect(result.message).toContain(command);
            });

            it('should resturn an error INVALID_COMMAND_ERROR if the second command is an unknown command', () => {
                const command = ['load', 'test'];
                const result = infoOperations.appHelp(command);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_COMMAND_ERROR);
                expect(result.message).toContain(command.join(' '));
            });

            it('should return HelpNode with the next posibilities in the command lines', () => {
                const command = ['load', 'xml', 'file'];
                const expectedResult: HelpNode[] = [
                    new HelpNode('path', 'The path where the file is', true),
                    new HelpNode('force', 'Overwrite the previous data', true)
                ];

                const result = infoOperations.appHelp(command);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });

        describe('loadXmlFile method', () => {
            beforeEach(() => {
                xmlData.isThereData = jest.fn();
                xmlData.loadData = jest.fn();
            });

            it('should return an error INVALID_PATH_ERROR if the path is empty', async () => {
                const result = await infoOperations.loadXmlFile('');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_PATH_ERROR);
                expect(xmlData.isThereData).not.toHaveBeenCalled();
                expect(xmlData.loadData).not.toHaveBeenCalled();
            });

            it('should return an error DATA_WIL_BE_LOST if there is already data stored', async () => {
                (xmlData.isThereData as jest.Mock).mockReturnValue(true);

                const result = await infoOperations.loadXmlFile(testPath);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_WILL_BE_LOST);
                expect(xmlData.loadData).not.toHaveBeenCalled();
            });

            it('should call the loadData method if there is data stored but the user wants to overwrite it', async () => {
                (xmlData.isThereData as jest.Mock).mockReturnValue(true);

                await infoOperations.loadXmlFile(testPath, true);

                expect(xmlData.loadData).toHaveBeenCalledWith(testPath);
            });

            it('should call the loadData method if there isnt any data stored', async () => {
                (xmlData.isThereData as jest.Mock).mockReturnValue(false);

                await infoOperations.loadXmlFile(testPath);

                expect(xmlData.loadData).toHaveBeenCalledWith(testPath);
            });
        });
    });
});