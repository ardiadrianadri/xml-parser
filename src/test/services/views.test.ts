import { appResponses, ErrorApp, Response } from '../../app/entities';
import { views } from '../../app/services';

describe('Service Views', () => {
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
    });
});