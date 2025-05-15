import { convertXML } from 'simple-xml-to-json';

import { files } from '../datasource';
import { appResponses, ErrorApp, Response } from '../entities';

class XmlData {
    private xmlData: Record<string, any> | undefined;

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
            this.xmlData = convertXML(xmlText.payload);

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
}

export const xmlData = new XmlData();