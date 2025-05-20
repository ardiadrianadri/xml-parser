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
}

export const views = new Views();