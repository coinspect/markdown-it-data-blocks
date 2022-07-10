
# markdown-it-data-blocks

> Markdown-it plugin for creating block-level containers and with metadata.

## Description

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

### Options

Show options:

```javascript
import {parseOptions} from 'markdown-it-data-blocks'

const options = parseOptions({})
console.log(options)

```
