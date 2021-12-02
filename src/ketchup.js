const { exec, spawn } = require('child_process')
const throttle = require('lodash.throttle')
const chokidar = require('chokidar')

const log = (proc, name, nuke = false) => {
  proc.stdout.on('data', data => {
    console.log(`🍅 ${data}`)
  })
  proc.stderr.on('data', data => {
    console.error(`🍅 ${data}`)
    if (nuke) process.exit(1)
  })
  proc.on('exit', code => {
    console.log(`${code > 0 ? '❓' : '✨'} ${name} process exited with code ${code}`)
  })
}

module.exports = function () {
  const [, , branch = 'lecture', resume] = process.argv

  const checkBranchName = spawn('git', ['check-ref-format', '--branch', branch])
  log(checkBranchName, 'Branch check', true)

  const throttleConfig = {
    leading: false,
    trailing: true,
  }

  const chokidarConfig = {
    ignoreInitial: true,
    ignored: ['**/node_modules/**/*', '**/.git/**/*'],
  }

  const prep = () => {
    const prepProcess = exec(`
      git stash
      git branch -D ${branch}
      git push origin :${branch}
      git checkout -b ${branch}
      git push origin ${branch}
    `)
    log(prepProcess, 'Prep')
  }

  const push = (event, path) => {
    console.log(`\n🔥 ${event} in ${path}\n`)
    const pushProcess = exec(`
      git add .
      git commit -m 'committing to ${branch}'
      git push origin ${branch}
    `)
    log(pushProcess, 'Commit & push')
  }

  if (!resume) prep()
  const throttledPush = throttle(push, 5000, throttleConfig)
  chokidar.watch('.', chokidarConfig).on('all', throttledPush)

  console.log(`\n🔥🔥🔥 Ketchup pushing to ${branch} branch! 🔥🔥🔥`)
  console.log(`🔥🔥🔥 Ketchup pushing to ${branch} branch! 🔥🔥🔥`)
  console.log(`🔥🔥🔥 Ketchup pushing to ${branch} branch! 🔥🔥🔥\n`)
}
