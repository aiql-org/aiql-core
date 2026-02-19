import Playground from './Playground';
import { version } from '../package.json';
import * as examples from '@aiql-org/examples';

console.log('AIQL Playground module executing...');
console.log('Playground component exported:', Playground);

const exampleCount = Object.keys(examples).length;

export { Playground, version, examples, exampleCount };
