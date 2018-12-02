//----------------------------------------------------------------------------------------
// Main page

let fs        = require('fs'),
	mkdirp    = require('mkdirp'),
    Jimp      = require('jimp'),
    zipFolder = require('zip-folder'),
    rimraf	  = require('rimraf')
    fsc       = require("fs-cheerio");

const rcs = require('rename-css-selectors');

rcs.includeConfig();

const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');


const sharp = require('sharp');
const ExifTransformer = require('exif-be-gone');

const toStream = require('buffer-to-stream');

const replace = require('replace-in-file');

let imagesList = {
  files: ['./output/input/*.html', './output/input/assets/*.css', './output/input/assets/*.js'],
  from: [],
  to: [],
};




async function modifyHTML(sentencesArray, randomTextArray){
	let Code = await fsc.readFile('./output/input/index.html');

	//Code('div').append('<div class="dh">TEXT</div>');

	//console.log(Code('body').html())

	randomTextArray.forEach((item, i, array) => {
		randomTextArray[i] = `<span class="dh">${item}</span>`;
	})

	let iter = 0;

	// algorithm

	Code('div').each(function(i, div){
		let numDivs = Math.floor(Math.random() * 4) + 1;

		let textDivIndex = Math.floor(Math.random() * numDivs) + 1;
		for ( let i = 0; i < numDivs; i++ ){
			if ( numDivs == textDivIndex ){
				Code(div).append(`<div class="dh">${sentencesArray[iter]}</div>`);
				iter++;
				if ( !sentencesArray[iter] ){
					iter = 0;
				}
	
			}
			else {
				Code(div).append('<div class="dh"></div>');
			}
		}
		
	})

	// --------------------------------------------------------------------


	await fsc.writeFile('./output/input/index.html', Code);



	// HERE REPLACE TEXT ON TOKEN !!!WORK
	replaceTokenArray = ['ReplaceToken'];
	for ( let e = 0; e < 1000; e++ ){
		replaceTokenArray.push('ReplaceToken');
	}

	for ( let f = 0; f < 10; f++ ){
		randomTextArray = [...randomTextArray, ...randomTextArray];
	}

	let opt = {
	  files: ['./output/input/index.html'],
	  from: replaceTokenArray,
	  to: randomTextArray,
	};

	replace(opt);
}


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



	await rcs.process.auto([`./input/assets/*.js`, `./input/*.html`, `./input/assets/*.css`], options, async (err) => {
	    if ( err ) console.log(err)
	    	console.log(imagesList);
	    	await replace(imagesList);
	    	rcs.generateMapping(`./output/input/`, { overwrite: true }, (err) => {
	    });
	});

	await fs.readdirSync(`./input/${cfg.assetsFolder}`).forEach(async file => {
	    let type      = file.substr(file.indexOf(".") + 1),
	        instaName = file.split('.')[0];
	    
	    if (type == 'png' || type == "jpg"){	
	    	imagesList.from.push(file);
	   		imagesList.to.push(`${instaName}.${type}`);

	    	await sharp(`./input/${cfg.assetsFolder}/${file}`)
			  .blur(0.3)
			  .toFile(`./output/input/${cfg.assetsFolder}/${instaName}.${type}`, (err, info) => { 
			  	if(err){
			  		console.log(err);
			 	 } 
			 	else {
			 		if ( type == 'jpg' ){
			 			const reader = fs.readFileSync(`./output/input/${cfg.assetsFolder}/${instaName}.${type}`)
						const writer = fs.createWriteStream(`./output/input/${cfg.assetsFolder}/${instaName}.${type}`)

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

function randomise(){
	let time     = new Date(),
		dirTime  = time.getTime(),
		dirStr   =  Math.random()
			                .toString(36)
			    			.slice(2, 2 + Math.max(1, Math.min(15, 25)) )
		return `${dirTime + dirStr}`;
}


async function renamer(){
	let oldNames = [], newNames = [], FilesWithNames = ['./output/input/index.html'];
	await fs.readdirSync(`${__dirname}/../output/input/assets/`).forEach(async file => {
		    let type      = file.substr(file.indexOf(".") + 1),
		        instaName = file.split('.')[0];
		        if ( type == 'css' ){
		        	FilesWithNames.push(`./output/input/assets/${file}`);
		        }
		    	else if ( type == 'png' || type == 'jpg'){
		    		let oldName = file;
		    		let newName = `${randomise()}.${type}`;
		    		oldNames.push(oldName);

		    		newNames.push(newName);

		    		
		    		await fs.rename(`${__dirname}/../output/input/assets/${file}`, `${__dirname}/../output/input/assets/${newName}`, (err) => {
		    			if (err) console.log(err)
		    		}); 
		    	}
		    	else {
		    		await fs.rename(`${__dirname}/../output/input/assets/${file}`, `${__dirname}/../output/input/assets/${file}`, (err) => {
		    			if (err) console.log(err)
		    		}); 
		    	}

		})
	let opt = {
	  files: FilesWithNames,
	  from: oldNames,
	  to: newNames,
	};
	console.log(opt);
	let changes = await replace(opt);
	console.log(changes);
}




module.exports = (app) => {
	app.get('/', async (req, res) => {
		res.render('index');
			
	})

	app.post('/', async (req, res) => {
		await upload(req.files);

		let textFull = req.body.text;
		let sentences = textFull.split('.');
		let tokenText = req.body.tokenText;

		let tokenArray = tokenText.split('.');
		setTimeout(async () => {
			await uniq();
			setTimeout(async () => {
				await renamer();
				const files = await imagemin(['./output/input/assets/*.{jpg,png}'], './output/input/assets', {
			        plugins: [
			            imageminJpegtran(),
			            imageminPngquant({quality: '65-80'})
			        ]
			    });

			    await modifyHTML(sentences, tokenArray);


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