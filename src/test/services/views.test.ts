/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-var */
import { writeFile } from 'fs';
import { promisify } from 'util';

import { files } from '../../app/datasource';
import { appResponses, ErrorApp, Response } from '../../app/entities';
import { views } from '../../app/services';
import { join } from 'path';

jest.mock('fs', () => ({
    writeFile: jest.fn()
}));

var mockWriteFileAsync = jest.fn();
jest.mock('util', () => ({
    promisify: () => mockWriteFileAsync
}));

describe('Service Views', () => {
    const testPath = 'path/to/test';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('integration test', () => {
        const testView01 = 'testView01';
        const testView02 = 'testView02';
        const testView03 = 'testView03';
        const testData = ['line01', 'line02'];

        describe('saveView method', () => {

            beforeEach(() => {
                views.removeAllViews();
                views.storeView(testView01, testData);
                views.storeView(testView02, testData);
                views.storeView(testView03, []);
            });

            it('should return VIEW_NOT_FOUND if the name provided doesnt match with any view', async () => {
                const viewName = 'testBar';
                const result = await views.saveView(testPath, viewName);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
                expect(result.message).toContain(viewName);

                expect(mockWriteFileAsync).not.toHaveBeenCalled();
            });

            it('should return DATA_FILE_EMPTY if the data sent to be written is an empty array', async () => {
                const result = await views.saveView(testPath, testView03);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_FILE_EMPTY);

                expect(mockWriteFileAsync).not.toHaveBeenCalled();
            });

            it('should return WRITE_FILE_ERROR if there is a problem writting the data inside the file', async () => {
                const testError = new Error('test');
                mockWriteFileAsync.mockRejectedValue(testError);

                const result = await views.saveView(testPath, testView01);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result.payload).toBe(testError.stack);
            });

            it('should return a response with the data written in the file if everything goes as expected', async () => {
                mockWriteFileAsync.mockResolvedValue(testData);

                const result = await views.saveView(testPath, testView01);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(testData);
            });
        });

        describe('saveAllViews method', () => {
            beforeEach(() => {
                views.removeAllViews();
                views.storeView(testView01, testData);
                views.storeView(testView02, testData);
            });

            it('should return VIEW_STORE_EMPTY if there isnt any view stored', async () => {
                views.removeAllViews();

                const result = await views.saveAllViews(testPath);

                expect(result.length).toBe(1);
                expect(result[0]).toBeInstanceOf(ErrorApp);
                expect(result[0].code).toEqual(appResponses.VIEW_STORE_EMPTY);
            });

            it('should return an array with WRITE_FILE_ERROR it there is an error writting the files', async () => {
                const testError = new Error('test');
                mockWriteFileAsync.mockRejectedValue(testError);

                const result = await views.saveAllViews(testPath);

                expect(result.length).toBe(1);
                expect(result[0]).toBeInstanceOf(ErrorApp);
                expect(result[0].code).toEqual(appResponses.WRITE_FILE_ERROR);
                expect(result[0].payload).toBe(testError.stack);
            });

            it('should return an array of two responses if everything goes as expected', async () => {
                mockWriteFileAsync.mockResolvedValue(testData);

                const results = await views.saveAllViews(testPath);

                expect(results.length).toBe(2);

                for (const result of results) {
                    expect(result).toBeInstanceOf(Response);
                    expect(result.code).toEqual(appResponses.OK);
                    expect(result.payload).toEqual(testData);
                }
            });
        });
    });

    describe('Unit test', () => {
        const data = {
            info: {
                content: 'test'
            }
        };
        const testName = 'testView';

        describe('storeView method', () => {

            beforeEach(() => {
                views.removeAllViews();
            });

            it('should return an DATA_TO_VIEW_EMPTY error if the data input is empty', () => {
                const result = views.storeView(testName, undefined);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.DATA_TO_VIEW_EMPTY);
            });

            it('should create a new view if the view doesnt exist', () => {
                const result = views.storeView(testName, data);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(data);
            });

            it('should overwrite the view if we try to store a differnt view in the same name', () => {
                const firstData = {
                    info: {
                        content: 'test2'
                    }
                };

                views.storeView(testName, firstData);
                const result = views.storeView(testName, data);

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(data);
            });
        });

        describe('listViews method', () => {
            const testName01 = 'firstTest';
            const testName02 = 'secondTest';

            beforeEach(() => {
                views.storeView(testName01, data);
                views.storeView(testName02, data);
            });

            it('should return an empty array if there isnt any view created', () => {
                const expectedResult: string[] = [];

                views.removeAllViews();
                const result = views.listViews();

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });

            it('should return a list of the names of the current views stored', () => {
                const expectedResult = [testName01, testName02];
                const result = views.listViews();

                expect(result).toBeInstanceOf(Response);
                expect(result.code).toEqual(appResponses.OK);
                expect(result.payload).toEqual(expectedResult);
            });
        });

        describe('splitViewData method', () => {
            const nameView01 = 'view01';
            const nameView02 = 'view02';
            const dataView01 = 'test1,test2,test3';
            const dataView02 = ['test1,test2', 'test3,test4'];

            beforeEach(() => {
                views.removeAllViews();
                views.storeView(nameView01, dataView01);
                views.storeView(nameView02, dataView02);
            });

            it('should return an error if the view doesnt exist', () => {
                const result = views.splitViewData('nonExistentView', ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
            });

            it('should return an error if the view is not splittable', () => {
                const nameView03 = 'view03';
                const dataView03 = { key: 'value' };

                views.storeView(nameView03, dataView03);
                const result = views.splitViewData(nameView03, ',');

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_SPLITABLE);
            });

            it('should return the splitted data of the view if it is splittable', () => {
                const result01 = views.splitViewData(nameView01, ',');
                const result02 = views.splitViewData(nameView02, ',');

                expect(result01).toBeInstanceOf(Response);
                expect(result01.code).toEqual(appResponses.OK);
                expect(result01.payload).toEqual(['test1', 'test2', 'test3']);

                expect(result02).toBeInstanceOf(Response);
                expect(result02.code).toEqual(appResponses.OK);
                expect(result02.payload).toEqual(['test1', 'test2', 'test3', 'test4']);
            });
        });

        describe('saveView method', () => {
            const testView = 'testView';
            const testData = ['line01', 'line02'];

            beforeEach(() => {
                views.removeAllViews();
                views.storeView(testView, testData);

                files.writeFile = jest.fn();
            });

            it('should return VIEW_NOT_FOUND if there is no content stored under the view', async () => {
                const testView = 'bar';
                const result = await views.saveView(testPath, testView);

                expect(result).toBeInstanceOf(ErrorApp);
                expect(result.code).toEqual(appResponses.VIEW_NOT_FOUND);
                expect(result.message).toContain(testView);

                expect(files.writeFile).not.toHaveBeenCalled();
            });

            it('should call the method writeFile if theres is information stored in the view', async () => {
                await views.saveView(testPath, testView);

                expect(files.writeFile).toHaveBeenCalledWith(join(testPath, `${testView}.txt`), testData);
            });
        });

        describe('saveAllViews method', () => {
            const testView01 = 'testView01';
            const testView02 = 'testView02';
            const testData = ['line01', 'line02'];

            beforeEach(() => {
                views.removeAllViews();
                views.storeView(testView01, testData);
                views.storeView(testView02, testData);

                views.saveView = jest.fn();
            });

            it('should return a VIEW_STORE_EMPTY if there isnt any view stored', async () => {
                views.removeAllViews();

                const result = await views.saveAllViews(testPath);

                expect(result.length).toBe(1);
                expect(result[0]).toBeInstanceOf(ErrorApp);
                expect(result[0].code).toEqual(appResponses.VIEW_STORE_EMPTY);
            });

            it('should return an ErrorApp if the saveView method returns an errorApp', async () => {
                const testError = new ErrorApp(appResponses.VIEW_NOT_FOUND, 'test app', 'test.test');
                (views.saveView as jest.Mock).mockResolvedValue(testError);

                const result = await views.saveAllViews(testPath);

                expect(result.length).toBe(1);
                expect(result[0]).toEqual(testError);
            });

            it('should return an array with all the calls made to saveViews if everything goes as expected', async () => {
                const response = new Response(appResponses.OK, 'test response', testData);
                const expectedResponse = [response, response];
                (views.saveView as jest.Mock).mockResolvedValue(response);

                const results = await views.saveAllViews(testPath);

                expect(results).toEqual(expectedResponse);
            });
        });
    });
});