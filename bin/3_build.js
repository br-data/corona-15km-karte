#!/usr/bin/env node

"use strict"

const fs = require('fs');
const babelMinify = require('babel-minify');
const UglifyCSS = require('uglifycss');
const {resolve} = require('path');
const zopfli = require('node-zopfli');

const folderSrc = resolve(__dirname, '../docs');
const folderPub = resolve(__dirname, '../publish');

fs.mkdirSync(folderPub, {recursive:true});

let style = [];
let script = [];

console.log('parse HTML');
let html = fs.readFileSync(resolve(folderSrc,'index.html'), 'utf8');

html = html.replace(/<!--.*?-->/g,'')

html = html.replace(/<script.*?<\/script>/g, match => {
	script.push(fs.readFileSync(resolve(folderSrc, match.match(/src="(.*?)"/)[1]), 'utf8'));
	return (script.length > 1) ? '' : '<script type="text/javascript" src="script.js"></script>';
})

html = html.replace(/<link.*?>/g, match => {
	style.push(fs.readFileSync(resolve(folderSrc, match.match(/href="(.*?)"/)[1]), 'utf8'));
	return (style.length > 1) ? '' : '<link rel="stylesheet" type="text/css" href="style.css">';
})

html = html.replace(/\s+/g, ' ');

console.log('write HTML');
fs.writeFileSync(resolve(folderPub, 'index.html'), html, 'utf8');

console.log('write CSS');
style = UglifyCSS.processString(style.join('\n'));
fs.writeFileSync(resolve(folderPub, 'style.css'), style, 'utf8');

console.log('write JavaScript');
script = babelMinify(script.join('\n')).code;
fs.writeFileSync(resolve(folderPub, 'script.js'), script, 'utf8');

fs.copyFileSync(resolve(folderSrc, 'bayern.topo.json'), resolve(folderPub, 'bayern.topo.json'));

fs.readFileSync(resolve(__dirname, 'files.txt'), 'utf8').split('\n').forEach(f => {
	console.log('compress '+f);
	let buf = fs.readFileSync(resolve(folderPub, f));
	buf = zopfli.gzipSync(buf, {});
	fs.writeFileSync(resolve(folderPub, f+'.gz'), buf);
})

console.log('finished')
