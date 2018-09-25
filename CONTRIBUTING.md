# Contributing

We welcome contributions in several forms, e.g.

* Sponsoring
* Documenting
* Testing
* Coding
* etc.

Please read
[14 Ways to Contribute to Open Source without Being a Programming Genius or a
Rock Star](http://blog.smartbear.com/programming/14-ways-to-contribute-to-open-source-without-being-a-programming-genius-or-a-rock-star/)

Please check issues and look for unassigned ones or create a new one.

Working together in an open and welcoming environment is the foundation of our
success, so please respect our [Code of Conduct](CODE_OF_CONDUCT.md).

## Guidelines

### Workflow

We use the
[Feature Branch Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/feature-branch-workflow)
and review all changes we merge to master.

Unfortunatelly that works only if the contributor has at least developer access
rights in this project.

If you plan to contribute regularly, please request developer access to be
able to use our preferred feature branch workflow.

Otherwise use [Forking Workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/forking-workflow),
since adding everyone to this project would be problematic.

### Git Commit

The cardinal rule for creating good commits is to ensure there is only one
"logical change" per commit. There are many reasons why this is an important
rule:

* The smaller the amount of code being changed, the quicker & easier it is to
  review & identify potential flaws.
* If a change is found to be flawed later, it may be necessary to revert the
  broken commit. This is much easier to do if there are not other unrelated code
  changes entangled with the original commit.
* When troubleshooting problems using Git's bisect capability, small well
  defined changes will aid in isolating exactly where the code problem was
  introduced.
* When browsing history using Git annotate/blame, small well defined changes
  also aid in isolating exactly where & why a piece of code came from.

Things to avoid when creating commits

* Mixing whitespace changes with functional code changes.
* Mixing two unrelated functional changes.
* Sending large new features in a single giant commit.

### Git Commit Conventions

We use git commit as per [Conventional Commits](https://conventionalcommits.org/):

```text
docs(contributing): add commit message guidelines
```

Example:

```text
<type>(<scope>): <subject>
```

Allowed types:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, missing semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **perf**: A code change that improves performance
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such
  as documentation generation

#### What to use as scope

In most cases the changed component is a good choice as scope
e.g. if the change is done in the ui, the scope should be *ui*.

For documentation changes the section that was changed makes a good scope name
e.g. use *faq* if you changed that section.
