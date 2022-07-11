
# markdown-it-data-blocks

> Markdown-it plugin for creating block-level containers and with metadata.

## Description

This plugin combines the features of: [markdown-it-container](https://github.com/markdown-it/markdown-it-container) and [markdown-it-metadata-block](https://github.com/martinring/markdown-it-metadata-block)

It allows to insert metadata in blocks and wrap that blocks in a class.


## Example

markdown:

```markdown

--- my-block

title: Test block 
foo: foo
bar: bar

This is a test block

...

```

render:

```html
<div class="my-block">
  <h3>Test block</h3>
  <p>This is a test block</p>
</div>
```

metadata:

``` json
{
    "title": "Test block",
    "foo": "foo",
    "bar": "bar",
    "className": "my-block"
}

```

## Installation

```shell
nmp install markdown-it-data-blocks --save
```

## Usage

```shell
nmp install markdown-it --save
nmp install markdown-it-data-blocks --save
nmp install yaml --save
```

``` javascript

import * as  MarkdownIt from 'markdown-it'
import yaml from 'yaml'
import data_blocks from 'markdown-it-data-blocks'

const metadataParser = yaml.parser
const markdown = new MarkdownIt().use(data_blocks, { metadataParser })
```

### Options

Show options:

```javascript
import {parseOptions} from 'markdown-it-data-blocks'

const options = parseOptions({})
console.log(options)

```
