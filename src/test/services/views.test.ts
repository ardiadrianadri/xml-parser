import { appResponses, ErrorApp, Response } from '../../app/entities';
import { views} from '../../app/services';

describe('Service Views', () => {
    describe('Unit test', () => {
        describe('storeView method', () => {
            const data = {
                info: {
                    content: 'test'
                }
            };

            const testName = 'testView';
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
    });
});