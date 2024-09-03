import boto3
import os
import json
from datetime import datetime

def lambda_handler(event:any, context:any):
    
    
    returnObject = {}
    
    #create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    #get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    
    print(event)
    
    try:
        owner = event["owner"]
        repoName = event["repoName"]
        ranking =event["ranking"]
        forks = event["forks"]
        topMoleculeID =event["topMoleculeID"]
        topics = event["topics"]
        readMe = event["readme"]
        contentURL =event["contentURL"]
        svgURL =event["svgURL"]
        dateCreated = event["dateCreated"]   
        
        newYear = datetime.now().year
        print(newYear)
          
        table.put_item(Item={"owner": owner, "repoName": repoName, "ranking":ranking,"forks": forks, "topMoleculeID": topMoleculeID, "svgURL": svgURL, "topics":topics, "readMe":readMe,"dateCreated":dateCreated, "contentURL":contentURL, "yyyy": newYear})
        returnObject['statusCode']= 200
        message = "Success put item"  
        
    except:
        returnObject['statusCode']= 400
        message= 'no'
         
   
    returnObject['headers'] = {}
    returnObject["body"]= json.dumps("hello")
    returnObject['headers']['Content-Type'] = 'application/json'
    
    return returnObject
