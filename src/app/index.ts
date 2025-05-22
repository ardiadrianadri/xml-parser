import prompts from 'prompts';
import { Subject } from 'rxjs';
import { infoOperations } from './controler';
import { ErrorApp, Response } from './entities';



const answerEvent = new Subject<string>();
const answerObs = answerEvent.asObservable();

const subscription = answerObs.subscribe(getAnswer);

async function validateCommand(command: string): Promise<Response<any> | ErrorApp> {
    const commandSequence = !command
        ? []
        : command.split(' ');

    if (commandSequence.length < 3) {
        return infoOperations.appHelp(commandSequence);
    }

    if(commandSequence.length === 3) {
        const help = infoOperations.appHelp(commandSequence);

        if (Object.keys(help.payload).length ) {
            return help;
        }
    }

    const method: string = commandSequence.slice(0,3).reduce((acc, part, index) => {
        return index === 0
            ? acc + part
            : acc + part.charAt(0).toUpperCase()+part.slice(1);
    }, '');

    if((infoOperations as any)[method]) {
        return await (infoOperations as any)[method](...commandSequence.slice(3));
    }

    return infoOperations.appHelp(commandSequence);
}

function proccessAnswer (result: Response<any> | ErrorApp) {
    if (result instanceof ErrorApp) {
        console.log('Error');
        console.log(`Type: ${result.code.description}`);
        console.log(`Message: ${result.message}`);
        console.log(`Stack: ${result.payload}`);
    } else {
        console.log('Success: ');
        console.log(`Message: ${result.message}`);
        console.log(`Result: ${result?.payload ? JSON.stringify(result.payload, null, 2) : ''}`);
    }
}

async function getAnswer(answer: string) {
    if (answer === 'exit' && !!subscription) {
        console.log('Bye bye');
        subscription.unsubscribe();
        return;
    }

    const result = await validateCommand(answer);
    proccessAnswer(result);
    makeTheQuestion();
}

function makeTheQuestion () {
    prompts({
        type: 'text',
        name: 'command',
        message: 'Introduce the command'
    })
    .then((response: { command: string }) => answerEvent.next(response.command));
}

makeTheQuestion();