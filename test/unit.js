/* global suite test */
"use strict";
var assert = require("assert");

var esvalid = require("..");

// wrap a statement in a program
function wrapProgram(n) { return {type: "Program", body: [n]}; }
// wrap a statement in a function expression
function wrapFunction(n) { return {type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: [n]}}; }
// wrap a statement in an iteration statement
function wrapIter(n) { return {type: "WhileStatement", test: {type: "Literal", value: true}, body: n}; }
// wrap a statement in a labeled iteration statement
function label(l, n) { return {type: "LabeledStatement", label: {type: "Identifier", name: l}, body: wrapIter(n)}; }

function validStmt(x, msg) { assert.ok(esvalid.isValid(wrapProgram(x)), msg); }
function invalidStmt(x, msg) { assert.ok(!esvalid.isValid(wrapProgram(x)), msg); }
function validExpr(x, msg) { assert.ok(esvalid.isValidExpression(x), msg); }
function invalidExpr(x, msg) { assert.ok(!esvalid.isValidExpression(x), msg); }

var STMT = {type: "EmptyStatement"};
var BLOCK = {type: "BlockStatement", body: []};
var EXPR = {type: "Literal", value: null};
var NUM = {type: "Literal", value: 0};
var STR = {type: "Literal", value: "a"};
var ID = {type: "Identifier", name: "a"};
var CATCH = {type: "CatchClause", param: ID, body: BLOCK};
var FD = {type: "FunctionDeclaration", id: ID, params: [], body: BLOCK};


suite("unit", function(){

  test("non-nodes", function() {
    function invalid(x, msg) {
      assert.ok(!esvalid.isValid(x), msg);
      invalidStmt(x, msg);
      invalidExpr(x, msg);
    }
    invalid(null);
    invalid(0);
    invalid({});
    invalid("Program");
    invalid({type: null});
    invalid({type: false});
    invalid({type: ""});
    invalid({type: "Node"});
  });

  test("Node", function() {
    invalidStmt({type: "EmptyStatement", loc: {}});
    invalidStmt({type: "EmptyStatement", loc: {start: null, end: 0}});
    invalidStmt({type: "EmptyStatement", loc: {start: {}, end: {}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: "a", column: "b"}, end: {line: "a", column: "b"}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 0, column: 0}, end: {line: 1, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 0, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: -1}, end: {line: 1, column: 0}}});
    invalidStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: -1}}});
    invalidStmt({type: "EmptyStatement", loc: {source: 0, start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: {start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: {source: "", start: {line: 1, column: 0}, end: {line: 1, column: 0}}});
    validStmt({type: "EmptyStatement", loc: null});
  });


  test("ArrayExpression", function() {
    validExpr({type: "ArrayExpression", elements: []});
    validExpr({type: "ArrayExpression", elements: [null]});
    validExpr({type: "ArrayExpression", elements: [EXPR]});
    validExpr({type: "ArrayExpression", elements: [EXPR, EXPR]});
    validExpr({type: "ArrayExpression", elements: [EXPR, null, EXPR]});
    invalidExpr({type: "ArrayExpression"});
    invalidExpr({type: "ArrayExpression", elements: [STMT]});
  });

  test("AssignmentExpression", function() {
    validExpr({type: "AssignmentExpression", operator: "=", left: EXPR, right: EXPR});
    validExpr({type: "AssignmentExpression", operator: "+=", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "||=", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression"});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "=", left: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "=", right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "AssignmentExpression", operator: "="});
    invalidExpr({type: "AssignmentExpression", left: EXPR});
    invalidExpr({type: "AssignmentExpression", right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: STMT, right: EXPR});
    invalidExpr({type: "AssignmentExpression", left: EXPR, right: STMT});
  });

  test("BinaryExpression", function() {
    validExpr({type: "BinaryExpression", operator: "+", left: EXPR, right: EXPR});
    validExpr({type: "BinaryExpression", operator: "&", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "||", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression"});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+", left: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+", right: EXPR});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "BinaryExpression", operator: "+"});
    invalidExpr({type: "BinaryExpression", left: EXPR});
    invalidExpr({type: "BinaryExpression", right: EXPR});
    invalidExpr({type: "BinaryExpression", left: STMT, right: EXPR});
    invalidExpr({type: "BinaryExpression", left: EXPR, right: STMT});
  });

  test("Blocktatement", function() {
    validStmt({type: "BlockStatement", body: []});
    validStmt({type: "BlockStatement", body: [STMT]});
    validStmt({type: "BlockStatement", body: [STMT, STMT]});
    invalidStmt({type: "BlockStatement"});
    invalidStmt({type: "BlockStatement", body: null});
    invalidStmt({type: "BlockStatement", body: [EXPR]});
    invalidStmt({type: "BlockStatement", body: [FD]});
  });

  test("BreakStatement", function() {
    validStmt(wrapIter({type: "BreakStatement"}));
    validStmt(wrapIter({type: "BreakStatement", label: null}));
    validStmt(label(ID.name, {type: "BreakStatement", label: ID}));
    invalidStmt(label(ID.name + ID.name, {type: "BreakStatement", label: ID}));
  });

  test("ContinueStatement", function() {
    validStmt(wrapIter({type: "ContinueStatement"}));
    validStmt(wrapIter({type: "ContinueStatement", label: null}));
    validStmt(label(ID.name, {type: "ContinueStatement", label: ID}));
    invalidStmt(label(ID.name + ID.name, {type: "ContinueStatement", label: ID}));
  });

  test("DebuggerStatement", function() {
    validStmt({type: "DebuggerStatement"});
  });

  test("ExpressionStatement", function() {
    validStmt({type: "ExpressionStatement", expression: EXPR});
    invalidStmt({type: "ExpressionStatement"});
    invalidStmt({type: "ExpressionStatement", expression: STMT});
    invalidStmt({type: "ExpressionStatement", expression: FD});
  });

  test("FunctionDeclaration", function() {
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [ID, ID], body: BLOCK});
    validStmt({type: "FunctionDeclaration", id: ID, params: [], body: {type: "BlockStatement", body: [FD]}});
    invalidStmt({type: "FunctionDeclaration"});
    invalidStmt({type: "FunctionDeclaration", params: [], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: null, params: [], body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, params: []});
    invalidStmt({type: "FunctionDeclaration", id: ID, body: BLOCK});
    invalidStmt({type: "FunctionDeclaration", id: ID, params: [null], body: BLOCK});
  });

  test("FunctionExpression", function() {
    validExpr({type: "FunctionExpression", params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: null, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [], body: BLOCK});
    validExpr({type: "FunctionExpression", id: ID, params: [ID, ID], body: BLOCK});
    validExpr({type: "FunctionExpression", params: [], body: {type: "BlockStatement", body: [FD]}});
    invalidExpr({type: "FunctionExpression"});
    invalidExpr({type: "FunctionExpression", params: []});
    invalidExpr({type: "FunctionExpression", body: BLOCK});
    invalidExpr({type: "FunctionExpression", params: [null], body: BLOCK});
  });

  test("IfStatement", function() {
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: STMT});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: STMT, alternate: BLOCK});
    validStmt({type: "IfStatement", test: EXPR, consequent: BLOCK, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR});
    invalidStmt({type: "IfStatement", test: STMT, consequent: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: EXPR});
    invalidStmt({type: "IfStatement", test: EXPR, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT, alternate: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
    invalidStmt({type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: {type: "IfStatement", test: EXPR, consequent: STMT}}, alternate: STMT});
  });

  test("LogicalExpression", function() {
    validExpr({type: "LogicalExpression", operator: "||", left: EXPR, right: EXPR});
    validExpr({type: "LogicalExpression", operator: "&&", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "=", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "+", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression"});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||", left: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||", right: EXPR});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: EXPR});
    invalidExpr({type: "LogicalExpression", operator: "||"});
    invalidExpr({type: "LogicalExpression", left: EXPR});
    invalidExpr({type: "LogicalExpression", right: EXPR});
    invalidExpr({type: "LogicalExpression", left: STMT, right: EXPR});
    invalidExpr({type: "LogicalExpression", left: EXPR, right: STMT});
  });

  test("ObjectExpression", function() {
    validExpr({type: "ObjectExpression", properties: []});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "get", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "set", key: ID, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: NUM, value: EXPR}]});
    validExpr({type: "ObjectExpression", properties: [{kind: "init", key: STR, value: EXPR}]});
    invalidExpr({type: "ObjectExpression"});
    invalidExpr({type: "ObjectExpression", properties: [{key: ID, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "-", key: ID, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: STMT, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: STMT}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: ID, value: BLOCK}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: EXPR, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: null}, value: EXPR}]});
    invalidExpr({type: "ObjectExpression", properties: [{kind: "init", key: {type: "Literal", value: /./}, value: EXPR}]});
  });

  test("Program", function() {
    function valid(x, msg) { assert.ok(esvalid.isValid(x), msg); }
    function invalid(x, msg) { assert.ok(!esvalid.isValid(x), msg); }
    invalid({type: "Program"});
    invalid({type: "Program", body: null});
    valid({type: "Program", body: []});
    valid({type: "Program", body: [STMT]});
    valid({type: "Program", body: [FD]});
    valid({type: "Program", body: [STMT, STMT]});
    valid({type: "Program", body: [STMT, FD, STMT]});
    invalid({type: "Program", body: [STMT, EXPR, STMT]});
    invalid({type: "Program", body: [{type: "Node"}]});
  });

  test("ReturnStatement", function() {
    validExpr(wrapFunction({type: "ReturnStatement"}));
    validExpr(wrapFunction({type: "ReturnStatement", argument: null}));
    validExpr(wrapFunction({type: "ReturnStatement", argument: ID}));
    validExpr(wrapFunction({type: "ReturnStatement", argument: EXPR}));
    invalidStmt({type: "ReturnStatement"});
    invalidStmt({type: "ReturnStatement", argument: EXPR});
    invalidExpr(wrapFunction({type: "ReturnStatement", argument: STMT}));
  });

  test("SequenceExpression", function() {
    invalidExpr({type: "SequenceExpression"});
    invalidExpr({type: "SequenceExpression", expressions: null});
    invalidExpr({type: "SequenceExpression", expressions: []});
    invalidExpr({type: "SequenceExpression", expressions: [EXPR]});
    validExpr({type: "SequenceExpression", expressions: [EXPR, EXPR]});
  });

  test("SwitchStatement", function() {
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: []}]});
    validStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: null});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: []});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: STMT, consequent: []}]});
    invalidStmt({type: "SwitchStatement", discriminant: EXPR, cases: [{type: "SwitchCase", test: EXPR, consequent: [EXPR]}]});
    invalidStmt({type: "SwitchStatement", discriminant: STMT, cases: [{type: "SwitchCase", test: EXPR, consequent: [STMT]}]});
  });

  test("ThisExpression", function() {
    validExpr({type: "ThisExpression"});
  });

  test("ThrowStatement", function() {
    validStmt({type: "ThrowStatement", argument: ID});
    validStmt({type: "ThrowStatement", argument: EXPR});
    invalidStmt({type: "ThrowStatement"});
    invalidStmt({type: "ThrowStatement", argument: null});
    invalidStmt({type: "ThrowStatement", argument: STMT});
  });

  test("TryStatement", function() {
    invalidStmt({type: "TryStatement"});
    invalidStmt({type: "TryStatement", block: BLOCK});
    invalidStmt({type: "TryStatement", block: BLOCK, handler: BLOCK});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: []});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, null, CATCH]});
    invalidStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, BLOCK, CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, handlers: [CATCH, CATCH]});
    validStmt({type: "TryStatement", block: BLOCK, finalizer: BLOCK});
    validStmt({type: "TryStatement", block: BLOCK, handler: CATCH, finalizer: BLOCK});
  });

  test("UnaryExpression", function() {
    validExpr({type: "UnaryExpression", operator: "+", argument: EXPR});
    validExpr({type: "UnaryExpression", operator: "!", argument: EXPR});
    invalidExpr({type: "UnaryExpression", operator: "/", argument: EXPR});
    invalidExpr({type: "UnaryExpression", operator: "+", argument: STMT});
    invalidExpr({type: "UnaryExpression", operator: "+"});
    invalidExpr({type: "UnaryExpression", argument: EXPR});
    invalidExpr({type: "UnaryExpression"});
  });

  test("UpdateExpression", function() {
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR, prefix: true});
    validExpr({type: "UpdateExpression", operator: "++", argument: EXPR});
    validExpr({type: "UpdateExpression", operator: "--", argument: EXPR, prefix: false});
    invalidExpr({type: "UpdateExpression", operator: "+", argument: EXPR, prefix: true});
    invalidExpr({type: "UpdateExpression", operator: "++", argument: STMT});
    invalidExpr({type: "UpdateExpression", operator: "++"});
    invalidExpr({type: "UpdateExpression", argument: EXPR});
    invalidExpr({type: "UpdateExpression"});
  });

  test("VariableDeclaration", function() {
    invalidStmt({type: "VariableDeclaration"});
    invalidStmt({type: "VariableDeclaration", declarations: null});
    invalidStmt({type: "VariableDeclaration", declarations: []});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}]});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID, init: EXPR}]});
    validStmt({type: "VariableDeclaration", declarations: [{type: "VariableDeclarator", id: ID}, {type: "VariableDeclarator", id: ID}]});
  });

});
