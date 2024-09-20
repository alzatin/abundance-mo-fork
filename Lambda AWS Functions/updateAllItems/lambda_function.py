
import boto3
import os
import json
import datetime


def lambda_handler(event: any, context: any):

    returnObject = {}

    # create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    # get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)

    item_array = []
    response = table.scan()
    item_array.extend(response.get('Items', []))

    newDate = datetime.datetime.now().strftime('%m/%d/%Y')
    yearNow = datetime.datetime.now().year
    updateExpressions = []

    for item in item_array:
        print(item)
        owner = item['owner']
        repoName = item['repoName']
        repoNameLower = repoName.lower()
        ownerLower = owner.lower()

        expressionAttributeValues = {
            ':dateModified': newDate,
            ':yyyy': yearNow,
            ':searchField': repoNameLower + " " + ownerLower,

        }

        response = table.update_item(
            Key={
                'owner': owner,
                'repoName': repoName
            },
            UpdateExpression='SET dateModified= :dateModified, yyyy = :yyyy, searchField = :searchField',
            ExpressionAttributeValues=expressionAttributeValues
        )

    returnObject['statusCode'] = 200
    returnObject['headers'] = {}
    returnObject["body"] = json.dumps("hello")
    returnObject['headers']['Content-Type'] = 'application/json'

    return returnObject
