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
        
   
    #create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    #get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)
    
    user = event['queryStringParameters']['user']
    
    item_array = []
    
    try:
        
        if (user):
            key_condition_expression = Key('user').eq(user)
            
            response = table.query(KeyConditionExpression=key_condition_expression)
            item_array.extend(response.get('Items', []))
                
        return build_response(200,  item_array)
        
    except ClientError as e:
        print('Error:', e)
        return build_response(400, e.response['Error']['Message'])
  
    
        
    
    

