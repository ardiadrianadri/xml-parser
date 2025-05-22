import { appResponses, commandHelp, ErrorApp, HelpNode, Response } from '../entities';
import { views, xmlData } from '../services';

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

        if (commands.length === 0) {
            for (const option in commandHelp) {
                payload.push (
                    new HelpNode(
                        option,
                        commandHelp[option].text
                    )
                );
            }

            return new Response(appResponses.OK, 'Base commands', payload);
        }

        while(command && index < commands.length) {
            command = command?.nodes[commands[index++]];
        }

        if (command?.nodes) {
            for (const option in command.nodes) {
                payload.push(
                    new HelpNode(
                        option,
                        command.nodes[option].text,
                        command.nodes[option].arg,
                        command.nodes[option]?.type
                    )
                );
            }

            return new Response(appResponses.OK, 'Command found', payload);
        }

        return new ErrorApp(appResponses.INVALID_COMMAND_ERROR, `The command ${commands.join(' ')} is not a valid command`, new Error().stack);
    }

    public createViewNamed(query: string, name: string): Response<any> | ErrorApp {
        if (!query) {
            return new ErrorApp(appResponses.INVALID_QUERY_VIEW, 'The query for the view is empty', new Error().stack);
        }

        if (!name) {
            return new ErrorApp(appResponses.INVALID_NAME_VIEW, 'The name for the view is empty', new Error().stack);
        }

        const queryResult = xmlData.doQuery(query);

        if(queryResult instanceof ErrorApp) {
            return queryResult;
        }

        return views.storeView(name, queryResult.payload);
    }

    public getAllViews(): Response<string[]> {
        return views.listViews();
    }

    public getOneView(name: string): Response<any> | ErrorApp {
        if(!name) {
            return new ErrorApp(appResponses.INVALID_NAME_VIEW, 'The name for the view is empty', new Error().stack);
        }

        return views.getViewData(name);
    }
}

export const infoOperations = new InfoOperations();