# pr-has-one-of-labels
Github Action to check if a PR has at least one of the provided labels

Example workflow file:
```yml
name: QA Labels Check
on:
  pull_request:
    types: [opened, labeled, unlabeled]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: danielchabr/pr-has-one-of-labels@master
        id: checkLabel
        with:
          labels: QA:tested,QA:skipped
```
