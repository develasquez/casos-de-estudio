#!/bin/bash

JOB_NAME_PUB_SUB=pubsub-to-bigquery-`date +"%Y%m%d-%H%M%S%z"`


gcloud dataflow jobs run ${JOB_NAME} \
    --gcs-location gs://dataflow-templates/latest/PubSub_to_BigQuery \
    --parameters \
inputTopic=projects/TU_PROYECTO/topics/te-tractor-topic,\
outputTableSpec=TU_PROYECTO:terramearth.tractordata


JOB_NAME_GCS=gcs_text_to_bigquery-`date +"%Y%m%d-%H%M%S%z"`

gcloud dataflow jobs run ${JOB_NAME_GCS} \
    --gcs-location gs://dataflow-templates/latest/Stream_GCS_Text_to_BigQuery \
    --parameters \
javascriptTextTransformFunctionName=transform,\
JSONPath=gs://terramearth-batch-dataflow/schema.json,\
javascriptTextTransformGcsPath=gs://terramearth-batch-dataflow/transform.js,\
inputFilePattern=gs://terramearth-batch/*.json.gz,\
outputTable=pocs-latam:terramearth.tractordata,\
bigQueryLoadingTemporaryDirectory=gs://terramearth-batch-dataflow/temp
