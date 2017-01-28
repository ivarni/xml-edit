import { resolve } from 'path';
import { ReadableStream, WritableStream } from 'memory-streams';

import { getInstance } from '../src/xml-edit';

describe('xml-edit', () => {
    const fixtures = resolve('test', 'fixtures');
    const simpleXmlPath = resolve(fixtures, 'plain.xml');
    const brokenXmlPath = resolve(fixtures, 'broken.xml');
    const attributeXmlPath = resolve(fixtures, 'attribute.xml');

    describe('plain xml with default opts', () => {
        const editor = getInstance();

        it('parses a plain simple XML', async () => {
            const xmlObject = await editor.read(simpleXmlPath);
            expect(xmlObject.foo).to.be('bar');
        });

        it('writes the modified XML', async () => {
            const stream = new WritableStream();
            const xmlObject = await editor.read(simpleXmlPath);
            xmlObject.foo = 'baz';
            await editor.write(simpleXmlPath, xmlObject, stream);

            expect(stream.toString()).to.eql('\n<foo>\n  baz\n</foo>\n');
        });
    });

    describe('plain xml with custom indentation', () => {
        const editor = getInstance({ indentation: 1 });

        it('uses the custom indentation in the result', async () => {
            const stream = new WritableStream();
            const xmlObject = await editor.read(simpleXmlPath);
            xmlObject.foo = 'baz';
            await editor.write(simpleXmlPath, xmlObject, stream);

            expect(stream.toString()).to.eql('\n<foo>\n baz\n</foo>\n');
        });
    });

    describe('in strict mode', () => {
        const editor = getInstance({ strict: true });

        it('throws error for invalid entity &blah;', async () => {
            try {
                await editor.read(brokenXmlPath);
                expect().fail('Did not throw error');
            } catch (e) {
                expect(e.toString()).to.contain('Invalid character');
            }
        });
    });

    describe('without strict mode', () => {
        const editor = getInstance({ strict: false });

        it('does not throw error for invalid entity &blah;', async () => {
            try {
                await editor.read(brokenXmlPath);
            } catch (e) {
                expect().fail('Should not throw error');
            }
        });
    });

    describe('XML with attributes', () => {
        const editor = getInstance();

        it('preserves attributes', async () => {
            const stream = new WritableStream();
            const xmlObject = await editor.read(attributeXmlPath);
            await editor.write(attributeXmlPath, xmlObject, stream);

            expect(stream.toString()).to.contain('<foo attr="bar" foo="baz"');
        });
    });

    describe('error handling', () => {
        const editor = getInstance();

        describe('read', () => {
            it('throws error if no filePath is provided', async () => {
                try {
                    await editor.read();
                    expect().fail('Did not throw an error');
                } catch (e) {
                    expect(e.toString()).to.contain('Please provide a filePath');
                }
            });
        });

        describe('write', () => {
            it('throws an error if no filePath is provided', async () => {
                try {
                    await editor.write();
                    expect().fail('Did not throw an error');
                } catch (e) {
                    expect(e.toString()).to.contain('Please provide a filePath');
                }
            });

            it('throws an error if no defintion is provided', async () => {
                try {
                    await editor.write(simpleXmlPath);
                    expect().fail('Did not throw an error');
                } catch (e) {
                    expect(e.toString()).to.contain('Please provide a definition object');
                }
            });

            it('throws an error if no stream is provided', async () => {
                try {
                    await editor.write(simpleXmlPath, {});
                    expect().fail('Did not throw an error');
                } catch (e) {
                    expect(e.toString()).to.contain('Please provide a stream');
                }
            });

            it('throws an error if stream is not a writable stream', async () => {
                try {
                    const stream = new ReadableStream();
                    await editor.write(simpleXmlPath, {}, stream);
                    expect().fail('Did not throw an error');
                } catch (e) {
                    expect(e.toString()).to.contain('Please provide a writable stream');
                }
            });
        });
    });
});
