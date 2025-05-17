export const commandHelp: Record<string, any> = {
    load: {
        text: 'Load info into the app',
        arg: false,
        nodes: {
            xml: {
                text: 'The information is in xml format',
                arg: false,
                nodes: {
                    file: {
                        text: 'The information is inside a file',
                        arg: false,
                        nodes: {
                            path: {
                                text: 'The path where the file is',
                                arg: true
                            },
                            force: {
                                text: 'Overwrite the previous data',
                                arg: true
                            }
                        }
                    }
                }
            }
        }
    },
    create: {
        text: 'Create a new view based on the data loaded',
        arg: false,
        nodes: {
            view: {
                text: 'Create a new view from the data loaded',
                arg: false,
                nodes: {
                    named: {
                        text: 'Create a new view from the data loaded and stored with a name',
                        arg: false,
                        nodes: {
                            query: {
                                text: 'Query to select the data to create the query',
                                arg: true
                            },
                            name: {
                                text: 'Name given to the view',
                                arg: true
                            }
                        }
                    }
                }
            }
        }
    },
    exit: {
        text: 'Close the app',
        arg: false
    }
};

export class HelpNode {
    constructor(
        public option: string,
        public text: string,
        public isArgument = false
    ) {}
}
