import { ResponseCode } from './response-code';

export const appResponses = {
    OK: new ResponseCode('OK', 'Everything went as expected'),
    XML_FILE_NOT_FOUND: new ResponseCode('XML_FILE_NOT_FOUND', 'The xml file could not be found in the path'),
    XML_READ_ERROR: new ResponseCode('XML_READ_ERROR', 'There was an error reading the XML file'),
    WRITE_FILE_ERROR: new ResponseCode('WRITE_FILE_ERROR', 'There was an error when a file was tried to be written'),
    XML_PARSE_ERROR: new ResponseCode('XML_PARSE_ERROR', 'There was an error while we were trying to convert the xml text into a json'),
    INVALID_PATH_ERROR: new ResponseCode('INVALID_PATH_ERROR', 'The path we got isnt a valid path'),
    INVALID_COMMAND_ERROR: new ResponseCode('INVALID_COMMAND_ERROR', 'The command introduced is not a valid command'),
    DATA_WILL_BE_LOST: new ResponseCode('DATA_WILL_BE_LOST', 'There is already data loaded that will be overwritten if we load a new file'),
    QUERY_NOT_FOUND_DATA: new ResponseCode('QUERY_NOT_FOUND_DATA', 'The query cant find any data'),
    DATA_TO_VIEW_EMPTY: new ResponseCode('DATA_TO_VIEW_EMPTY','The data to be stored in a view is null, undefined or an empty string'),
    INVALID_QUERY_VIEW: new ResponseCode('INVALID_QUERY_VIEW', 'The query to create a new view is empty'),
    INVALID_NAME_VIEW: new ResponseCode('INVALID_NAME_VIEW', 'The name for the view is empty'),
    VIEW_NOT_SPLITABLE: new ResponseCode('VIEW_NOT_SPLITABLE', 'The view is not splittable'),
    VIEW_NOT_FOUND: new ResponseCode('VIEW_NOT_FOUND', 'The view was not found'),
    INVALID_SEPARATOR_VIEW: new ResponseCode('INVALID_SEPARATOR_VIEW', 'The separator cant be empty'),
};