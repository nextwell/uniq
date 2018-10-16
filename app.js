let fs         = require('fs'),
    Jimp       = require('jimp'),
    express    = require('express'),
    requireFu  = require('require-fu'),
    pug        = require('pug'),
    bodyParser = require('body-parser'),
    path       = require('path'),
    fileUpload = require('express-fileupload');

const rcs = require('rename-css-selectors');

let options = {
	overwrite: false,
    cwd: process.cwd(),
    newPath: "output"
}

let cfg = {
    assetsFolder: process.env.assetsFolder || "assets"
}


//rcs.process.auto([`./input/**/*.js`, `./input/*.html`, `./input/**/*.css`], options, (err) => {
    
   // rcs.generateMapping('./output/input/', { overwrite: true }, (err) => {
    //});
//});

/*fs.readdirSync(`./input/${cfg.assetsFolder}`).forEach(file => {
    let type = file.substr(file.indexOf(".") + 1);
    if (type == 'png' || type == "jpg"){
        Jimp.read(`./input/${cfg.assetsFolder}/${file}`, (err, image) => {
            if (err) throw err;
            image
               .blur( 1 )
               .write(`./output/input/${cfg.assetsFolder}/${file}`);
        });
    }
    else if ( type != "css" && type != "js"){
        fs.mkdir(`./output/input/${cfg.assetsFolder}`, err => { 
            fs.rename(`./input/${cfg.assetsFolder}/${file}`, `./output/input/${cfg.assetsFolder}/${file}`); 
        })
    }
})*/


//----------------------------------------------------------------------------------------
// Express Settings

const app = express();

app.set('view engine', 'pug');

app.use(fileUpload());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static(path.join(__dirname, "client")));


const port = 5000;

requireFu(__dirname + '/routes')(app);

app.listen(port, () => console.log(`Server started on port ${port}`));
