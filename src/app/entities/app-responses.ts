import { ResponseCode } from './response-code';

export const appResponses = {
    OK: new ResponseCode('OK', 'Everything went as expected'),
    XML_FILE_NOT_FOUND: new ResponseCode('XML_FILE_NOT_FOUND', 'The xml file could not be found in the path'),
    XML_READ_ERROR: new ResponseCode('XML_READ_ERROR', 'There was an error reading the XML file'),
    WRITE_FILE_ERROR: new ResponseCode('WRITE_FILE_ERROR', 'There was an error when a file was tried to be written'),
    XML_PARSE_ERROR: new ResponseCode('XML_PARSE_ERROR', 'There was an error while we were trying to convert the xml text into a json'),
    INVALID_PATH_ERROR: new ResponseCode('INVALID_PATH_ERROR', 'The path we got isnt a valid path')
};