import boto3
import os
import json
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key


def lambda_handler(event: any, context: any):

    returnObject = {}

    # create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    # get the item from the table
    user_table = os.environ["USER_TABLE"]
    project_var = os.environ["ABUNDANCE_TABLE"]
    table = dynamodb.Table(user_table)
    project_table = dynamodb.Table(project_var)

    response = project_table.scan()
    print(response)
    item_array = []

    item_array.extend(response.get('Items', []))
    print(item_array)

   # Extracting all unique owners into a new array
    owners_array = list(set(item["owner"] for item in item_array))

    # Creating a dictionary for each owner
    owners_dict_array = [
        {
            "user": owner,
            "liked_projects": [],
            "num_projects_owned": sum(1 for item in item_array if item["owner"] == owner)
        }
        for owner in owners_array
    ]

    print(owners_dict_array)

    for x in owners_dict_array:
        user = x["user"]
        likedProjects = x["likedProjects"]
        numProjectsOwned = x["numProjectsOwned"]

        table.put_item(Item={"user": user, "likedProjects": likedProjects,
                       "numProjectsOwned": numProjectsOwned})

    returnObject['statusCode'] = 200
    message = "Success put item"

    returnObject['headers'] = {}
    returnObject["body"] = json.dumps('message')
    returnObject['headers']['Content-Type'] = 'application/json'

    return returnObject
