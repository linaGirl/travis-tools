!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, project 		= require('ee-project')
		, Repl 			= require('ee-simple-repl')
		, Travis 		= require('ee-travis')
		, async 		= require('ee-async')
		, argv 			= require('ee-argv')
		, yaml 			= require('js-yaml')
		, fs 			= require('fs');



	module.exports = new Class({

		/**
		 * the class constructor
		 *
		 * @param <Object> options
		 */
		init: function(options) {
			if (argv.has('repository') || argv.has('r')){
				this.repository = argv.get('repository') || argv.get('r');
				this.createTravis(this.encrypt.bind(this));
			}
			else {
				this._getRepositoryName(function(err){
					if (err) throw err;
					else this.createTravis(this.encrypt.bind(this));
				}.bind(this));
			}
		}


		/**
		 * the _collectCrerdentials() method collects crednetials from 
		 * the user, if required.
		 *
		 * @param <Function> callback
		 */
		, _collectCrerdentials: function(callback) {
			var   password = argv.get('password')
				, username = argv.get('username')
				, r;

			if (argv.has('pro')) {
				// as the user for the credentials
				if (!username){
					r = new Repl().ask('Travis-CI Pro: please enter your GitHub username:', function(answer){
						r.success('thanks!\n');
						username = answer.trim();

						if(!password){
							r = new Repl().ask('Travis-CI Pro: please enter your GitHub password:', function(answer){
								r.success('thanks!\n');
								password = answer.trim();
								callback(null, username, password);								
							}.bind(this));
						}
						else callback(null, username, password);
					}.bind(this));
				}
				else callback(null, username, password);
			}
			else callback(null);
		}



		/**
		 * the createTravis() method instatiates the travis library
		 * with the correct paramters
		 *
		 * @param <Function> callback
		 */
		, createTravis: function(callback) {			
			this._collectCrerdentials(function(err, username, password){
				this.travis = new Travis({ 
					  repository: this.repository
					, username: username
					, password: password
				});

				this.travis.getMaxPayloadLength(function(err, maxLength){
					if (err) throw err;
					else {
						this.maxItemLength = maxLength;
						callback();
					}
				}.bind(this));
			}.bind(this));
		}



		/**
		 * the encrypt() method encrypts data
		 *
		 */
		, encrypt: function() {
			var   items = []
				, config;

			try {
				config = require(project.root+'travis.js');
			} catch(err) {
				throw new Error('Failed to load the «travis» file from «'+project.root+'travis.js»: '+err).setName('ParserException');
			}

			// encrypt all items
			async.each(Object.keys(config), 
				function(key, next){
					var item = key+'='+config[key];
					if (item.length > this.maxItemLength) throw new Error('the item is too long to be encrypted!').setName('OverflowException');
					next(null, item+'');
				}.bind(this), 

				function(item, next){
					this.travis.encrypt(item, function(err, secureData){
						if(err) throw err;
						items.push(secureData);
						next();
					}.bind(this));
				}.bind(this), 

				function(){
					if (argv.has('save') || argv.has('s')) this.addToTravisYml(items);
					else this.print(items);
				}.bind(this)
			);
		}




		/**
		 * the print() method prints the encrypted data to the screen
		 *
		 * @param <Array> list of encrypted items
		 */
		, print: function(items){
			console.log('you may add the following to your .travis.yml file ( or you may call this tool using the --save or --s option:');
			console.log('env:');
			console.log('    global:');
			items.forEach(function(line){
				console.log('        - secure: '+line);
			});
			process.exit();
		}





		/**
		 * the addToTravisYml() method stores the encrypted data in the .travis
		 *
		 * @param <Array> list of encrypted items
		 */
		, addToTravisYml: function(items){
			var path = project.root+'.travis.yml';

			fs.readFile(path, function(err, data){
				if (err) {
					console.log(('failed to add to «'+project.root+'.travis.yml» file: '+err).reg);
					this.print(items);
				}
				else {
					var doc = yaml.safeLoad(data.toString());
					if (!doc.env) doc.env = {};
					if (!doc.env.global) doc.env.global = [];
					doc.env.global = doc.env.global.concat(items.map(function(item){
						return {secure:item};
					}));
					fs.writeFile(path, yaml.safeDump(doc, {
						indent: 4
					}).replace(/\-[\n\s]+secure:/gi, '- secure:').replace(/\n(\S)/gi, '\n\n$1'), function(err){
						if (err) {
							console.log(('failed to add to «'+project.root+'.travis.yml» file: '+err).reg);
							this.print(items);
						}
						else {
							console.log('Secure data was added successfull to your .travis.yml file.'.green);
							process.exit();
						}
					}.bind(this));
				}
			}.bind(this));
		}


		/**
		 * the _getRepositoryName() method gets the repository name from
		 * the filesystem or the user
		 *
		 * @param <Function> callback
		 */
		, _getRepositoryName: function(callback) {
			if (this.repository) callback(null, this.repository);
			else {
				project.git.remoteRepository(function(err, repository){
					if (!err && repository) {
						this.repository = repository;
						callback( null, this.repository);
					}
					else {
						var r = new Repl()
							.warn('failed to get repository name from the git repository.\n')
							.ask('please enter the name of the repository you\'re encrypting data for\nyou may also start the tool using the --repository=repository option\nex. eventEmitter/travis-tools: ', function(answer){
								r.success('thanks!');
								this.repository = answer;						
								callback( null, this.repository);
						}.bind(this));
					}
				}.bind(this));
			}
		}
	});
}();
