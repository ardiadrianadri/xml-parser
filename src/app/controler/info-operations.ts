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

    public splitViewBy(name: string, separator: string): Response<any> | ErrorApp {
        if(!name) {
            return new ErrorApp(appResponses.INVALID_NAME_VIEW, 'The name for the view is empty', new Error().stack);
        }

        if(!separator) {
            return new ErrorApp(appResponses.INVALID_SEPARATOR_VIEW, 'The separator for the view is empty', new Error().stack);
        }

        const newView =  views.splitViewData(name, separator);

        if (newView instanceof ErrorApp) {
            return newView;
        }

        return views.storeView(name + '_split', newView.payload);
    }

    public async saveOneView(name: string, path: string): Promise<Response<string[]> | ErrorApp> {
        if (!name) {
            return new ErrorApp(appResponses.INVALID_NAME_VIEW, 'The name for the view is empty', new Error().stack);
        }

        if (!path) {
            return new ErrorApp(appResponses.INVALID_PATH_ERROR, 'The path for the file is empty', new Error().stack);
        }

        return views.saveView(path, name);
    }

    public async saveAllViews(path: string): Promise<Response<undefined> | ErrorApp> {
        if (!path) {
            return new ErrorApp(appResponses.INVALID_PATH_ERROR, 'The path for the file is empty', new Error().stack);
        }

        const result = await views.saveAllViews(path);

        if (result[0] instanceof ErrorApp) {
            return result[0];
        }

        return new Response(appResponses.OK, `Views stores in path ${path}`);
    }

    public joinTwoViews(name1: string, name2: string): Response<any> | ErrorApp {
        if (!name1 || !name2) {
            return new ErrorApp(appResponses.INVALID_NAME_VIEW, 'The name for the view is empty', new Error().stack);
        }

        const joinedView = views.mixViews(name1, name2);

        if (joinedView instanceof ErrorApp) {
            return joinedView;
        }

        const createViewResult = views.storeView(name1 + '_' + name2 + '_joined', joinedView.payload);
        
        if (createViewResult instanceof ErrorApp) {
            return createViewResult;
        }

        return new Response(appResponses.OK, `Views ${name1} and ${name2} joined`, createViewResult.payload);
    }
}

export const infoOperations = new InfoOperations();