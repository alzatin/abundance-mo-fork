import boto3
import os
import json
import datetime

def lambda_handler(event:any, context:any):
    
    returnObject = {}
    
    #create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    #get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    
    user = event["user"]
    newDate = datetime.datetime.now().strftime('%m/%d/%Y')
    
    #Construct update expression
    updateExpressions = []
    for key, value in event["attributeUpdates"].items():
        if (key == "likedProjects"):
            updateExpressions.append(f'{key} = list_append({key}, :{key})') 
        elif(key == "numProjectsOwned"):
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
        UpdateExpression='SET dateModified = :dateModified, ' + ", ".join(updateExpressions), 
        ExpressionAttributeValues= expressionAttributeValues
    )
    except Exception:
        raise Exception("Something is wrong")
        

    
    returnObject['statusCode']= 200
    returnObject['headers'] = {}
    returnObject["body"]= json.dumps("hello")
    returnObject['headers']['Content-Type'] = 'application/json'
    
    return returnObject

    
    
    