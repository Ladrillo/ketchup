#!/usr/bin/env node
const { exec } = require('child_process')
const chokidar = require('chokidar')
const throttle = require('lodash.throttle')

module.exports = function () {
  const branch = process.argv[2] || 'lecture'

  const throttleConfig = {
    leading: true,
    trailing: true,
  }

  const chokidarConfig = {
    ignoreInitial: true,
    ignored: ['**/node_modules/**/*', '**/.git/**/*'],
  }

  const log = process => {
    process.stdout.on('data', data => {
      console.log(data)
    })
    process.stderr.on('data', data => {
      console.error(data)
    })
  }

  const prepProcess = exec(`
      git stash
      git checkout main
      git pull
      git branch -D ${branch}
      git push origin :${branch}
      git checkout -b ${branch}
      git push origin ${branch}
  `)
  log(prepProcess)

  const push = (event, path) => {
    console.log(event, path)
    const pushProcess = exec(`
      git add .
      git commit -m "committing to ${branch}"
      git push origin ${branch}
  `)
    log(pushProcess)
  }

  const throttledPush = throttle(push, 5000, throttleConfig)
  chokidar.watch('.', chokidarConfig).on('all', throttledPush)
}
