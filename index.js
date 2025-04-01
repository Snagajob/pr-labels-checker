const core = require('@actions/core')
const github = require('@actions/github')

async function run() {
  try {
    // check if this is running on a pull request
    if (!github.context.payload.pull_request) {
      // return core.setOutput('passed', true)
    }

    const token = core.getInput('githubToken');
    const context = github.context
    const octokit = github.getOctokit(token)

    const hasSomeInput = core.getInput('hasSome')
    const hasAllInput = core.getInput('hasAll')
    const hasNoneInput = core.getInput('hasNone')
    const hasNotAllInput = core.getInput('hasNotAll')

    const hasSomeLabels = hasSomeInput.split(',')
    const hasAllLabels = hasAllInput.split(',')
    const hasNoneLabels = hasNoneInput.split(',')
    const hasNotAllLabels = hasNotAllInput.split(',')

    const failMessages = []

    const { data: labelsOnIssue } = await octokit.issues.listLabelsOnIssue({
      ...context.repo,
      issue_number: context.payload.pull_request.number
    })

    const prLabels = labelsOnIssue.map(item => item.name)

    const hasSomeResult = !hasSomeInput || hasSomeLabels.some((label) =>
      prLabels.includes(label)
    )

    const hasAllResult = !hasAllInput || hasAllLabels.every((label) =>
      prLabels.includes(label)
    )

    const hasNoneResult = !hasNoneInput || hasNoneLabels.every((label) =>
      !prLabels.includes(label)
    )

    const hasNotAllResult = !hasNotAllInput || hasNotAllLabels.some((label) =>
      !prLabels.includes(label)
    )

    if (!hasSomeResult) {
      failMessages.push(`The PR needs to have at least one of the following labels to pass this check: ${hasSomeLabels.join(
        ', '
      )}`)
    }

    if (!hasAllResult) {
      failMessages.push(`The PR needs to have all of the following labels to pass this check: ${hasAllLabels.join(
        ', '
      )}`)
    }

    if (!hasNoneResult) {
      failMessages.push(`The PR needs to have none of the following labels to pass this check: ${hasNoneLabels.join(
        ', '
      )}`)
    }

    if (!hasNotAllResult) {
      failMessages.push(`The PR needs to not have at least one of the following labels to pass this check: ${hasNotAllLabels.join(
        ', '
      )}`)
    }
  
    const checks = await octokit.checks.listForRef({
      ...context.repo,
      ref: context.payload.pull_request.head.ref,
    });

    const checkRunIds = checks.data.check_runs.filter(check => check.name === context.job).map(check => check.id)

    if (failMessages.length) {
      core.setFailed(failMessages.join('. '))
		}

		catch (error) {
			core.setFailed(error.message)
		}
	}
}
run()
