# Pull Requests

This document provides guidelines for creating and managing pull requests in the AgriGuru project.

## Before Submitting a Pull Request

1. **Ensure there's an issue**: For non-trivial changes, there should be an issue that your PR addresses. If not, create one first.
2. **Fork the repository**: Create your own fork of the repository to work on.
3. **Create a feature branch**: Don't work directly on the main or master branch.
4. **Sync your fork**: Make sure your fork is up to date with the latest changes from the upstream repository.
5. **Test your changes**: Ensure your changes don't break any existing functionality.

## Creating a Pull Request

When you're ready to submit a pull request, please follow these guidelines:

1. **Use a clear, descriptive title**: The title should concisely explain what the PR is doing.
2. **Link to related issues**: Use keywords like "Fixes #123" or "Resolves #456" to link your PR to relevant issues.
3. **Provide context**: Explain what your changes do, why they're needed, and any implementation details that reviewers should be aware of.
4. **Include tests**: If applicable, include tests that verify your changes work as expected.
5. **Update documentation**: If your changes affect any user-facing features or APIs, update the relevant documentation.
6. **Keep PRs focused**: Each PR should address a single concern. If you need to make multiple unrelated changes, submit separate PRs for each.

### Pull Request Template

```markdown
## Description

[Describe the changes you've made]

## Related Issues

Fixes #[issue number]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] UI/UX improvement
- [ ] Performance optimization
- [ ] Internationalization/localization
- [ ] ML model improvement

## Testing

[Describe how you tested your changes]

## Screenshots (if applicable)

[Add screenshots here]

## Checklist

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

## Review Process

1. **Automated checks**: All PRs will undergo automated testing. Make sure your PR passes all checks.
2. **Code review**: At least one maintainer must review and approve your PR before it can be merged.
3. **Address feedback**: If reviewers request changes, address their feedback by making additional commits to your PR branch.
4. **Approval**: Once your PR has been approved, a maintainer will merge it.

## After Your PR is Merged

1. **Delete your branch**: Once your PR has been merged, you can delete your feature branch.
2. **Stay responsive**: Be prepared to address any issues that may arise as a result of your changes.
3. **Celebrate**: Your contribution is now part of AgriGuru! Thank you for helping improve the project.

## Specific Guidelines for AgriGuru

### Frontend Pull Requests

When submitting changes to the React frontend:
- Ensure components follow the project's component structure
- Verify the UI works across different screen sizes
- Test with multiple languages if the changes involve text

### Backend Pull Requests

When submitting changes to the backend:
- Ensure proper error handling
- Document any API changes
- Consider performance implications

### ML Model Pull Requests

When submitting changes to machine learning models:
- Include performance metrics
- Document model training parameters
- Provide test cases that demonstrate improved accuracy

## Breaking Changes

If your PR introduces breaking changes:
1. Clearly mark it as a breaking change in the PR description
2. Explain the migration path for existing code
3. Update relevant documentation to reflect the changes
4. Consider whether the breaking change is necessary, or if there's a backward-compatible way to achieve the same goal

Thank you for contributing to AgriGuru!
