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
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    await loadPuppeteerAndExec(browser, currentDate);
  } catch (error) {
    console.error(`Error processing projects`);
  } finally {
    if (browser) {
      console.log(`Closing browser `);
      await browser.close();
    }
  }
  console.log("All projects processed:!");
})();

async function loadPuppeteerAndExec(browser, date) {
  const page = await browser.newPage();

  for (const projectName of projects_to_test) {
    console.log(projectName);
    // Navigate the page to a localhost URL.
    await page.goto(
      "http://localhost:4444" + "/run/" + projectUser + "/" + projectName
    );
    console.log("navigated to: " + projectName);
    // Set screen size.
    await page.setViewport({ width: 1080, height: 1024 });
    const selector = "#molecule-fully-render-puppeteer";
    /*await page.waitForSelector("#molecule-fully-render-puppeteer", {
      visible: true,
      timeout: 120000,
    });*/
    await page.waitForFunction(
      (selector) => !!document.querySelector(selector),
      { timeout: 120000 }, // Increase timeout to 2 minutes
      selector
    );
    await page.screenshot({
      path: `Puppet/images/${projectName}-Test-${date}.png`,
    });
    console.log(`Screenshot: Puppet/images/${projectName}-Test-${date}.png `);

    await page.goto(
      "https://barboursmith.github.io/Abundance" +
        "/run/" +
        projectUser +
        "/" +
        projectName
    );
    await page.waitForFunction(
      (selector) => !!document.querySelector(selector),
      { timeout: 120000 }, // Increase timeout to 2 minutes
      selector
    );
    await page.screenshot({
      path: `Puppet/images/${projectName}-Deployed-${date}.png`,
    });

    console.log(
      `Screenshot: Puppet/images/${projectName}-Deployed-${date}.png`
    );
  }
  // Navigate to main.html
  const path = require("path");
  await page.goto(`file:${path.join(__dirname, "main.html")}`);
  console.log("navigated to: main.html");
  await page.screenshot({
    path: `Puppet/images/main.png`,
  });
}
