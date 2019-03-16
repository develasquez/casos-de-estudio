/*
node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo \
    --projectId=pocs-latam \
    --cloudRegion=us-central1 \
    --registryId=te-tractor \
    --deviceId=tractor-1 \
    --privateKeyFile=./resources/rsa_private.pem \
    --algorithm=RS256
*/


'use strict';
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mqtt = require('mqtt');
var MINIMUM_BACKOFF_TIME = 1;
var MAXIMUM_BACKOFF_TIME = 32;
var shouldBackoff = false;
var backoffTime = 1;
var publishChainInProgress = false;

console.log('Google Cloud IoT Core MQTT example.');
var argv = require(`yargs`)
  .options({
    projectId: {
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
    cloudRegion: {
      default: 'us-central1',
      description: 'GCP cloud region.',
      requiresArg: true,
      type: 'string',
    },
    registryId: {
      description: 'Cloud IoT registry ID.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    deviceId: {
      description: 'Cloud IoT device ID.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    privateKeyFile: {
      description: 'Path to private key file.',
      requiresArg: true,
      demandOption: true,
      type: 'string',
    },
    algorithm: {
      description: 'Encryption algorithm to generate the JWT.',
      requiresArg: true,
      demandOption: true,
      choices: ['RS256', 'ES256'],
      type: 'string',
    },
    tokenExpMins: {
      default: 20,
      description: 'Minutes to JWT token expiration.',
      requiresArg: true,
      type: 'number',
    },
    mqttBridgeHostname: {
      default: 'mqtt.googleapis.com',
      description: 'MQTT bridge hostname.',
      requiresArg: true,
      type: 'string',
    },
    mqttBridgePort: {
      default: 8883,
      description: 'MQTT bridge port.',
      requiresArg: true,
      type: 'number',
    },
  })
  .command(
    `mqttDeviceDemo`,
    `Connects a device, sends data, and receives data`,
    {
      messageType: {
        default: 'events',
        description: 'Message type to publish.',
        requiresArg: true,
        choices: ['events', 'state'],
        type: 'string',
      },
      numMessages: {
        default: 10,
        description: 'Number of messages to publish.',
        demandOption: true,
        type: 'number',
      },
    },
    opts => {
      mqttDeviceDemo(
        opts.deviceId,
        opts.registryId,
        opts.projectId,
        opts.cloudRegion,
        opts.algorithm,
        opts.privateKeyFile,
        opts.mqttBridgeHostname,
        opts.mqttBridgePort,
        opts.messageType,
        opts.numMessages
      );
    }
  )
  .example(
    `node $0 mqttDeviceDemo --projectId=blue-jet-123 \\\n\t--registryId=my-registry --deviceId=my-node-device \\\n\t--privateKeyFile=../rsa_private.pem --algorithm=RS256 \\\n\t--cloudRegion=us-central1 --numMessages=10 \\\n`
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/iot-core/docs`)
  .help()
  .strict().argv;

function createJwt(projectId, privateKeyFile, algorithm) {
  const token = {
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60,
    aud: projectId,
  };
  const privateKey = fs.readFileSync(privateKeyFile);
  return jwt.sign(token, privateKey, {algorithm: algorithm});
}
function publishAsync(
  mqttTopic,
  client,
  iatTime,
  messagesSent,
  numMessages,
  connectionArgs
) {
  if (messagesSent > numMessages || backoffTime >= MAXIMUM_BACKOFF_TIME) {
    if (backoffTime >= MAXIMUM_BACKOFF_TIME) {
      console.log('Backoff time is too high. Giving up.');
    }
    console.log('Closing connection to MQTT. Goodbye!');
    client.end();
    publishChainInProgress = false;
    return;
  }
  publishChainInProgress = true;
  var publishDelayMs = 0;
  if (shouldBackoff) {
    publishDelayMs = 1000 * (backoffTime + Math.random());
    backoffTime *= 2;
    console.log(`Backing off for ${publishDelayMs}ms before publishing.`);
  }

  setTimeout(function() {
    var getRandomMetric = require("./getRandomMetric").getRandomMetric;
    const payload = JSON.stringify(getRandomMetric())
    /*`${argv.registryId}/${
      argv.deviceId
    }-payload-${messagesSent}`*/;

    console.log('Publishing message:', payload);
    console.log('topic', mqttTopic);

    

    client.publish(mqttTopic, payload, {qos: 1}, function(err) {
      if (!err) {
        shouldBackoff = false;
        backoffTime = MINIMUM_BACKOFF_TIME;
      }
    });

    var schedulePublishDelayMs = argv.messageType === 'events' ? 1000 : 2000;
    setTimeout(function() {
      let secsFromIssue = parseInt(Date.now() / 1000) - iatTime;
      if (secsFromIssue > argv.tokenExpMins * 60) {
        iatTime = parseInt(Date.now() / 1000);
        console.log(`\tRefreshing token after ${secsFromIssue} seconds.`);

        client.end();
        connectionArgs.password = createJwt(
          argv.projectId,
          argv.privateKeyFile,
          argv.algorithm
        );
        connectionArgs.protocolId = 'MQTT';
        connectionArgs.protocolVersion = 4;
        connectionArgs.clean = true;
        client = mqtt.connect(connectionArgs);

        client.on('connect', success => {
          console.log('connect');
          if (!success) {
            console.log('Client not connected...');
          } else if (!publishChainInProgress) {
            publishAsync(
              mqttTopic,
              client,
              iatTime,
              messagesSent,
              numMessages,
              connectionArgs
            );
          }
        });

        client.on('close', () => {
          console.log('close');
          shouldBackoff = true;
        });

        client.on('error', err => {
          console.log('error', err);
        });

        client.on('message', (topic, message) => {
          console.log(
            'message received: ',
            Buffer.from(message, 'base64').toString('ascii')
          );
        });

        client.on('packetsend', () => {
        });
      }
      publishAsync(
        mqttTopic,
        client,
        iatTime,
        messagesSent + 1,
        numMessages,
        connectionArgs
      );
    }, schedulePublishDelayMs);
  }, publishDelayMs);
}

function mqttDeviceDemo(
  deviceId,
  registryId,
  projectId,
  region,
  algorithm,
  privateKeyFile,
  mqttBridgeHostname,
  mqttBridgePort,
  messageType,
  numMessages
) {
  const mqttClientId = `projects/${projectId}/locations/${region}/registries/${registryId}/devices/${deviceId}`;
  let connectionArgs = {
    host: mqttBridgeHostname,
    port: mqttBridgePort,
    clientId: mqttClientId,
    username: 'unused',
    password: createJwt(projectId, privateKeyFile, algorithm),
    protocol: 'mqtts',
    secureProtocol: 'TLSv1_2_method',
  };
  let iatTime = parseInt(Date.now() / 1000);
  console.log(connectionArgs);
  let client = mqtt.connect(connectionArgs);
  client.subscribe(`/devices/${deviceId}/config`, {qos: 1});

  client.subscribe(`/devices/${deviceId}/commands/#`, {qos: 0});

  const mqttTopic = `/devices/${deviceId}/${messageType}`;

  client.on('connect', success => {
    console.log('connect');
    if (!success) {
      console.log('Client not connected...');
    } else if (!publishChainInProgress) {
      publishAsync(mqttTopic, client, iatTime, 1, numMessages, connectionArgs);
    }
  });

  client.on('close', () => {
    console.log('close');
    shouldBackoff = true;
  });

  client.on('error', err => {
    console.log('error', err);
  });

  client.on('message', (topic, message) => {
    let messageStr = 'Message received: ';
    if (topic === `/devices/${deviceId}/config`) {
      messageStr = 'Config message received: ';
    } else if (topic === `/devices/${deviceId}/commands`) {
      messageStr = 'Command message received: ';
    }

    messageStr += Buffer.from(message, 'base64').toString('ascii');
    console.log(messageStr);
  });

  client.on('packetsend', () => {
  });

}

function attachDevice(deviceId, client, jwt) {
  const attachTopic = `/devices/${deviceId}/attach`;
  console.log(`Attaching: ${attachTopic}`);
  let attachPayload = '{}';
  if (jwt && jwt !== '') {
    attachPayload = `{ 'authorization' : ${jwt} }`;
  }

  client.publish(attachTopic, attachPayload, {qos: 1}, err => {
    if (!err) {
      shouldBackoff = false;
      backoffTime = MINIMUM_BACKOFF_TIME;
    } else {
      console.log(err);
    }
  });
}

function detachDevice(deviceId, client, jwt) {
  const detachTopic = `/devices/${deviceId}/detach`;
  console.log(`Detaching: ${detachTopic}`);
  let detachPayload = '{}';
  if (jwt && jwt !== '') {
    detachPayload = `{ 'authorization' : ${jwt} }`;
  }

  client.publish(detachTopic, detachPayload, {qos: 1}, err => {
    if (!err) {
      shouldBackoff = false;
      backoffTime = MINIMUM_BACKOFF_TIME;
    } else {
      console.log(err);
    }
  });
}