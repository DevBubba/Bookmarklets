# Pre-Merge Checklist: Beta to Main

### GitHub Settings & Security

**CodeQL Setup**
- Verify "Advanced setup" is selected (not "Default setup")
- Settings → Code security and analysis → Code scanning → CodeQL analysis
- Confirm `.github/codeql-config.yml` will be used after merge

**GitHub Actions Permissions**
- Settings → Actions → General
- Verify "Allow all actions and reusable workflows" OR "Allow select actions" is enabled
- Ensure workflow scope is enabled

**Branch Protection Rules (Main Branch)**
- Settings → Branches → Branch protection rules → main
- Review required status checks
- Verify CodeQL analysis is set as required
- Check if PR reviews are required

**Repository Security**
- Settings → Code security and analysis
- Verify Dependabot alerts are enabled
- Check secret scanning is enabled

### Files & Configuration

**Workflow Files**
- `.github/workflows/deploy.yml` - Uses commit SHAs (not version tags)
- `.github/workflows/codeql.yml` - References `codeql-config.yml`
- Both workflows use commit SHAs for security compliance

**Config Files**
- `.github/codeql-config.yml` exists and has correct `paths-ignore`
- Verify config file location: `.github/codeql-config.yml`

**Code Quality**
- All JavaScript files pass syntax check (no parse errors)
- CodeQL warnings are acceptable (false positives documented)
- No console.log statements in production code
- Code is clean and ready

### Testing & Verification

**Local Testing**
- Site runs locally without errors
- All pages load correctly
- Background animation works
- All JavaScript features functional (typewriter, carousel, stats, etc.)
- Navigation works correctly
- Footer links work
- Changelog loads from GitHub
- License page displays correctly

**GitHub Pages**
- Verify GitHub Pages source is set to "GitHub Actions" (not branch)
- Settings → Pages → Source: GitHub Actions
- Test deployment workflow runs successfully on beta

### Git & Branch Management

**Branch Status**
- Beta branch is up to date with all changes
- All commits are signed (GPG verified on this machine)
- Commit author email matches GitHub verified email
- No uncommitted changes

**Merge Strategy**
- Figure out merge commit, squash, or rebase
- Create PR from beta → main to review changes
- Or merge directly if I'm confident everything is good

**Documentation Updates**
- Update README with proper project info before pushing
- Add privacy policy page
- Add terms of service page
- Add code of conduct page
- License page already exists, verify it's correct

### License

- License page displays correctly
- License link in footer works
- Full license text is visible

### Post-Merge Actions

**After Merging to Main**
- Verify GitHub Actions workflows run successfully
- Check CodeQL analysis completes
- Verify GitHub Pages deployment succeeds
- Test live site functionality
- Monitor for any errors in Actions logs

**Cleanup**
- Keep beta branch for future work
- Update docs if needed

### Repository Settings to Verify

**General Settings**
- Description and topics are current
- Website URL points to GitHub Pages

**Features**
- Verify all enabled features are set as desired

### Final Checks

**Code Review**
- Go through all changes in beta vs main
- Make sure no sensitive stuff got committed (API keys, tokens, etc.)
- Check that no test/debug code is left in

**Dependencies**
- No external dependencies that need updating
- All CDN links are current and working

---

## Quick Reference

**GitHub Settings Path:**
- CodeQL: `Settings → Code security and analysis → Code scanning`
- Actions: `Settings → Actions → General`
- Pages: `Settings → Pages`
- Branches: `Settings → Branches`

**Important Files:**
- `.github/workflows/deploy.yml` - Deployment workflow
- `.github/workflows/codeql.yml` - CodeQL analysis workflow
- `.github/codeql-config.yml` - CodeQL configuration

---

## Notes for Working Between Laptop and PC

**Git Setup**
- This laptop uses GPG signing, Windows PC doesn't have GPG set up yet
- Windows PC uses SSH keys for authentication
- Use the same verified email on both machines
- Keep SSH keys synced between devices

**Local Development**
- Run `python3 -m http.server 8002` in frontend directory to test locally
- Check that all features work before committing

**Before Switching Devices**
- Commit and push all changes to beta branch
- Pull latest changes when switching to other device
- Verify everything still works after pulling

**Common Issues to Remember**
- Background animation might need canvas element in body
- Page transitions need proper initialization
- GitHub stats need API calls to work
- Changelog loads from GitHub raw content URL

**Workflow Reminders**
- Always work on beta branch, never main
- Test locally before pushing
- Use commit SHAs in workflows, not version tags
- Keep code clean, no debug logs

---

## Before Pushing to Beta

**Quick Checks**
- Test locally first
- Make sure all changes are committed
- Verify no sensitive data in commits
- Check that workflows use commit SHAs

**Push Process**
- Commit all changes
- Push to beta branch: `git push origin beta`
- Verify push was successful
- Check GitHub Actions if workflow runs

---

Just my notes for when I'm ready to push to beta or merge beta to main. Nothing permanent, just keeping track of what I need to check.
