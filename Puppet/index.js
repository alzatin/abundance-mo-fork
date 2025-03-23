//ENTER YOUR GITHUB CREDENTIALS TO TEST PUPPETEER AND CHANGE PROJECTS TO TEST TO PROJECTS THAT EXIST FOR THAT SPECIFIC USER

//const envUserValue = "";
//const envPassValue = "";

const projectUser = "moatmaslow";

const puppeteer = require("puppeteer");
const projects_to_test = require("./projects_to_test.js");
// Get the current date
const currentDate = new Date().toISOString().split("T")[0];

// Launch the browser and open a new blank page
//for each project in projects to test launch puppeteer

(async () => {
  for (const project of projects_to_test) {
    try {
      await loadPuppeteerAndExec(
        "http://localhost:4444",
        project,
        "Test-" + currentDate
      );

      await loadPuppeteerAndExec(
        "https://barboursmith.github.io/Abundance",
        project,
        "Deployed-" + currentDate
      );
    } catch (error) {
      console.error(`Error processing project ${project}:`, error);
    }
  }
  console.log("All projects processed.");
})();

async function loadPuppeteerAndExec(url, projectName, photoLabel) {
  console.log(
    `Loading Puppeteer for project ${projectName} with label ${photoLabel}`
  );
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto(url + "/run/" + projectUser + "/" + projectName, {
      waitUntil: "networkidle2",
      timeout: 0, // Disable timeout
    });
    console.log(`Navigated to ${url}/run/${projectUser}/${projectName}`);
    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });

    const selector = "body";
    /*await page.waitForSelector("#molecule-fully-render-puppeteer", {
      visible: true,
      timeout: 120000,
    });*/
    await page.waitForFunction(
      (selector) => !!document.querySelector(selector),
      { timeout: 120000 }, // Increase timeout to 2 minutes
      selector
    );
    console.log(`Element ${selector} is now visible.`);

    await page.screenshot({
      path: `Puppet/images/${projectName}-${photoLabel}.png`,
    });
    console.log(`Puppet/images/${projectName}-${photoLabel}.png`);
  } catch (error) {
    console.error(
      `Error in loadPuppeteerAndExec for project ${projectName}:`,
      error
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
