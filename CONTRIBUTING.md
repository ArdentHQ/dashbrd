# Contributing

If you're thinking of contributing to Dashbrd, this is your place to start. We welcome all kinds of contributions, whether they are small fixes or large features being added. However, to help us with maintaining PRs and to get them merged quicker, we do have some expectations in how they are presented. We highlight the general rules below. Although these are not set in stone, they do heavily increase your changes of a PR being merged.

## Create an Issue or Discussion

As a starting point, you should always work based on an issue or discussion topic. If there is no issue or topid opened yet, make sure you create one to first discuss the necessity of the changes you'd like to see. Without a prior discussion, you run the risk that your changes are not something we're looking for (at this time) and this could cause your PR being closed.

Also make sure to open your PR and link the relevant issue in it, preferably by utilising one of the [closing keywords](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue)

## Focused PRs

Keep PRs focused to a single issue. We prefer a single issue for each PR that gets opened, as it improves the speed at which they can be merged. This avoid scenarios where changes are requested for a part of the PR that's separate from another aspect, but it both being blocked as it's part of the same PR.

## Test Coverage

Anything you add or change should have accompanying tests where relevant. Make sure to show us your changes work as intended by providing test cases that cover the different scenarios it may run into.

## Pick the Right Branch

Make sure to open your PRs against the `develop` branch and that the PRs are coming from a fork that has been kept up to date with the latest changes in the `develop` branch. This will avoid scenarios where your changes are conflicting with files in the `develop` branch that have been changed since, and will allow for PRs to be merged quicker when they are accepted.

## Code of Conduct

To ensure the community is welcoming to all, please review and abide by our [Code of Conduct](/CODE_OF_CONDUCT.md).
