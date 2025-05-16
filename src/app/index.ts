import prompts from 'prompts';
import { Subject } from 'rxjs';



const answerEvent = new Subject<string>();
const answerObs = answerEvent.asObservable();

const subscription = answerObs.subscribe(getAnswer);

function getAnswer(answer: string) {
    if (answer === 'exit' && !!subscription) {
        console.log('Bye bye');
        subscription.unsubscribe();
        return;
    }

    console.log('NNN answer: ', answer);
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