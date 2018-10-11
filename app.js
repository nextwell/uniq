let fs   = require('fs'),
    Jimp = require('jimp');

const rcs = require('rename-css-selectors');

let options = {
	overwrite: false,
    cwd: process.cwd(),
    newPath: "output"
}


rcs.process.auto(['./input/*.js', './input/*.html', './input/*.css'], options, (err) => {
    
    rcs.generateMapping('./', { overwrite: true }, (err) => {
        // the mapping file is now saved
    });
});

fs.readdirSync('./input/images').forEach(file => {
  console.log(file);
  Jimp.read(`./input/images/${file}`, (err, image) => {
	  if (err) throw err;
	  image
	    .blur( 1 )
	    .write(`./output/images/${file}`); // save
	});
})
