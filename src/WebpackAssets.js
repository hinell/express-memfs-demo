/*
Created by hinell@github.com (al.neodim@gmail.com)

Description:
This stream dynamically injects js assets at specified placeholder
Example of placeholoder:
  index.html:
      ...
      <head>
      {{scripts}}
      </head>
  server.js
      new WebpackJsAssets(
          "{{scripts}}",
          {"bundle.js": ... },
          { pathPrefix: "public" )
          .pipe(httpRespondObject)
Where {{scripts}} gets converted to
  index.html:
      ...
      <head>
      <script src="public/bundle.js">
      </head>
*/
var { Transform }   = require('stream');

class WebpackJsAssets extends Transform {
    /**
     *
     * @param {string} placeholder
     * @param {string[]} assets, see https://github.com/webpack/docs/wiki/node.js-api#stats
     * @param {object}  options
     */
    constructor(placeholder, assets, { pathPrefix }) {
        super()
        this.placeholder = new RegExp(placeholder.replace(/(\{|\})/g, "\\$1",));
        this.data = Object.getOwnPropertyNames(assets)
            .filter((n)=> /.js$/.test(n))
            .map(file => `<script src="${pathPrefix}/${file}"></script>`)
            .join('\n');
        this.done   = false;
    }
    _transform(chunk, encoding, callback) {
        if (this.done) { return callback(null, chunk) }
        var string = Buffer.from(chunk).toString();
        debugger
        if (this.placeholder.test(string)) {
            string = string.replace(this.placeholder, this.data)
            debugger
            callback(null, Buffer.from(string))
        }
    }

}
module.exports =  WebpackJsAssets
