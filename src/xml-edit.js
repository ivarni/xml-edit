import sax from 'sax';
import { createReadStream } from 'fs';
import { writable } from 'is-stream';

const _write = (opts, filePath, definition, stream) => {
    if (!filePath) {
        throw new Error('Please provide a filePath');
    }
    if (!definition) {
        throw new Error('Please provide a definition object');
    }
    if (!stream) {
        throw new Error('Please provide a stream');
    }
    if (!writable(stream)) {
        throw new Error('Please provide a writable stream');
    }

    const print = (chars) => {
        stream.write(chars);
    };

    const indent = (level, indentation) => {
        print('\n');
        for (let i = 0, l = level * indentation; i < l; i++) {
            print(' ');
        }
    };

    return new Promise((resolve, reject) => {
        const saxStream = sax.createStream(
            (opts.strict !== false),
            { trim: true },
        );
        const indentation = opts.indentation || 2;
        const breadcrumbs = [];
        let current = {};
        let level = 0;

        saxStream.on('error', e => reject(e));

        saxStream.on('opentag', (el) => {
            current[el.name] = {};
            breadcrumbs.push(current);
            current = current[el.name];

            indent(level, indentation);
            level += 1;

            print(`<${el.name}`);
            Object.keys(el.attributes).forEach((key) => {
                print(` ${key}="${el.attributes[key]}"`);
            });
            print('>');
        });

        saxStream.on('closetag', (name) => {
            current = breadcrumbs.pop();
            level -= 1;
            indent(level, indentation);
            print(`</${name}>`);
        });

        saxStream.on('text', (text) => {
            indent(level, indentation);
            const content = breadcrumbs.reduce(
                (curr, next) => curr[Object.keys(next)[0]] || curr,
                definition,
            );
            print(content || text);
        });

        saxStream.on('end', () => {
            print('\n');
            resolve();
        });

        createReadStream(filePath).pipe(saxStream);
    });
};

const _read = (opts, filePath) =>
    new Promise((resolve, reject) => {
        if (!filePath) {
            throw new Error('Please provide a filePath');
        }

        const saxStream = sax.createStream(
            (opts.strict !== false),
            { trim: true },
        );

        const result = {};
        const breadcrumbs = [];
        let current = result;

        saxStream.on('error', e => reject(e));

        saxStream.on('opentag', (el) => {
            current[el.name] = {};
            breadcrumbs.push(current);
            current = current[el.name];
        });

        saxStream.on('closetag', () => {
            current = breadcrumbs.pop();
        });

        saxStream.on('text', (text) => {
            const tag = breadcrumbs[breadcrumbs.length - 1];
            tag[Object.keys(tag)[0]] = text;
        });

        saxStream.on('end', () => {
            resolve(result);
        });

        createReadStream(filePath).pipe(saxStream);
    });

export const getInstance = (opts = {}) => ({
    read: filePath => _read(opts, filePath),
    write: (filePath, definition, stream) => _write(opts, filePath, definition, stream),
});
