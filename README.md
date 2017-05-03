# travis-tools

## [DEPRECATED]

*The package is not maintained anymore!*

Easy secure data encryption for travis - without the gems!

## installation

	npm install -g travis-tools

## build status

[![Build Status](https://travis-ci.org/eventEmitter/travis-tools.png?branch=master)](https://travis-ci.org/eventEmitter/travis-tools)


## usage

You have to create a «travis.js» file in your project root directory. That file should contain the data you like to encrypt. In your project you may use the «ee-travis» library to load the secure data either from the travis.js file or the env variables set by travis.

**Don't forget to add this file to your .gitignore!**
	
	module.exports = {
		  DB_HOST: 'mysecureHost.tld'
		, DB_PASS: 'bestPasswordEver'
		, DB_PORT: 1337
	};

In your project you can load the variables using the following code

	var travis = require('ee-travis');

	var mySecurePasswordString = travis.get('DB_HOST');
	// mysecureHost -> either loaded from the travis.js or the env variable


# encrypting

execute all commands in your project root or sepcify which repo to use using the --repository=githubUserName/repositoryName cmd switch

### travis

	travis-tools encrypt

optional flags:
- *--save* results to .travis.yml file
- *--repository*=githubUserName/repositoryName ( must be provided when executed not inside a folger with a git repository )

### travis pro

	travis-tools encrypt --pro

optional flags:
- *--username*=githubUserName
- *--password*=githubPassword
- *--save* results to .travis.yml file
- *--repository*=githubUserName/repositoryName ( must be provided when executed not inside a folger with a git repository )


## VERSION HISTORY

- 0.1.0: intial release
- 0.1.1: fixed bugs in path resolution
- 0.1.2: bugfix release
- 0.1.2: fixed docs