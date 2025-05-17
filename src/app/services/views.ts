import { appResponses, Response} from '../entities';

class Views {
    private viewsStored: Record<string, any> = {};

    public storeView (name: string, data: any): Response<any>  {
       this.viewsStored[name] = data;

       return new Response(appResponses.OK, 'Data stored successfully', data);
    }

    public removeAllViews() {
        this.viewsStored = {};
    }
}

export const views = new Views();