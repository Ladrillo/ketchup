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

const log = (proc, name) => {
  proc.stdout.on('data', data => {
    console.log(`🍅 ${data}`)
  })
  proc.stderr.on('data', data => {
    console.error(`🍅 ${data}`)
  })
  proc.on('exit', code => {
    const emoji = code > 0 ? '❓' : '✨'
    const outcome = code > 0 ? 'failed' : 'succeeded'
    console.log(`${emoji} ${name} process ${outcome} at ${getTime()}\n`)
  })
}

const logAndKill = message => {
  console.error(message)
  console.error(`Usage:\n
    @ladrillo/ketchup                      # pushes to a "lecture" branch
    @ladrillo/ketchup <branch-name>        # pushes to a <branch-name> branch
    @ladrillo/ketchup <branch-name> resume # pushes to the current <branch-name> branch\n`)
  process.exit(1)
}

module.exports = function () {
  const [, , branch = 'lecture', resume] = process.argv

  const formatCheck = spawnSync('git', ['check-ref-format', '--branch', `'${branch}'`])
  const formatError = formatCheck.stderr.toString().trim()

  if (formatError) {
    logAndKill(`\n💀 ${formatError}\n💀 Please fix the problem and try again.\n`)
  }

  const currBranchCheck = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'])
  const currBranchCheckError = currBranchCheck.stderr.toString().trim()

  if (currBranchCheckError) {
    logAndKill(`\n💀 ${currBranchCheckError}\n💀 Please fix the problem and try again.\n`)
  }

  const currentBranch = currBranchCheck.stdout.toString().trim()

  if (!resume && currentBranch === branch) {
    logAndKill(`\n💀 Pass the "resume" option to push to the same branch you are on.\n`)
  }

  if (resume && resume !== 'resume') {
    logAndKill(`\n💀 You passed a "${resume}" argument. Did you mean "resume"?\n`)
  }

  if (resume && currentBranch !== branch) {
    logAndKill(`\n💀 In order to resume you must pass the name of your current branch.\n`)
  }

  console.log(`
    ██╗  ██╗███████╗████████╗ ██████╗██╗  ██╗██╗   ██╗██████╗ ██╗
    ██║ ██╔╝██╔════╝╚══██╔══╝██╔════╝██║  ██║██║   ██║██╔══██╗██║
    █████╔╝ █████╗     ██║   ██║     ███████║██║   ██║██████╔╝██║
    ██╔═██╗ ██╔══╝     ██║   ██║     ██╔══██║██║   ██║██╔═══╝ ╚═╝
    ██║  ██╗███████╗   ██║   ╚██████╗██║  ██║╚██████╔╝██║     ██╗
    ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝
    v. ${require('../package.json').version} pushing to "${branch}" branch...
  `)

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
}
