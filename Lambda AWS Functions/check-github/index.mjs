import { Octokit } from "@octokit/rest";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "abundance-projects";

export const handler = async (event, context) => {
  const octokit = new Octokit();

  /*Scans parameter to returns attributes owner, repoName, fork from all repositories in table*/
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

  var items = [];

  const scanExecute = async () => {
    try {
      let result;
      do {
        result = await dynamo.send(command);
        items = items.concat(result.Items);
        command.ExclusiveStartKey = result.LastEvaluatedKey;
      } while (result.LastEvaluatedKey);
      return items;
    } catch (err) {
      throw err;
    }
  };

  items = await scanExecute();

  let promises = items.map((repo) => {
    return checkGithub(repo.owner, repo.repoName, repo.forks);
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
      console.log("updating forks");
      const input = {
        ExpressionAttributeNames: {
          "#forks": "forks",
        },
        ExpressionAttributeValues: {
          ":forks": githubForks,
        },
        ReturnValues: "ALL_NEW",
        TableName: "abundance-projects",
        UpdateExpression: "SET #forks = :forks",
        Key: {
          owner: owner,
          repoName: repoName,
        },
      };
      const command = new UpdateCommand(input);
      dynamo
        .send(command)
        .then((response) => {
          console.log("Updated item " + owner + "/" + repoName);
          return response;
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  /* Makes request to github to check if repo exists, if it doesn't deletes from table, it it does updates in table*/
  async function checkGithub(owner, repoName, forks) {
    await octokit.rest.repos
      .get({
        owner: owner,
        repo: repoName,
      })
      .then((response) => {
        //console.log(repoName);
        checkUpdate(owner, repoName, forks, response.data.forks_count).then(
          (response) => {
            console.log("Check update ran");
            return response;
          }
        );
      })
      .catch((error) => {
        console.log(`${repoName} does not exist`);
        deleteFromTable(owner, repoName);
        //remove from table
        return;
      });
  }
  /*Removes non existent repos from table */
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
    console.log("deleting item" + owner + "/" + repoName);
  }
};
