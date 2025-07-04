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
                                arg: true,
                                required: true,
                                type: 'text'
                            },
                            force: {
                                text: 'Overwrite the previous data',
                                arg: true,
                                required: false,
                                type: 'boolean'
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
                                arg: true,
                                required: true,
                                type: 'text'
                            },
                            name: {
                                text: 'Name given to the view',
                                arg: true,
                                required: true,
                                type: 'text'
                            }
                        }
                    }
                }
            }
        }
    },
    get: {
        text: 'Get information stored in the app like views, for example',
        arg: false,
        nodes: {
            all: {
                text: 'Get all the information stored of the type written in the next level',
                arg: false,
                nodes: {
                    views: {
                        text: 'Get the information about views stores in the app',
                        arg: false,
                        nodes: {}
                    }
                }
            },
            one: {
                text: 'Get the content of one element stored in the app',
                arg: false,
                nodes: {
                    view: {
                        text: 'Check the content of one view',
                        arg: false,
                        nodes: {
                            name: {
                                text: 'Name given to the view',
                                arg: true,
                                required: true,
                                type: 'text'
                            }
                        }
                    }
                }
            }
        }
    },
    split: {
        text: 'Split the content of a view by a separator',
        arg: false,
        nodes: {
            view: {
                text: 'Split the content of a view',
                arg: false,
                nodes: {
                    by: {
                        text: 'Split the content of the view by a separator',
                        arg: false,
                        nodes: {
                            name: {
                                text: 'Name given to the view',
                                arg: true,
                                required: true,
                                type: 'text'
                            },
                            separator: {
                                text: 'Separator used to split the content of the view',
                                arg: true,
                                required: true,
                                type: 'text'
                            }
                        }
                    }
                }
            }
        }
    },
    save: {
        text: 'Save the data in a file',
        arg: false,
        nodes: {
            one: {
                text: 'Save the data of one view',
                arg: false,
                nodes: {
                    view: {
                        text: 'Save the data of a view in a file',
                        arg: false,
                        nodes: {
                            name: {
                                text: 'Name of the view',
                                arg: true,
                                required: true,
                                type: 'text'
                            },
                            path: {
                                text: 'Path where the view will be stored',
                                arg: true,
                                required: true,
                                type: 'text'
                            }
                        }
                    }
                }
            },
            all: {
                text: 'Save all the data in the file',
                arg: false,
                nodes: {
                    views: {
                        text: 'Save the data of all views',
                        arg: false,
                        nodes: {
                            path: {
                                text: 'Path where the views will be saved',
                                arg: true,
                                required: true,
                                type: 'text'
                            }
                        }
                    }
                }
            }
        }
    },
    join: {
        text: 'Join the content of a view',
        arg: false,
        nodes: {
            two: {
                text: 'Join the content of two views',
                arg: false,
                nodes: {
                    views: {
                        text: 'Join the content of two views',
                        arg: false,
                        nodes: {
                            first: {
                                text: 'Name of the first view',
                                arg: true,
                                required: true,
                                type: 'text'
                            },
                            second: {
                                text: 'Name of the second view',
                                arg: true,
                                required: true,
                                type: 'text'
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
        public isArgument = false,
        public type?: string,
    ) {}
}
