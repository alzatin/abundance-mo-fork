import { Octokit } from "@octokit/rest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
  UpdateItemCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "abundance-projects";

export const handler = async (event, context) => {
  const octokit = new Octokit();

  const command = new ScanCommand({
    ProjectionExpression: "#ow, #repoName, #forks",
    ExpressionAttributeNames: {
      "#ow": "owner",
      "#repoName": "repoName",
      "#forks": "forks",
    },
    TableName: tableName,
  });

  const tableItems = await dynamo.send(command);

  let promises = tableItems.Items.map((repo) => {
    return checkGithub(repo.owner, repo.repoName, repo.forks); // Added return statement
  });
  await Promise.all(promises).then((results) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify("Github has been checked"),
    };
    return response;
  });

  async function checkUpdate(owner, repoName, forks, githubForks) {
    if (forks !== githubForks) {
      const params = {
        TableName: tableName,
        Key: {
          owner: owner,
          repoName: repoName,
        },
        UpdateExpression: "SET forks = :forks",
        ExpressionAttributeValues: {
          ":forks": githubForks,
        },
      };
      const command = new UpdateItemCommand(params);
      const responseUpdate = await client.send(command);
      return responseUpdate;
    }
  }

  async function checkGithub(owner, repoName, forks) {
    await octokit.rest.repos
      .get({
        owner: owner,
        repo: repoName,
      })
      .then((response) => {
        console.log(response.status);
        checkUpdate(owner, repoName, forks, response.data.forks_count);
        return response.status;
      })
      .catch((error) => {
        console.log(`${repoName} does not exist`);
        deleteFromTable(owner, repoName);
        //remove from table
        return;
      });
  }
  async function deleteFromTable(owner, repoName) {
    const params = {
      TableName: tableName,
      Key: {
        owner: owner,
        repoName: repoName,
      },
    };
    const command = new DeleteCommand(params);

    const response1 = await dynamo.send(command);
    console.log("deleting item");
    console.log(repoName);
    console.log(response1);
  }
};
