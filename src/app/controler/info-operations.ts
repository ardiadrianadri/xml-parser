import { appResponses, commandHelp, ErrorApp, HelpNode, Response } from '../entities';
import { xmlData } from '../services';

class InfoOperations {
    public async loadXmlFile(path: string, force = false): Promise<Response<Record<string,any>> | ErrorApp> {
        if(!path) {
            return new ErrorApp(appResponses.INVALID_PATH_ERROR,'The path is null or undefined', new Error().stack);
        }

        if (xmlData.isThereData() && !force) {
            return new ErrorApp(appResponses.DATA_WILL_BE_LOST, 'Do you want to overwrite the current data?', new Error().stack);
        }

        return xmlData.loadData(path);
    }

    public appHelp(commands: string[]): Response<HelpNode[]> | ErrorApp {
        let index = 0;
        let command = commandHelp[commands[index++]];
        
        const payload = [];

        while(command && index < commands.length) {
            command = command?.nodes[commands[index++]];
        }

        if (command?.nodes) {
            for (const option in command.nodes) {
                payload.push(
                    new HelpNode(
                        option,
                        command.nodes[option].text,
                        command.nodes[option].arg
                    )
                );
            }

            return new Response(appResponses.OK, 'Command found', payload);
        }

        return new ErrorApp(appResponses.INVALID_COMMAND_ERROR, `The command ${commands.length === 0 ? '<empty>' : commands.join(' ')} is not a valid command`, new Error().stack);
    }
}

export const infoOperations = new InfoOperations();