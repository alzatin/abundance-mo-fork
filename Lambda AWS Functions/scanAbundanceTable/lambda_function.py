import boto3
import os
import json
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
import decimal

def lambda_handler(event:any, context:any):
    
    
    # Helper class to convert a DynamoDB item to JSON.
    class DecimalEncoder(json.JSONEncoder):
        def default(self, o):
            if isinstance(o, decimal.Decimal):
                if o % 1 > 0:
                    return float(o)
                else:
                    return int(o)
            return super(DecimalEncoder, self).default(o)
            
    def build_response(status_code, body):
        return {
            'statusCode': status_code,
            'headers': {
               'Content-Type': 'application/json',
               'Access-Control-Allow-Origin' : "*"
                 },
            'body': json.dumps(body, cls=DecimalEncoder)
        }
    
    def lookForLastEvaluatedKey():
        if lastKey: 
            lastKeyList = lastKey.split("~")
            lastKeyObj = {"repoName": lastKeyList[0],"owner":lastKeyList[1]}
            return lastKeyObj
        else:
            #need to change to null 
            return None
        
   
    #create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    #get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    
    user = event['queryStringParameters']['user']
    searchAttribute = event['queryStringParameters']['attribute']
    query = event['queryStringParameters']['query'] 
    lastKey = event['queryStringParameters']['lastKey'] 
    
    item_array = []
    
    
    try: 
        if (user):
            if (query):
                # Define the key condition expression
                key_condition_expression = Key('owner').eq(user) & Key('repoName').contains(query)
            else:
                key_condition_expression = Key('owner').eq(user)
            
            response = table.query(KeyConditionExpression=key_condition_expression)
            item_array.extend(response.get('Items', []))
        elif (searchAttribute and query):
            scan_args = {
                'FilterExpression': Attr('repoName').contains(query),
            }
            response = table.scan(**scan_args)
            item_array.extend(response.get('Items', []))
        else:
            exclusiveKey = lookForLastEvaluatedKey()
            query_args = {
                'IndexName':'yyyy-dateCreated-index',
                'KeyConditionExpression': Key('yyyy').eq(2024)
            }
            if exclusiveKey: 
                query_args['ExclusiveStartKey'] = exclusiveKey
            #response = table.scan(**scan_args)
            response = table.query(**query_args)
            item_array.extend(response.get('Items', []))
        
        lastKeyForward = ""
        if 'LastEvaluatedKey' in response:
            lastKeyForward = response.get('LastEvaluatedKey')
            print(response.get('LastEvaluatedKey'))
            
        return build_response(200, {'repos': item_array , "lastKey": lastKeyForward})
    except:
        print('Error')
        return build_response(400, response['Error']['Message'])
    
    
  
    
        
    
    

