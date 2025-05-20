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
    });
});