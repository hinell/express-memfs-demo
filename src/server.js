var WebpackJsAssets = require("./WebpackAssets")
var webpackDM       = require("webpack-dev-middleware")
var webpackCfg      = require("../webpack.dev")
var webpack         = require("webpack")
var express         = require("express")
var path            = require("path")
var hdd             = require("fs")    // Hard drive
var mmfs            = require("memfs") // Memory drive

var volume          = new mmfs.Volume()
var mdd             = mmfs.createFsFromVolume(volume)
    mdd.join        = path.join // This is critical for webpack use
var app             = express()

    // Configuring server setup
var isDevServer = process.env.NODE_ENV !== "production"
var fs          = isDevServer ? mdd : hdd;

    // public/index.html
var hello       = '<h1>Hello world!</h1>'
var indexFile   = "index.html";
var publicDir   = "public/";
var publicPath  = path.join( __dirname, publicDir);
var indexPath   = path.join( publicPath, indexFile );

    // Reading file into temporary variable
var index       = hdd.readFileSync(indexPath, { encoding: "utf8" })
    index       = index.replace("{{data}}", hello);

    // Writing into memory drive
    mdd.mkdirSync(publicPath, { recursive: true });
    mdd.writeFileSync(indexPath, index)
    console.dir(volume.toJSON()) // Debug


    // Use webpack middleware (this part is merely for demonstration)
    app.use(webpackDM(webpack(webpackCfg), {
        // Make sure webpack middleware is configured properly
        publicPath: webpackCfg.output.publicPath,
        serverSideRender: true,
        fs: fs
    }))

    // Just feel the difference by following the `localhost/(h|m)dd/public` links.
    // `/public` folder is already served by webpack-dev-middleware so we don't need it
    // app.use("/public", express.static(publicPath, { fs: fs } ))
    app.use("/mdd/public", express.static(publicPath, { fs: mdd } ))
    app.use("/hdd/public", express.static(publicPath, { fs: hdd } ))
    app.get("/", function (req, res) {
        // The api is experimental
        var assets = res.locals.webpackStats.compilation.assets;
        // Insert <script>s
        var wjsa = new WebpackJsAssets("{{scripts}}", assets, { pathPrefix: webpackCfg.output.publicPath})
        fs.createReadStream(indexPath)
            .pipe(wjsa)
            .pipe(res)
    })

    app.listen(80, () => console.log("Server is running..."))
