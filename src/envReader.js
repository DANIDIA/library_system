import { readFileSync } from 'fs';

export function readEnvLine(parameter){
    const text = readFileSync('.env').toString();
    const pair = text.split('\n').find(str => str.startsWith(parameter));
    return pair.slice(pair.indexOf('=') + 1, pair.length);
}

export function readEnvAsObject(){
    const text = readFileSync('.env').toString();
    const result= {};
    text.split('\n').forEach(line => {
       const splitIndex = line.indexOf('=');
       const parameter = line.slice(0, splitIndex);

       result[parameter] = line.slice(splitIndex + 1).trimEnd();
    });

    return result
}