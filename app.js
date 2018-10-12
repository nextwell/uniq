let fs   = require('fs'),
    Jimp = require('jimp');

const rcs = require('rename-css-selectors');

let options = {
	overwrite: false,
    cwd: process.cwd(),
    newPath: "output"
}

let cfg = {
    assetsFolder: process.env.assetsFolder || "assets"
}


rcs.process.auto([`./input/**/*.js`, `./input/*.html`, `./input/**/*.css`], options, (err) => {
    
    rcs.generateMapping('./output/input/', { overwrite: true }, (err) => {
        // the mapping file is now saved
    });
});

fs.readdirSync(`./input/${cfg.assetsFolder}`).forEach(file => {
    let type = file.substr(file.indexOf(".") + 1);
    if (type == 'png' || type == "jpg"){
        Jimp.read(`./input/${cfg.assetsFolder}/${file}`, (err, image) => {
            if (err) throw err;
            image
               .blur( 1 )
               .write(`./output/input/${cfg.assetsFolder}/${file}`); // save
        });
    }
    else if ( type != "css" && type != "js"){
        fs.mkdir(`./output/input/${cfg.assetsFolder}`, err => { 
            fs.rename(`./input/${cfg.assetsFolder}/${file}`, `./output/input/${cfg.assetsFolder}/${file}`); 
        })
    }
})
