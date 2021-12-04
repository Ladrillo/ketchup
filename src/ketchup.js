const { exec, spawnSync } = require('child_process')
const throttle = require('lodash.throttle')
const chokidar = require('chokidar')

const getTime = (date = new Date()) => {
  return date.toLocaleString('en-US', {
    hour12: true,
    day: '2-digit',
    month: 'long',
    weekday: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const log = (proc, name, nuke = false) => {
  proc.stdout.on('data', data => {
    console.log(`🍅 ${data}`)
  })
  proc.stderr.on('data', data => {
    console.error(`🍅 ${data}`)
    if (nuke) process.exit(1)
  })
  proc.on('exit', code => {
    const emoji = code > 0 ? '❓' : '✨'
    const outcome = code > 0 ? 'failed' : 'succeeded'
    console.log(`${emoji} ${name} process ${outcome} at ${getTime()}\n`)
  })
}

module.exports = function () {
  const [, , branch = 'lecture', resume] = process.argv

  const formatCheck = spawnSync('git', ['check-ref-format', '--branch', `'${branch}'`])

  if (formatCheck.stderr) {
    console.error(
      `\n💀 ${formatCheck.stderr.toString()}\n💀 Please fix the problem and try again!\n`
    )
    process.exit(1)
  }

  const currBranchCheck = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'])

  if (currBranchCheck.stderr) {
    console.error(
      `\n💀 ${currBranchCheck.stderr.toString()}gaga\n💀 Please fix the problem and try again!\n`
    )
    process.exit(1)
  }

  const currentBranch = currBranchCheck.stdout.toString().trim()
  if (currentBranch === branch) {
    console.error(`\n💀 The current branch and the target branch cannot be the same unless you pass "resume".\n💀 Please fix the problem and try again!\n`)
    process.exit(1)
  }

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
      git branch -D '${branch}'
      git push origin :'${branch}'
      git checkout -b '${branch}'
      git push origin '${branch}'
    `)
    log(prepProcess, 'Prep')
  }

  const push = (event, path) => {
    console.log(`🔥 ${event} in ${path}\n`)
    const pushProcess = exec(`
      git add .
      git commit -m 'committing to "${branch}"'
      git push origin '${branch}'
    `)
    log(pushProcess, 'Commit & push')
  }

  if (!resume) prep()
  const throttledPush = throttle(push, 30000, throttleConfig)
  chokidar.watch('.', chokidarConfig).on('all', throttledPush)

  console.log(`
    ██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██╗   ██╗██████╗ ██╗
    ██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██║   ██║██╔══██╗██║
    █████╔╝ █████╗     ██║   ██║     ███████║██║   ██║██████╔╝██║
    ██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██║   ██║██╔═══╝ ╚═╝
    ██║  ██╗███████╗   ██║   ╚██████╗██║  ██║╚██████╔╝██║     ██╗
    ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
    v. ${require('../package.json').version} pushing to "${branch}" branch...
  `)
}
