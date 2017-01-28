[![Build Status](https://travis-ci.org/ivarni/xml-edit.svg?branch=master)](https://travis-ci.org/ivarni/xml-edit)
[![Coverage Status](https://coveralls.io/repos/github/ivarni/xml-edit/badge.svg?branch=master)](https://coveralls.io/github/ivarni/xml-edit?branch=master)

# xml-edit

## wat

Parse an XML file to JSON object, modify text nodes and write it to a stream

## why

I found myself needing to update text nodes in a maven pom from a node project

## how

Given a file that looks like this
```
<this>
    <is>
        <another>
            XML file
        </another>
    </is>
</this>
```

```javascript
const path = require('path');
const xmlEdit = require('xml-edit');

const editor = xmlEdit.getInstance({
    indentation: 2,
    strict: true,
});

const xmlObject = await editor.read(path.resolve('test.xml'));
/*
    {
      "this": {
        "is": {
          "another": "XML file"
        }
      }
    }
*/
xmlObject.this.is.another = 'ohai';
await editor.write(path.resolve('test.xml'), xmlObject, process.stdout);
```

## but...?

### getInstance(opts)

_opts.indentation_: number of spaces to use when writing
(default: `2`)

_opts.strict_: parse XML strictly or not
(default: `true`)

### instance.read(filePath)

_filePath_: Path to the file (doh)

### instance.write(filePath, xmlObject, stream)

_filePath_: Path to the original file

_xmlObject_: Specification of which text nodes to change

_stream_: A writeable stream that the result gets sent to

## ok, so...?

* Original indentation in the file is not respected
* You can't edit attributes, in fact they don't even get returned by `read`
* You can't edit tagnames
* Your attributes *will* be inlined in the tag in the result

This has not been tested very thoroughly so there are probably bugs. Let me know and I'll look at it.

For now consider this a beta at best.

## This module sucks

Don't use it then :)

Or file a bug and/or open a PR.
