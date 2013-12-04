!function(){

	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, project 		= require('ee-project')
		, argv 			= require('ee-argv');


	var Encryptor = require('./Encryptor');


	module.exports = new Class({

		/**
		 * class constructor
		 *
		 * @param <Object> options
		 */
		init: function(options) {
			if (argv.has('encrypt')) new Encryptor();
			else {
				console.log('Usage:\n');
				console.log('travis-tools encrypt [--repository=eventEmitter/ee-class] [--add]');
				console.log('');
			}
		}
	});
}();
