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
    }
};

export class HelpNode {
    constructor(
        public option: string,
        public text: string,
        public isArgument = false
    ) {}
}
