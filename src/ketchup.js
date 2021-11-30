#!/usr/bin/env node
const { exec } = require('child_process')
const chokidar = require('chokidar')
const throttle = require('lodash.throttle')

const chokidarConfig = {
  ignoreInitial: true,
  ignored: ['**/node_modules/**/*', '**/.git/**/*'],
}

const throttleConfig = {
  leading: false,
  trailing: true,
}

const push = (event, path) => {
  console.log(event, path)
  const branch = process.argv[2] || 'lecture'
  const childProcess = exec(`
    git checkout main
    git pull
    git branch -D ${branch}
    git push origin :${branch}
    git checkout -b ${branch}
    git push origin ${branch}
  `)
  childProcess.stdout.on('data', (data) => {
    console.log(data)
  })
  childProcess.stderr.on('data', (data) => {
    console.error(data)
  })
}

const throttledPush = throttle(push, 5000, throttleConfig)

module.exports = function () {
  chokidar.watch('.', chokidarConfig).on('all', throttledPush)
}
