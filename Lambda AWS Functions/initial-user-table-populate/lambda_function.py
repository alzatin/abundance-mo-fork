import boto3
import os
import json

def lambda_handler(event:any, context:any):

    returnObject = {}
    
    #create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    #get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    
    print(event)
    
    for x in event["users"]:
        user = x["user"]
        likedProjects = x["likedProjects"] 
        numProjectsOwned = x["numProjectsOwned"]
            
        table.put_item(Item={"user": user, "likedProjects": likedProjects, "numProjectsOwned": numProjectsOwned})
    returnObject['statusCode']= 200
    message = "Success put item"  
        
    
   
    returnObject['headers'] = {}
    returnObject["body"]= json.dumps('message')
    returnObject['headers']['Content-Type'] = 'application/json'
    
    return returnObject
