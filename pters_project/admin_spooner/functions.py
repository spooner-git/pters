import boto3
from awscli.errorhandler import ClientError

from configs import settings


def func_upload_board_content_image_logic(file, file_name, user_id, user_group_type):

    # project_id = request.POST.get('project_id', '')
    # image = request.POST.get('upload_file', '')
    # context = {'error': None}
    bucket_name = getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", '')

    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(bucket_name)
    exists = True
    img_url = None

    try:
        s3.meta.client.head_bucket(Bucket=getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    except ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        # image_format, image_str = content.split(';base64,')
        # ext = image_format.split('/')[-1]

        # data = ContentFile(base64.b64decode(image_str), name='temp.' + ext)
        content = file.read()
        s3_img_url = 'board/'+user_group_type+'/content_img/'+str(user_id)+'/'+file_name
        bucket.put_object(Key=s3_img_url, Body=content, ContentType=file.content_type, ACL='public-read')
        img_url = 'https://s3.ap-northeast-2.amazonaws.com/'+bucket_name+'/'+s3_img_url

    return img_url


def func_delete_board_content_image_logic(file_name):

    # project_id = request.POST.get('project_id', '')
    # image = request.POST.get('upload_file', '')
    # context = {'error': None}
    bucket_name = getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", '')
    s3 = boto3.resource('s3', aws_access_key_id=getattr(settings, "PTERS_AWS_ACCESS_KEY_ID", ''),
                        aws_secret_access_key=getattr(settings, "PTERS_AWS_SECRET_ACCESS_KEY", ''))
    bucket = s3.Bucket(bucket_name)
    exists = True
    error_code = None

    try:
        s3.meta.client.head_bucket(Bucket=getattr(settings, "PTERS_AWS_S3_BUCKET_NAME", ''))
    except ClientError as e:
        # If a client error is thrown, then check that it was a 404 error.
        # If it was a 404 error, then the bucket does not exist.
        error_code = int(e.response['Error']['Code'])
        if error_code == 404:
            exists = False

    if exists is True:
        # image_format, image_str = content.split(';base64,')
        # ext = image_format.split('/')[-1]
        # data = ContentFile(base64.b64decode(image_str), name='temp.' + ext)
        file_name_split = file_name.split('https://pters-image-master.s3.ap-northeast-2.amazonaws.com/')
        if len(file_name_split) >= 2:
            s3_img_url = file_name.split('https://pters-image-master.s3.ap-northeast-2.amazonaws.com/')[1]
            objects_to_delete = [{'Key': s3_img_url}]
            try:
                bucket.delete_objects(
                    Delete={
                        'Objects': objects_to_delete
                    })
            except ClientError:
                error_code = '프로필 변경중 오류가 발생했습니다.'
        else:
            error_code = None
    return error_code
