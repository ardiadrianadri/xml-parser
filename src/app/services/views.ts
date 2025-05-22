import { appResponses, ErrorApp, Response} from '../entities';

class Views {
    private viewsStored: Record<string, any> = {};

    public storeView (name: string, data: any): Response<any> | ErrorApp  {
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
}

export const views = new Views();