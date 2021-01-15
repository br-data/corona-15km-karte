#!/usr/bin/env node

"use strict"

const fs = require('fs');
const babelMinify = require('babel-minify');
const UglifyCSS = require('uglifycss');
const {resolve} = require('path');
const zopfli = require('node-zopfli');

const folderSrc = resolve(__dirname, '../docs');
const folderPub = resolve(__dirname, '../publish');

fs.rmdirSync(folderPub, {recursive:true});
fs.mkdirSync(folderPub, {recursive:true});

// welcome to my really dirty build script

let style = [];
let script = [];



// parse index.html, remove comments, find every script and stylesheet-links and replace them

console.log('parse HTML');
let html = fs.readFileSync(resolve(folderSrc,'index.html'), 'utf8');

html = html.replace(/<!--.*?-->/g,'')

html = html.replace(/<script.*?<\/script>/g, part => {
	if (!part.includes('src="')) return part;
	script.push(fs.readFileSync(resolve(folderSrc, part.match(/src="(.*?)"/)[1]), 'utf8'));
	return (script.length > 1) ? '' : '<script type="text/javascript" src="script.js"></script>';
})

html = html.replace(/<link.*?>/g, part => {
	style.push(fs.readFileSync(resolve(folderSrc, part.match(/href="(.*?)"/)[1]), 'utf8'));
	return (style.length > 1) ? '' : '<link rel="stylesheet" type="text/css" href="style.css">';
})

html = html.replace(/\s+/g, ' ');

console.log('write HTML');
fs.writeFileSync(resolve(folderPub, 'index.html'), html, 'utf8');



// merge every found css into one file and minify it

console.log('write CSS');
style = UglifyCSS.processString(style.join('\n'));
fs.writeFileSync(resolve(folderPub, 'style.css'), style, 'utf8');



// merge every found javascript into one file and minify it

console.log('write JavaScript');
script = script.join('\n');
script = babelMinify(script).code;
fs.writeFileSync(resolve(folderPub, 'script.js'), script, 'utf8');



// copy topojson

fs.copyFileSync(resolve(folderSrc, 'region.topo.json'), resolve(folderPub, 'region.topo.json'));



// zopfli compress everything

'index.html,script.js,style.css,region.topo.json'.split(',').forEach(f => {
	console.log('compress '+f);
	let buf = fs.readFileSync(resolve(folderPub, f));
	buf = zopfli.gzipSync(buf, {});
	fs.writeFileSync(resolve(folderPub, f+'.gz'), buf);
})



console.log('finished')
