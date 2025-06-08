# XML-PARSER

A command-line tool built with TypeScript to parse, query, and process XML files.

## Features

* Reads and parses XML documents.

* Navigate through the XML node tree.

* Search by tag names, attributes, or values.

* Interactive commands to work with selected nodes.

* Built with TypeScript and configured with ESLint and Jest.

## Requirements

- [Node.js](https://nodejs.org/) v22.14.0 or higher  
- [npm](https://www.npmjs.com/) v11.1.0 or higher

## Installation
```
git clone https://github.com/ardiadrianadri/xml-parser.git
cd xml-parser
npm install
```

## Usage

Once installed, start the CLI with:
```
npm start
```

## CLI Commands

| Command                                             | Description                                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| *(Press Enter without typing)*                      | Shows general help and available commands.                                               |
| `exit`                                              | Exits the application.                                                                   |
| `load xml file <path:string> <force:boolean>`       | Loads an XML file into the app. Use `force` to overwrite any existing data.              |
| `create view named <jsonPath:string> <name:string>` | Creates a named view using a JSON path expression to extract specific data from the XML. |
| `get all views`                                     | Lists the names of all saved views.                                                      |
| `get one view <name:string>`                        | Displays the content of a specific view by name.                                         |
| `split view by <name:string> <separator:string>`    | Splits the lines of a view using a separator and creates a new view from the result.     |
| `save one view <name:string> <path:string>`         | Saves a single view to a file at the specified local path.                               |
| `save all views <path:string>`                      | Saves each view as a separate file inside the specified local folder.                    |
| `join two views <view1:string> <view2: string>`     | Join two views, removing all duplicate data                                              |

## Examples:
```
load xml file ./data/books.xml true
create view named library.books.children.title.content booksView
get one view booksView
save one view booksView ./exports/
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License
MIT
