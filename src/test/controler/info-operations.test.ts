/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { existsSync } from 'fs';
import { promisify } from 'util';
import { convertXML } from 'simple-xml-to-json';

import { infoOperations } from '../../app/controler';
import { appResponses, commandHelp, ErrorApp, HelpNode, Response } from '../../app/entities';
import { views, xmlData } from '../../app/services';

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

        describe('loadXmlFile method', () => {
            beforeEach(() => {
                xmlData.clearData();
            });

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

        describe('createViewNamed method', () => {
            const infoFromXml = {
                    node: {
                        children: [{
                            node0: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node1: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node2: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node3: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node4: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            }
                        }, {
                            node0: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node1: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node2: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node3: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node4: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            }
                        }]
                    }
                };
            const veiwName = 'intTest';

            beforeAll(async () => {
                mockReadFileAsync.mockResolvedValue(xmlInfo);
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(infoFromXml);
                xmlData.clearData();

                await infoOperations.loadXmlFile(testPath);
            });

            it('should return a QUERY_NOT_FOUND_DATA if the query doesnt match with any data node', () => {
                const path = 'node.children.node10';
                const result = infoOperations.createViewNamed(path, veiwName);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.QUERY_NOT_FOUND_DATA);
                expect(result.message).toContain(path);
            });

            it('should return the view created if everything goes as expected', () => {
                const path = 'node.children.node3.children.name';
                const expectedResult = ['name', 'name'];

                const result = infoOperations.createViewNamed(path, veiwName);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });

        describe('getAllViews method', () => {
            const veiwName01 = 'intTest01';
            const veiwName02 = 'intTest02';

            beforeEach(async () => {
                const infoFromXml = {
                    node: {
                        children: [{
                            node0: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node1: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node2: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node3: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node4: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            }
                        }, {
                            node0: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node1: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node2: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node3: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            },
                            node4: {
                                children: [
                                    {
                                        data: 'data',
                                        name: 'name'
                                    }
                                ]
                            }
                        }]
                    }
                };
                const viewPath = 'node.children.node3.children.name';

                mockReadFileAsync.mockResolvedValue(xmlInfo);
                (existsSync as jest.Mock).mockReturnValue(true);
                (convertXML as jest.Mock).mockReturnValue(infoFromXml);
                xmlData.clearData();
                views.removeAllViews();

                await infoOperations.loadXmlFile(testPath);
                infoOperations.createViewNamed(viewPath, veiwName01);
                infoOperations.createViewNamed(viewPath, veiwName02);
            });

            it('should return an empty array if there isnt any view stored', () => {
                const expectedResult: string[] = [];
                views.removeAllViews();

                const result = infoOperations.getAllViews();

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });

            it('should return a list wiht the names of all the views stored', () => {
                const expectedResult = [veiwName01, veiwName02];

                const result = infoOperations.getAllViews();
                
                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });
    });

    describe('Unit test', () => {
        describe('appHelp method', () => {
            it('should return a list of all the base commands if the commands list is empty', () => {
                const initialCommands = Object.keys(commandHelp)
                    .map((command: string) => new HelpNode(
                        command,
                        commandHelp[command].text
                    ));
                const result = infoOperations.appHelp([]);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(initialCommands);
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

        describe('QueryDataView method', () => {
            const viewName = 'testView';
            const query = 'unit.test.query';
            const queryObj = {
                node: {
                    children: [
                        { data: 'test data' }
                    ]
                }
            };
            beforeEach(() => {
                xmlData.doQuery = jest.fn();
                views.storeView = jest.fn();
            });

            it('should return a INVALID_QUERY_VIEW if the query is empty', () => {
                const result = infoOperations.createViewNamed('', viewName);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_QUERY_VIEW);
                expect(xmlData.doQuery).not.toHaveBeenCalled();
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should return an INVALID_NAME_VIEW if the name is empty', () => {
                const result = infoOperations.createViewNamed(query, '');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_NAME_VIEW);
                expect(xmlData.doQuery).not.toHaveBeenCalled();
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should return QUERY_NOT_FOUND_DATA if the doQuery method return this error', () => {
                const testError = new Error('test Error');
                (xmlData.doQuery as jest.Mock).mockReturnValue(
                    new ErrorApp(appResponses.QUERY_NOT_FOUND_DATA, 'Test error', testError?.stack || 'test Error')
                );

                const result = infoOperations.createViewNamed(query, viewName);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.QUERY_NOT_FOUND_DATA);
                expect(result.payload).toBe(testError.stack);
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should return DATA_TO_VIEW_EMPTY if the result of the query is an empty object', () => {
                const testError = new Error('test Error');
                (xmlData.doQuery as jest.Mock).mockReturnValue(
                    new Response(appResponses.OK, 'test result', undefined)
                );
                (views.storeView as jest.Mock).mockReturnValue(
                    new ErrorApp(appResponses.DATA_TO_VIEW_EMPTY, 'test error', testError.stack || 'test stack')
                );

                const result = infoOperations.createViewNamed(query, viewName);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_TO_VIEW_EMPTY);
                expect(result.payload).toBe(testError.stack);
            });

            it('should store the query obtained from xmlData.doQuery with the input name', () => {
                (xmlData.doQuery as jest.Mock).mockReturnValue(
                    new Response(appResponses.OK, 'test response', queryObj)
                );

                infoOperations.createViewNamed(query, viewName);

                expect(views.storeView).toHaveBeenCalledWith(viewName, queryObj);
            });
        });

        describe('getAllViews method', () => {
            beforeEach(() => {
                views.listViews = jest.fn();
            });

            it('should return an empty list if there isnt any view stored', () => {
                const expectResult: string[] = [];
                (views.listViews as jest.Mock).mockReturnValue(
                    new Response(appResponses.OK, 'list of views', expectResult)
                );

                const result = infoOperations.getAllViews();
                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectResult);
            });

            it('should return a list of all the views stored in the app', () => {
                const expectedResult = ['test01', 'test02'];
                (views.listViews as jest.Mock).mockReturnValue(
                    new Response(appResponses.OK, 'list of views', expectedResult)
                );

                const result = infoOperations.getAllViews();
                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });
    });
});