console.log("hello world");
// index.js
const { Toolkit } = require("actions-toolkit");
const tools = new Toolkit();
const webPageTest = require("webpagetest");

const { webPagetestTestUrl, webpagetestApiKey } = require("minimist")(
  process.argv.slice(1)
);

console.log(webPagetestTestUrl);
console.log(webpagetestApiKey);

const { event, payload, arguments } = tools.context;

if (event === "pull_request") {
  console.log(payload);
  console.log(arguments);

  // 1. An authenticated instance of `@octokit/rest`, a GitHub API SDK
  const octokit = tools.createOctokit();

  // 2. run tests and save results
  const webpagetestResults = runWebPagetest();

  // 3. convert results to markdown
  const finalResultsAsMarkdown = convertToMarkdown(webpagetestResults);
  // 4. print results to pull requests
  const {
    params: { owner, repo }
  } = tools.context.repo({ path: ".github/config.yml" });

  const result = await octokit.pulls.createComment({
    owner,
    repo,
    number,
    body: finalResultsAsMarkdown
  });

  /**
   * get latest commit
   * and push webpagetest results as comment to latest commit
   */
  octokit.repos
    .getCommit({ owner: myOwner, repo: myRepo, sha: gitBranch })
    .then(commit => {
      return github.repos.createCommitComment({
        owner: myOwner,
        repo: myRepo,
        sha: commit.data.sha,
        body: dataAsMarkdown
      });
    })
    .catch(error => {
      console.log(`ERROR could either not get commits of the repo ${myRepo} of the owner ${myOwner}
              or could not sent the commit to the repositorie ERRORMSG: ${error}
              `);
    });
  // Delete the branch
  //   octokit.git
  //     .deleteRef(
  //       tools.context.repo({
  //         ref: `heads/${payload.pull_request.head.ref}`
  //       })
  //     )
  //     .then(() => {
  //       console.log(`Branch ${payload.pull_request.head.ref} deleted!`);
  //     });
}

function runWebPagetest() {
  // initialize
  const wpt = new webPageTest("www.webpagetest.org", webpagetestApiKey);
  wpt.runTest(
    testURL,
    {
      video: true,
      pollResults: 5,
      location: "Dulles_MotoG4",
      connectivity: "3GSlow",
      mobile: 1,
      device: "Motorola G (gen 4)",
      timeout: 1000,
      lighthouse: true
    },
    function(err, result) {
      if (err) {
        console.log(err);
      }
      if (result) {
        convertToMarkdown(result);
      }
    }
  );
}

function convertToMarkdown(result) {
  let dataAsMarkdown = `
  # WebpageTest report
  * run id: ${result.data.id}
  * URL testid: ${result.data.testUrl}
  * Summary of the test: ${result.data.summary}
  * location where the test has run: ${result.data.location}
  * from run parameter: ${result.data.from}
  * connectivity: ${result.data.connectivity}
  * successFullRuns: ${result.data.successfulFVRuns}
  ## Report
  # FilmStrip
  ## FirstView median
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${result.data.median.firstView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
  
  ## ReapeatView median
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.time} milliseconds |`;
      } else {
        return ` ${item.time} milliseconds |`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `|--------------|`;
      } else {
        return `--------------|`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ![alt text](${item.image}) |`;
      } else {
        return ` ![alt text](${item.image}) |`;
      }
    })
    .join("")}
  ${result.data.median.repeatView.videoFrames
    .map((item, index) => {
      if (index === 0) {
        return `| ${item.VisuallyComplete} |`;
      } else {
        return ` ${item.VisuallyComplete} |`;
      }
    })
    .join("")}
  # VisualMetrics
  ## Metrics Median Run
  | View | First Paint | First Contentful Paint | First Meaningful Paint | Time to First Byte | Time to interactive |  Render Started |  Visualy Completed | SpeedIndex | Load Time |
  |----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
  FirstView  | ${result.data.median.firstView.firstPaint} | ${
    result.data.median.firstView.firstContentfulPaint
  } | ${result.data.median.firstView.firstMeaningfulPaint} | ${
    result.data.median.firstView["lighthouse.Performance.interactive"]
  } | ${result.data.median.firstView.TTFB} | ${
    result.data.median.firstView.render
  } | ${result.data.median.firstView.visualComplete} | ${
    result.data.median.firstView.SpeedIndex
  } | ${result.data.median.firstView.loadTime} |
  RepeatView | ${result.data.median.repeatView.firstPaint} | ${
    result.data.median.repeatView.firstContentfulPaint
  } | ${result.data.median.repeatView.firstMeaningfulPaint} | ${
    result.data.median.repeatView["lighthouse.Performance.interactive"]
  } | ${result.data.median.repeatView.TTFB} | ${
    result.data.median.repeatView.render
  } | ${result.data.median.repeatView.visualComplete} | ${
    result.data.median.repeatView.SpeedIndex
  } | ${result.data.median.repeatView.loadTime} |
    ## Metrics Average Run
    | View | First Paint | First Contentful Paint | First Meaningful Paint | Time to First Byte | Time to interactive |  Render Started |  Visualy Completed | SpeedIndex | Load Time |
    |----------|----------|----------|----------|----------|----------|----------|----------|----------|----------|
    FirstView  | ${result.data.average.firstView.firstPaint} | ${
    result.data.average.firstView.firstContentfulPaint
  } | ${result.data.average.firstView.firstMeaningfulPaint} | ${
    result.data.average.firstView["lighthouse.Performance.interactive"]
  } | ${result.data.average.firstView.TTFB} | ${
    result.data.average.firstView.render
  } | ${result.data.average.firstView.visualComplete} | ${
    result.data.average.firstView.SpeedIndex
  } | ${result.data.average.firstView.loadTime} |
    RepeatView | ${result.data.average.repeatView.firstPaint} | ${
    result.data.average.repeatView.firstContentfulPaint
  } | ${result.data.average.repeatView.firstMeaningfulPaint} | ${
    result.data.average.repeatView["lighthouse.Performance.interactive"]
  } | ${result.data.average.repeatView.TTFB} | ${
    result.data.average.repeatView.render
  } | ${result.data.average.repeatView.visualComplete} | ${
    result.data.average.repeatView.SpeedIndex
  } | ${result.data.average.repeatView.loadTime} |
  # Waterfall
  ## FirstView median
  ![alt text](${result.data.median.firstView.images.waterfall})
  # Files
  ## FirstView median Files
  | File | FileSize |
  |----------|----------|
   ${result.data.median.firstView.requests
     .map(request => `${request.url}|${humanFileSize(request.bytesIn)} \r\n`)
     .join("")}
      `;
  return dataAsMarkdown;
}

function humanFileSize(size) {
  var i = Math.floor(Math.log(size) / Math.log(1024));
  return (
    (size / Math.pow(1024, i)).toFixed(2) * 1 +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}
