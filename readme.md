# @ladrillo/ketchup

## About

Ketchup is a CLI tool to allow teachers demoing a coding project to automatically commit & push to Github whenever changes are made to the files of the project, throttling to at most once every 30 seconds. Students can reset their files and folders to the teacher's remote branch if they fall behind, and teachers don't have to push manually. Students must clone the teacher's repo _without_ forking it first.

## Before Using Ketchup

1. Be at the root folder of the project.
2. Check out the branch you want to use as the _starting point_ of the demo (usually "main").
3. Have a clean working tree. Any outstanding changes will be stashed.
4. Decide on a branch name _to push commits to_, **different from the starting point branch**.

## The Teacher

Execute once at the beginning of the demo:

```bash
npx @ladrillo/ketchup foo-branch
```

If no branch name is provided (e.g. "foo-branch"), "lecture" is used instead. This is the branch Ketchup will push to, and students can reset to.

If Ketchup is closed during the demo, you can continue where you left off by running:

```bash
npx @ladrillo/ketchup foo-branch resume
```

**IMPORTANT**

In order to resume, the branch name must be provided. Running Ketchup without both arguments in this situation can result in the loss of all work done so far.

## The Students

Students can catch up by executing:

```bash
git fetch && git reset --hard origin/foo-branch
```

In JavaScript projects a "ketchup" script can be added to the `package.json`:

```json
{
  "scripts": {
    "ketchup": "git fetch && git reset --hard origin/foo-branch"
  }
}
```

In this case students can catch up by executing:

```bash
npm run ketchup
```

## Notes

1. If new packages are added to the project during the demo, students should run `npm i` after catching up.
2. It's advisable that students have auto-save enabled in their editors.
3. Students should close other programs besides their editors that might be accessing the project files, before catching up.
4. Don't forget to gitignore the `node_modules` folder in JavaScript projects.
