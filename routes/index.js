//----------------------------------------------------------------------------------------
// Main page

let fs        = require('fs'),
	mkdirp    = require('mkdirp'),
    Jimp      = require('jimp'),
    zipFolder = require('zip-folder'),
    rimraf	  = require('rimraf');

const rcs = require('rename-css-selectors');

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');


const sharp = require('sharp');
const ExifTransformer = require('exif-be-gone');

const toStream = require('buffer-to-stream');


async function upload(files){
	console.log("Upload started")
	let time     = new Date(),
	    dirTime  = time.getTime(),
	    dirStr   =  Math.random()
	    				.toString(36)
	    				.slice(2, 2 + Math.max(1, Math.min(15, 25)) ),
	    finalDir = `${dirTime}${dirStr}`;



	let pageFile = files.page;
	let assetsFiles = files.assets;
	await mkdirp(`${__dirname}/../assets`, async (err) => { 
		if ( err ) console.log(`Trying to create dir after save, but dir already exist!`)
			await pageFile.mv(`${__dirname}/../input/${pageFile.name}`, function(err) {
		    if (err){
		    	console.log(err);
		    	return false;
		    }
		        
		});

		await assetsFiles.forEach(function(item, i, arr) {
			item.mv(`${__dirname}/../input/assets/${item.name}`, function(err) {
				if (err){
			    	console.log(err);
			    	return false;
			    }
			})
		});
	});

	return true;
}


async function uniq(){
	console.log("Uniq started")
	let options = {
		overwrite: false,
	    cwd: process.cwd(),
	    newPath: "output"
	}

	let cfg = {
	    assetsFolder: process.env.assetsFolder || "assets"
	}


	await rcs.process.auto([`./input/assets/*.js`, `./input/*.html`, `./input/assets/*.css`], options, (err) => {
	    if ( err ) console.log(err)
	    	rcs.generateMapping(`./output/input/`, { overwrite: true }, (err) => {
	    });
	});

	await fs.readdirSync(`./input/${cfg.assetsFolder}`).forEach(async file => {
	    let type = file.substr(file.indexOf(".") + 1);
	    if (type == 'png' || type == "jpg"){

	    	await sharp(`./input/${cfg.assetsFolder}/${file}`)
			  .blur(0.3)
			  .toFile(`./output/input/${cfg.assetsFolder}/${file}`, (err, info) => { 
			  	if(err){
			  		console.log(err);
			 	 } 
			 	else {
			 		if ( type == 'jpg' ){
			 			const reader = fs.readFileSync(`./output/input/${cfg.assetsFolder}/${file}`)
						const writer = fs.createWriteStream(`./output/input/${cfg.assetsFolder}/${file}`)

						toStream(reader).pipe(new ExifTransformer()).pipe(writer)
			 		}
			 	}
			});



	        /*await Jimp.read(`./input/${cfg.assetsFolder}/${file}`, async (err, image) => {
	            if (err) console.log(err);
	            if ( image != undefined ){
	            	await image
	               		.blur( 1 )
	               		.write(`./output/input/${cfg.assetsFolder}/${file}`);
	            }
	            else console.log("image is undefined")
	        });*/
	    }
	    else if ( type != "css" && type != "js"){
	        await fs.mkdir(`./output/input/${cfg.assetsFolder}`,async err => { 
	            await fs.rename(`./input/${cfg.assetsFolder}/${file}`, `./output/input/${cfg.assetsFolder}/${file}`); 
	        })
	    }
	})

}



module.exports = (app) => {
	app.get('/', async (req, res) => {
		res.render('index');
			
	})

	app.post('/', async (req, res) => {
		await upload(req.files);


		setTimeout(async function(){
			await uniq();
			setTimeout(async function(){
				const files = await imagemin(['./output/input/assets/*.{jpg,png}'], './output/input/assets', {
			        plugins: [
			            imageminJpegtran(),
			            imageminPngquant({quality: '65-80'})
			        ]
			    });

				zipFolder('./output/input', './output/archive.zip', async function(err) {
				    if(err) {
				        console.log('zipped error', err);
				    } else {
				    	res.download('./output/archive.zip');
				        await console.log('zipped success');
				        await rimraf('./input', function(err){
				        	if ( err ) console.log(err)
				        		 mkdirp('./input', function(err){
						        	if ( err ) console.log(err)
						        		 mkdirp('./input/assets', function(err){
								        	if ( err ) console.log(err)
								        });
						        });
				        });
				        await rimraf('./output', function(err){
				        	if ( err ) console.log(err)
				        		mkdirp('./output', async function(err){
						        	if ( err ) console.log(err)
						        		mkdirp('./output/input', function(err){
								        	if ( err ) console.log(err)
								        		mkdirp('./output/input/assets', function(err){
										        	if ( err ) console.log(err)
										        });
								        });
						        });
				        });
				       
				       
				       
				       
				     
				    }
				});
				
			}, 30000);
		}, 15000);
		
			//await zipped();
	})
	
}