#!/usr/bin/env node
const chokidar = require('chokidar')

const config = {
  ignoreInitial: true,
  ignored: ['**/node_modules/**/*', '**/.git/**/*'],
}

module.exports = function () {
  chokidar
    .watch('.', config)
    .on('all', (event, path) => {
      console.log(event, path)
    })
}
