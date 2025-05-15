import { infoOperations } from '../../app/controler';
import { appResponses, ErrorApp, HelpNode, Response } from '../../app/entities';
import { xmlData } from '../../app/services';

describe('Info operations controler', () => {
    const testPath = '/test/controller';

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