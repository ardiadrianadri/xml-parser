import { files } from '../datasource';
import { appResponses, ErrorApp, Response } from '../entities';
import { join } from 'path';

class Views {
    private viewsStored: Record<string, any> = {};

    public storeView(name: string, data: any): Response<any> | ErrorApp {
        if (!data) {
            return new ErrorApp(appResponses.DATA_TO_VIEW_EMPTY, `The data recived has the value ${data}`, new Error().stack);
        }

        this.viewsStored[name] = data;

        return new Response(appResponses.OK, 'Data stored successfully', data);
    }

    public removeAllViews() {
        this.viewsStored = {};
    }

    public listViews(): Response<string[]> {
        return new Response(appResponses.OK, 'List of the current views', Object.keys(this.viewsStored));
    }

    public getViewData(name: string): Response<any> | ErrorApp {
        return this.viewsStored[name]
            ? new Response(appResponses.OK, `Content of the view ${name}`, this.viewsStored[name])
            : new ErrorApp(appResponses.VIEW_NOT_FOUND, `There isnt any view with the name ${name}`, new Error().stack);
    }

    public splitViewData(name: string, separator: string): Response<any> | ErrorApp {
        const view = this.viewsStored[name];
        let splitData: any[];

        if (!view) {
            return new ErrorApp(appResponses.VIEW_NOT_FOUND, `There isnt any view with the name ${name}`, new Error().stack);
        }

        if (!Array.isArray(view) && typeof view !== 'string') {
            return new ErrorApp(appResponses.VIEW_NOT_SPLITABLE, `The view ${name} cant be divided`, new Error().stack);
        }

        if (Array.isArray(view)) {
            splitData = view
                .filter((item: any) => typeof item === 'string')
                .map((item: any) => {
                    if (typeof item !== 'string') {
                        return item;
                    }
                    return item.split(separator);
                })
                .flat()
                .map((item: any) => item.trim())
                .filter((item: any) => item.length > 0);

            if (splitData.length === 0) {
                return new ErrorApp(appResponses.VIEW_NOT_SPLITABLE, `The view ${name} cant be divided`, new Error().stack);
            }
        }

        if (typeof view === 'string') {
            splitData = view.split(separator);
        }

        return new Response(appResponses.OK, `The data of the view ${name} was splitted`, splitData);
    }

    public saveAllViews(path: string): Promise<(Response<string[]> | ErrorApp)[]> {
        const listOfViews = Object.keys(this.viewsStored);
        return listOfViews.length === 0
            ? Promise.resolve([new ErrorApp(appResponses.VIEW_STORE_EMPTY, 'There isnt any view stored', new Error().stack)])
            : Promise.all(
                listOfViews
                    .map(async (view: string) => {
                        const result = await this.saveView(path, view);

                        if (result instanceof ErrorApp) {
                            throw result;
                        }

                        return result;
                    })
            ).catch(err => [err]);
    }

    public async saveView(path: string, view: string): Promise<Response<string[]> | ErrorApp> {
        const content = this.viewsStored[view];

        if (!content) {
            return new ErrorApp(appResponses.VIEW_NOT_FOUND, `There isnt any data linked with the view ${view}`, new Error().stack);
        }

        return files.writeFile(join(path, `${view}.txt`), content);
    }
}

export const views = new Views();