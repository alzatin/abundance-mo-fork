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

    # Construct update expression
    updateExpressions = []
    for key, value in event["attributeUpdates"].items():
        if (key == "likedProjects"):
            if (updateType == "SET"):
                updateExpressions.append(f'{key} = list_append({key}, :{key})')
            elif (updateType == "REMOVE"):
                # query the table, list liked items to find index then set update expression
                response = table.get_item(Key={"user": user},
                                          ProjectionExpression="likedProjects")
                likedProjects = response['Item']['likedProjects']
                indexOfLikedProject = likedProjects.index(value[0])
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

        elif (key == "numProjectsOwned"):
            updateExpressions.append(f'{key} = {key} + :{key}')
        else:
            updateExpressions.append(f'{key} = :{key}')

    expressionAttributeValues = {
        ':dateModified': newDate
    }
    for key, value in event["attributeUpdates"].items():
        expressionAttributeValues[":"+key] = value

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
    returnObject["body"] = json.dumps("hello")
    returnObject['headers']['Content-Type'] = 'application/json'

    return returnObject
