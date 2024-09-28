import { Octokit } from "@octokit/rest";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "abundance-projects";

export const handler = async (event, context) => {
  const octokit = new Octokit();

  const command = new ScanCommand({
    ProjectionExpression: "#ow, #repoName",
    ExpressionAttributeNames: { "#ow": "owner", "#repoName": "repoName" },
    TableName: tableName,
  });

  const tableItems = await dynamo.send(command);

  let promises = tableItems.Items.map((repo) => {
    return checkGithub(repo.owner, repo.repoName); // Added return statement
  });
  await Promise.all(promises).then((results) => {
    const response = {
      statusCode: 200,
      body: JSON.stringify("Github has been checked"),
    };
    return response;
  });

  function updateTable() {
    const params = {
      TableName: tableName,
      Key: {
        owner: "alzatin",
      },
      UpdateExpression: "SET status = :status",
      ExpressionAttributeValues: {
        ":status": "FALSE",
      },
    };
  }

  async function checkGithub(owner, repoName) {
    await octokit.rest.repos
      .get({
        owner: owner,
        repo: repoName,
      })
      .then((response) => {
        console.log(response.status);
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
