import xmlreader from 'simple-xml-to-json';

import { files } from '../datasource';
import { appResponses, ErrorApp, Response } from '../entities';

class XmlData {
    private xmlData: Record<string, any> | undefined;

    private searchData(attr: string, data: Record<string, any>): any {

        if (Array.isArray(data)) {
            return data
                .map((value) => this.searchData(attr, value))
                .flat()
                .filter((value) => !!value);
        }

        return data[attr];
    }

    async loadData(path: string): Promise<Response<Record<string,any>> | ErrorApp> {
        if (!path) {
            return new ErrorApp(appResponses.INVALID_PATH_ERROR,'The path is null or undefined', new Error().stack);
        }

        const xmlText = await files.readFile(path)
            .catch((err) => err);

        if (xmlText instanceof ErrorApp) {
            return xmlText;
        }

        try {
            this.xmlData = xmlreader.convertXML(xmlText.payload);

            return new Response(appResponses.OK, 'The xmlData was parsed successfully', this.xmlData);
        }
        catch(err) {
            return new ErrorApp(appResponses.XML_PARSE_ERROR, `The content ${xmlText.payload} couldnt be converted into a json`, err?.stack || 'XmlData.loadDAta');
        }
    }

    clearData() {
        this.xmlData = undefined;
    }

    isThereData(): boolean {
        return !! this.xmlData;
    }

    doQuery(path: string): Response<any> | ErrorApp {
        const attrs = path.split('.');
        
        let index = 0;
        let result = this.xmlData;

        while(!!result && index < attrs.length) {
            result = this.searchData(attrs[index++], result);
        }

        if ((Array.isArray(result) && result.length === 0) || !result) {
            return new ErrorApp(appResponses.QUERY_NOT_FOUND_DATA, `Any information could be found in the path ${path}`, new Error().stack);
        }

        return new Response(appResponses.OK, 'Information found', result);
    }
}

export const xmlData = new XmlData();