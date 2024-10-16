# Release Procedure for Audio Monitor

This document outlines the release procedure for the Audio Monitor project. Our project uses semantic-release for automated versioning and changelog generation, and GitHub Actions for continuous integration and deployment.

## Prerequisites

- You have push access to the main repository.
- You have the necessary permissions to create releases on GitHub.
- You have set up the required secrets in your GitHub repository:
  - `NPM_TOKEN`
  - `NETLIFY_AUTH_TOKEN`
  - `NETLIFY_SITE_ID`

## Release Process

Our release process is largely automated thanks to semantic-release and GitHub Actions. Here's how it works:

1. **Develop Features or Fix Bugs**
   - Create a new branch for your feature or bug fix:
     ```
     git checkout -b feature/your-feature-name
     ```
   - Make your changes and commit them using conventional commit messages:
     ```
     git commit -m "feat: add new audio visualization feature"
     ```
   - Push your branch and create a pull request:
     ```
     git push origin feature/your-feature-name
     ```

2. **Review and Merge**
   - Once your pull request is approved, merge it into the main branch.
   - Use the "Squash and merge" option, ensuring the commit message follows the conventional commit format.

3. **Automated Release**
   - After merging, the GitHub Actions workflow will automatically:
     - Run tests
     - Create a new release (if necessary based on commit messages)
     - Generate a changelog
     - Update the version in package.json
     - Create a GitHub release
     - Deploy to Netlify

4. **Verify the Release**
   - Check the GitHub Actions tab to ensure all steps completed successfully.
   - Verify the new release on the GitHub Releases page.
   - Check that the latest version is deployed on Netlify.

## Manual Release (if needed)

In case you need to trigger a release manually:

1. Ensure your local main branch is up to date:
   ```
   git checkout main
   git pull origin main
   ```

2. Run the release process locally:
   ```
   NPM_TOKEN=your_npm_token GITHUB_TOKEN=your_github_token npx semantic-release
   ```

3. Push the changes:
   ```
   git push origin main --follow-tags
   ```

## Important Considerations

- Always use conventional commit messages to ensure proper versioning.
- Major version bumps (breaking changes) should be carefully considered and communicated to users.
- If you need to release a specific version, you can use the `--release-as` flag with semantic-release:
  ```
  npx semantic-release --release-as minor
  ```
- Monitor the GitHub Actions logs for any issues during the release process.
- Regularly review and update dependencies to ensure security and compatibility.

## Troubleshooting

If you encounter issues with the release process:

1. Check the GitHub Actions logs for error messages.
2. Ensure all required secrets are correctly set in the repository settings.
3. Verify that your commit messages follow the conventional commit format.
4. If needed, you can manually trigger the GitHub Actions workflow from the Actions tab.

For any persistent issues, consult the semantic-release and GitHub Actions documentation or reach out to the development team.