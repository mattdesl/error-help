# error-help

A standalone JavaScript file ([error-help.js](./error-help.js)) that you can add to your HTML to improve the error/debugging experience when developing HTML/JS projects, without having to open your DevTools console.

This is particularly targeted towards new JavaScript coders and making it a bit easier to get started with the language.

![error](./images/error.png)

Features:

- On error, logs the file, line number, column, and error message
- Also fetches the file to show the code that is causing the error
- Can optionally deduplicate console spam, in order to clean it up a bit (usueful for animation-based projects that may log errors at 60FPS)

Gotchas:

- Best used for static workflows (i.e. no Webpack/Parcel/etc bundlers)
- You may want to disable this for production

## Usage with CDN

Include like so in your project, in the HEAD before all other script tags:

```html
  ...
  <head>
    <script
      src="https://cdn.jsdelivr.net/npm/error-help@1.0.2/error-help.js" 
      dedupe-logs></script>
  </head>
  ...
```

## Usage without CDN

You can download [error-help.js](./error-help.js), add it to your folder, and locally reference it like so:

```html
  ...
  <head>
    <script src="./error-help.js" dedupe-logs></script>
  </head>
  ...
```

## Log Spam Deduplication

If you pass `dedupe-logs` attribute to the script tag, it will deduplicate console logs that repeat 10 or more times within 1.5 second intervals. This is helpful when working on CodeSandbox in an animated sketch, to avoid 60FPS console logs slowing down the browser experience.

You can disable this feature by simply removing this attribute from the script tag:

```html
  <script src="./error-help.js"></script>
```

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/error-help/blob/master/LICENSE.md) for details.
