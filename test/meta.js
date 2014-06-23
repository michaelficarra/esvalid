/* global suite test */
"use strict";
var assert = require("assert");
var fs = require("fs");

var esprima = require("esprima");
var esvalidate = require("..");

function validate(done) {
  return function(err, programText) {
    if (err) throw err;
    var program = esprima.parse(programText);
    assert.ok(esvalidate.isValid(program));
    done();
  };
}

suite("meta", function(){

  test("esvalidate itself is valid", function(done) {
    fs.readFile(require.resolve(".."), validate(done));
  });

  test("esprima is valid", function(done) {
    fs.readFile(require.resolve("esprima"), validate(done));
  });

  test("esutils is valid", function(done) {
    fs.readFile(require.resolve("esutils"), validate(done));
  });

  test("eslint is valid", function(done) {
    fs.readFile(require.resolve("eslint/lib/eslint"), validate(done));
  });

  test("mocha is valid", function(done) {
    fs.readFile(require.resolve("mocha/lib/mocha"), validate(done));
  });

});
