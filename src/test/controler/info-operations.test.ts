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

async function createViews(viewsNames: string[], data: any, viewPath: string, xmlInfo: string, testPath: string) {
    mockReadFileAsync.mockResolvedValue(xmlInfo);
    (existsSync as jest.Mock).mockReturnValue(true);
    (convertXML as jest.Mock).mockReturnValue(data);

    await infoOperations.loadXmlFile(testPath);
    
    for(const name of viewsNames) {
        infoOperations.createViewNamed(viewPath, name);
    }
}


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
                xmlData.clearData();
                views.removeAllViews();

                await createViews(
                    [veiwName01, veiwName02],
                    infoFromXml,
                    viewPath,
                    xmlInfo,
                    testPath
                );
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

        describe('getOneView method', () => {
            const veiwName01 = 'intTest01';
            const veiwName02 = 'intTest02';

            beforeEach(async () => {
                xmlData.clearData();
                views.removeAllViews();

                await createViews(
                    [veiwName01, veiwName02],
                    infoFromXml,
                    viewPath,
                    xmlInfo,
                    testPath
                );
            });

            it('should return INVALID_NAME_VIEW if the input name is not valid', () => {
                const result = infoOperations.getOneView('');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_NAME_VIEW);
            });

            it('should return VIEW_NOT_FOUND if there isnt any view stored with the name', () => {
                const name = 'test';
                const result = infoOperations.getOneView(name);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
                expect(result.message).toContain(name);
            });

            it('should return the data stored in the name', () => {
                const expectedResult = ['name', 'name'];
                const result = infoOperations.getOneView(veiwName01);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });

        describe('splitViewBy method', () => {
            const dataFromXml = {
                node: {
                    children: [
                        {
                            data: {
                                array: ['test01,test02', 'test03,test04'],
                                string: 'test01,test02,test03,test04',
                                arrayObj: [{ value: 'test01'}, {value: 'test02'}],
                                arrayObjSp: [{ value: 'test01,test02'}, 'test03,test04']
                            }
                        }
                    ]
                }
            };

            const path01 = 'node.children.data';
            const path02 = 'node.children.data.array';
            const path03 = 'node.children.data.string';
            const path04 = 'node.children.data.arrayObj';
            const path05 = 'node.children.data.arrayObjSp';
            const name01 = 'notSplitable';
            const name02 = 'arrayStrings';
            const name03 = 'simpleStrings';
            const name04 = 'arrayObjects';
            const name05 = 'arrayObjectsSp';

            beforeEach(async () => {
                xmlData.clearData();
                views.removeAllViews();

                await createViews(
                    [name01],
                    dataFromXml,
                    path01,
                    xmlInfo,
                    testPath
                );

                await createViews(
                    [name02],
                    dataFromXml,
                    path02,
                    xmlInfo,
                    testPath
                );

                await createViews(
                    [name03],
                    dataFromXml,
                    path03,
                    xmlInfo,
                    testPath
                );

                await createViews(
                    [name04],
                    dataFromXml,
                    path04,
                    xmlInfo,
                    testPath
                );

                await createViews(
                    [name05],
                    dataFromXml,
                    path05,
                    xmlInfo,
                    testPath
                );
            });

            it('should return an INVALID_NAME_VIEW if the name is empty', () => {
                const result = infoOperations.splitViewBy('',',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_NAME_VIEW);
            });

            it('should return INVALID_SEPARATOR_VIEW if the separator is empty', () => {
                const result = infoOperations.splitViewBy(name01,'');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_SEPARATOR_VIEW);
            });

            it('should return VIEW_NOT_FOUND if the name doesnt match with any view', () => {
                const testName = 'testBar';
                const result = infoOperations.splitViewBy(testName, ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
                expect(result.message).toContain(testName);
            });

            it('should return VIEW_NOT_SPLITABLE if it is an array with commponents that are not splittable', () => {
                const result = infoOperations.splitViewBy(name04, ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_SPLITABLE);
                expect(result.message).toContain(name04);
            });

            it('should return VIEW_NOT_SPLITABLE if the view is not splittable', () => {
                const result = infoOperations.splitViewBy(name01, ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_SPLITABLE);
                expect(result.message).toContain(name01);
            });

            it('should return an plain array if the view is an array of strings', () => {
                const expectedResult = ['test01', 'test02', 'test03', 'test04'];
                const result = infoOperations.splitViewBy(name02, ',');

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });

            it('should return an array of strings if the view is a string', () => {
                const expectedResult = ['test01', 'test02', 'test03', 'test04'];
                const result = infoOperations.splitViewBy(name03, ',');

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });

            it('should return an array of strings if the view is an array and one of its elements is splittable', () => {
                const expectedResult = ['test03', 'test04'];
                const result = infoOperations.splitViewBy(name05, ',');

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
                    new HelpNode('path', 'The path where the file is', true, 'text'),
                    new HelpNode('force', 'Overwrite the previous data', true, 'boolean')
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

        describe('getOneView method', () => {
            const testName = 'testName';

            beforeEach(() => {
                views.getViewData = jest.fn();
            });

            it('should return INVALID_NAME_VIEW if the input name is not a valid name', () => {
                const result = infoOperations.getOneView('');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_NAME_VIEW);
                expect(views.getViewData).not.toHaveBeenCalled();
            });

            it('should call the views.getViewData if the input name is valid', () => {
                infoOperations.getOneView(testName);

                expect(views.getViewData).toHaveBeenCalledWith(testName);
            });
        });

        describe('splitViewBy method', () => {
            const testName = 'testName';
            const testData = ['test01', 'test02'];
            beforeEach(() => {
                views.splitViewData = jest.fn();
                views.storeView = jest.fn();
            });

            it('should return INVALID_NAME_VIEW if the name is empty', () => {
                const result = infoOperations.splitViewBy('', ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_NAME_VIEW);
                expect(views.splitViewData).not.toHaveBeenCalled();
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should return INVALID_SEPARATOR_VIEW if the separator is empty', () => {
                const result = infoOperations.splitViewBy(testName, '');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.INVALID_SEPARATOR_VIEW);
                expect(views.splitViewData).not.toHaveBeenCalled();
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should return view error if there is an error during the views.splictViewData execution', () => {
                const testError = new Error('test');
                (views.splitViewData as jest.Mock).mockReturnValue(
                    new ErrorApp(appResponses.VIEW_NOT_FOUND, 'Test error', testError.stack || 'test stack')
                );

                const result = infoOperations.splitViewBy(testName, ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
                expect(result.payload).toBe(testError.stack);
                expect(views.storeView).not.toHaveBeenCalled();
            });

            it('should call storeView method if the splitViewData return a Response object', () => {
                const testResponse = new Response(appResponses.OK, 'test success', testData);
                
                (views.splitViewData as jest.Mock).mockReturnValue(testResponse);
                infoOperations.splitViewBy(testName, ',');

                expect(views.storeView).toHaveBeenCalledWith(testName+'_split',testResponse.payload);
            });

        });
    });
});