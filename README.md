# Textures not loading

This is a branch designed to test #6.

The browser should auto-refresh until the desired texture is "brick"-ed.

To configure which texture should be bricked run the following Javascript code using the [Console](https://developer.chrome.com/docs/devtools/console/) or the [`javascript:` URL Protocol](https://docstore.mik.ua/orelly/web/jscript/ch10_04.html).

```js
window.localStorage.setItem('bricked', '[texture here]')
```

Note: Replace `[texture here]` with the desired texture to be bricked. Example: `tile/dirt`
