
	
	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, assert 		= require('assert')
		, project 		= require('ee-project')
		, path 			= require('path')
		, spawn			= require('child_process').spawn
		, fs 			= require('fs');





	describe('The Travis-Tools', function(){
		it('Should be able to encrypt data for a public repository', function(done){
			this.timeout(10000);

			var child = spawn(path.join(project.root,'index.js'), ['encrypt', '--repository=eventEmitter/ee-travis'])
				, result = ''
				, errData = '';

			child.stdout.on('data', function(data){
				result += data;
			}.bind(this));

			child.stderr.on('data', function(data){
				errData += data;
			}.bind(this));

			
			child.on('exit', function(code){
				if (code === 0 && result.length > 200 && !errData) done();
				else throw new Error('Failed to execute: '+errData);
			})

			child.on('error', function(err){
				throw err;
			});
		});
	});
	