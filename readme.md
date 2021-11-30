# @ladrillo/ketchup

## About

This is a CLI tool to allow teachers demoing a coding project to automatically commit & push to Github whenever changes are made to the files of the project, throttling to once every 30 seconds. This way students can reset to the teacher's remote branch if they fall behind during the demo. Students must clone the teacher's repo _without_ forking it first.

## Usage

In the project's root folder, execute once at the beginning of the demo:

```bash
npx @ladrillo/ketchup foo-branch
```
If no branch name is provided, "lecture" is used.

Tell students to catch up by executing:

```bash
git fetch && git reset --hard origin/foo-branch
```

In JavaScript projects you can set up a "ketchup" script in the `package.json`:

```json
{
  "ketchup": "git fetch && git reset --hard origin/foo-branch"
}
```

Then tell students to catch up by executing:

```bash
npm run ketchup
```
