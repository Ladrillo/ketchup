#!/usr/bin/env node
const { exec } = require('child_process')
const throttle = require('lodash.throttle')
const chokidar = require('chokidar')

module.exports = function () {
  const [, , branch = 'lecture', resume] = process.argv

  const throttleConfig = {
    leading: false,
    trailing: true,
  }

  const chokidarConfig = {
    ignoreInitial: true,
    ignored: ['**/node_modules/**/*', '**/.git/**/*'],
  }

  const log = process => {
    process.stdout.on('data', data => {
      console.log(`🍅 ${data}`)
    })
    process.stderr.on('data', data => {
      console.error(`🍅 ${data}`)
    })
  }

  const prep = () => {
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
  }

  const push = (event, path) => {
    console.log(`🔥 ${event} in ${path}\n`)
    const pushProcess = exec(`
      git add .
      git commit -m 'committing to ${branch}'
      git push origin ${branch}
    `)
    log(pushProcess)
  }

  if (!resume) prep()
  const throttledPush = throttle(push, 30000, throttleConfig)
  chokidar.watch('.', chokidarConfig).on('all', throttledPush)

  console.log(`\n🍅🍅🍅 Ketchup targeting ${branch} branch! 🍅🍅🍅`)
  console.log(`🍅🍅🍅 Ketchup targeting ${branch} branch! 🍅🍅🍅`)
  console.log(`🍅🍅🍅 Ketchup targeting ${branch} branch! 🍅🍅🍅\n`)
}
