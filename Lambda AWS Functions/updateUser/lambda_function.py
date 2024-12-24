import boto3
import os
import json
import datetime
from boto3.dynamodb.conditions import Key


def lambda_handler(event: any, context: any):
    returnObject = {}

    # create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    # get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)

    user = event["user"]
    updateType = event["updateType"]
    newDate = datetime.datetime.now().strftime('%m/%d/%Y')

    # Check if user exists in the table
    response = table.get_item(Key={"user": user})
    if 'Item' not in response:
        # Add user to the table if not exists
        table.put_item(Item={"user": user, "dateModified": newDate,
                       "likedProjects": [], "numProjectsOwned": 0})
        response = table.get_item(Key={"user": user})

    # Construct update expression
    updateExpressions = []
    expressionAttributeValues = {}
    for key, value in event["attributeUpdates"].items():
        if key == "likedProjects":
            if updateType == "SET":
                updateExpressions.append(f'{key} = list_append({key}, :{key})')
                expressionAttributeValues[f':{key}'] = value
            elif updateType == "REMOVE":
                # query the table, list liked items to find index then set update expression
                response = table.get_item(
                    Key={"user": user}, ProjectionExpression="likedProjects")
                likedProjects = response['Item']['likedProjects']
                indexOfLikedProject = next((index for index, project in enumerate(
                    likedProjects) if project['owner'] == value[0]['owner'] and project['repoName'] == value[0]['repoName']), -1)

                print(indexOfLikedProject)
                try:
                    print(f'REMOVE likedProjects[{indexOfLikedProject}]')
                    response = table.update_item(
                        Key={'user': user},
                        UpdateExpression=f'REMOVE likedProjects[{indexOfLikedProject}]',
                    )
                    print("project removed")
                    returnObject['statusCode'] = 200
                    returnObject['headers'] = {}
                    returnObject["body"] = json.dumps("hello")
                    returnObject['headers']['Content-Type'] = 'application/json'

                    return returnObject

                except Exception:
                    raise Exception("Something is wrong in removing")

        elif key == "numProjectsOwned":
            updateExpressions.append(f'{key} = {key} + :{key}')
            expressionAttributeValues[f':{key}'] = 1  # Ensure increment by 1
        else:
            updateExpressions.append(f'{key} = :{key}')
            expressionAttributeValues[f':{key}'] = value

    expressionAttributeValues[':dateModified'] = newDate

    try:
        response = table.update_item(
            Key={'user': user},
            UpdateExpression='SET dateModified = :dateModified, ' +
            ", ".join(updateExpressions),
            ExpressionAttributeValues=expressionAttributeValues
        )
    except Exception:
        raise Exception("Something is wrong")

    returnObject['statusCode'] = 200
    returnObject['headers'] = {}
    returnObject["body"] = json.dumps("SET OR REMOVE COMPLETE")
    returnObject['headers']['Content-Type'] = 'application/json'

    return returnObject
