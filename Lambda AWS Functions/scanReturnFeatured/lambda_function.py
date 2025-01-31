import boto3
import os
import json
from boto3.dynamodb.conditions import Attr
from boto3.dynamodb.conditions import Key
import decimal
import datetime


def lambda_handler(event: any, context: any):

    # Get the current date and time
    now = datetime.datetime.now()
    year = now.year

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
                'Access-Control-Allow-Origin': "*"
            },
            'body': json.dumps(body, cls=DecimalEncoder)
        }

    # create a dynamodb client
    dynamodb = boto3.resource("dynamodb")
    # get the item from the table
    table_name = os.environ["TABLE_NAME"]
    table = dynamodb.Table(table_name)

    item_array = []

    try:

        query_args = {
            'IndexName': 'yyyy-ranking-index',
            'KeyConditionExpression': Key('yyyy').eq(year),
            'ScanIndexForward': False,
            'Limit': 10,
            'FilterExpression': ~(Attr('privateRepo').eq(True))
        }

        scan_args = {
            'IndexName': 'yyyy-ranking-index',
            'KeyConditionExpression': Key('yyyy').eq(year),
            'ScanIndexForward': False,
            'Limit': 10,
            'FilterExpression': ~(Attr('privateRepo').eq(True))
        }

        # response = table.scan(**scan_args)
        response = table.query(**query_args)
        item_array.extend(response.get('Items', []))
        print(item_array)

        return build_response(200, {'repos': item_array})
    except:
        print('Error')
        return build_response(400, e.response['Error']['Message'])
