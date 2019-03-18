# TerramEarth - Vista técnica a los casos de estudio de la certificación Profesional Cloud Architect 

El objetivo de este articulo no es evitar que tengas que estudiar por tu cuenta los casos de estudio, sino para ayudarte a ver los múltiples aspectos que se deben tener en cuenta al momento de analizar un proyecto de gran envergadura y de paso ver las implicancias técnicas detrás de cada uno de los componentes de la solución. Si sigues los pasos en tu cuenta gratuita de GCP te ayudará a estar mejor preparado para la certificación. 

## Caso de Estudio

Lo primero que debes hacer es analizar el caso de estudio de [TerramEarth](https://cloud.google.com/certification/guides/cloud-architect/casestudy-terramearth-rev2/). Este fue recientemente revisado para la actualización del examen que se realizo en Noviembre del 2018. 

Para resumir, TerramEarth cuanta con una gran flota de vehiculos Agricola/Mineros los cualers generan TB de datos por día, el 20% de estos vehiculos pueden enviar estas métricas mediante conexión inalámbrica, mientras que el resto es enviado cuando el vehiculo entra en mantención.

La arquitectura de esta empresa esta dividida en dos flujos, el Batch y el Steaming, quedando algo similar a la siguiente imágen. Recuerda que esta es una solución tentativa ya que existen muchas forma de implementarla, te invito a ponerla a prueba y encontrar una mejor, te será de mucha ayuda para la Cert.

![Diagra Arquitectura TerramEarth](https://cloud.google.com/iot-core/images/benefits-diagram_2x.png)

Hora te dejare un listado con cada uno de los componentes principales de la solución y un laboratorio (Codelabs o Qwicklab) para que lo conoscas masde cerca.


* [Cloud Storage](https://codelabs.developers.google.com/codelabs/cloud-upload-objects-to-cloud-storage/index.html?index=..%2F..index)

* [Functions](https://codelabs.developers.google.com/codelabs/cloud-starting-cloudfunctions/index.html?index=..%2F..index)

* [Dataflow Batch](https://www.qwiklabs.com/focuses/3460?catalog_rank=%7B%22rank%22%3A1%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=2129082)

* [BigQuery](https://codelabs.developers.google.com/codelabs/genomics-vcfbq/index.html?index=..%2F..index)

* [Data Studio](https://www.qwiklabs.com/focuses/1005?catalog_rank=%7B%22rank%22%3A5%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=2128990)

* [BigQuery ML](https://codelabs.developers.google.com/codelabs/bqml-intro/index.html?index=..%2F..index)

* [IoT Core 1](https://codelabs.developers.google.com/codelabs/iot-data-pipeline/index.html?index=..%2F..index)

* [IoT Core 2](https://codelabs.developers.google.com/codelabs/cloud-iot-core-overview/index.html?index=..%2F..index)

* [Pub/Sub](https://codelabs.developers.google.com/codelabs/cloud-spring-cloud-gcp-pubsub-integration/index.html?index=..%2F..index)

* [Dataflow Streaming](https://gist.github.com/maciekrb/9c73cb94a258e177e023dba9049dda13)


No hagas trampa, deja de leer y termina los laboratorios XD.

## Del papel a la Nube

Si ya hiciste los labs estas en condiciones de entrar en materia, vamos a hacer un análisis de cada uno de los pasos necesarios para llevar a TerramEarth a la Nube.


### 1) Pre Transferencia
Para el caso de los vehiculos que se encuentran desconectados de la red, se espera un inmenso volúmen de datos diarios, es por eso que es necesario comprimir los datos antes de subirlos a la nube. 

Para ellos utilizaremos datos de ejemplo basados en el esquema de [snon](http://www.snon.org/), puedes ver el archivo [example.data.json](https://github.com/develasquez/casos-de-estudio/blob/master/TerramEarth/example.data.json) a modo de ejemplo.

Para emular los datos generados por los vehículos, puedes ejecutar el script generateRandomMetrics.js, este generará un archivo llamado data.json, con 90000 registros de unos 120 campos cada uno, un total aprox de 312 MB.

```sh
#debes tener node.js instalado
node generateRandomMetrics.js > data.json
```

Recuerda que el punto importante en esta etapa es comprimir los datos para reducir los tiempos de transferencia, para ello utilizaremos __gzip__ los que generará un archivo llamado _data.json.gz_ que pesará unos 61.3 MB, una reducción superior al 80% del tamaño original. Se puede esperar los mismo en mayores volúmenes de datos, para el caso real de TerramEarth.

```sh
gzip data.json
```

Ok, ya tenemos los datos listos para subir a la nube, a jugar!!.

### 2) Transferencia

#### Tansferencia Batch

Excelente ahora subamos esos datos, pero el metodo de transferencia no es un juego, y esto es muy importante de cara al examen. 
Ten en cuenta que para el caso de TE (TerramEarth) se van a acumular unos __891 TB por día__ y debemos tomar una importante desicion, __¿Que mecanismo de transferencia utilizaremos?__ veamos que nos ofrece Google.


* __[Transfer Appliance](https://cloud.google.com/transfer-appliance/)__
Este metodo de transferencia consiste en que Google te envie un pendrive de unos 100 o 480 TB XD, fuera de broma, es un dispositivo rackeable, en el que puedes cargar tu data y enviarla de forma física y segura a Google Cloud. Esto ahorra mucho tiempo de carga, a un costo compuesto entre el servicio y el transporte desde el país de origen a Google.

![Diferencia de tiempo](https://cloud.google.com/images/transfer-appliance/transfer-appliance.gif)

Para el caso de TE esta solución no aplica ya que este sistema es para cargas One Time, pero TE necesita subir casi todos los días.

* __[Storage Transfer Service](https://cloud.google.com/storage-transfer/docs/overview)__
Este metodo de transferencia permite importar datos desde sistemas online, los cuales pueden ser [Amazon S3](https://aws.amazon.com/es/s3/), Google Cloud Storage o un origen HTTP o HTTPS hasta un Google Cloud Storage dentro de tu proyecto.

Para nuestra solución este mecanismo tampoco nos sirve ya que los datos se encuentran en los servidores físiscos de TE y no sería óptimo exponerlos por HTTP/S solo para poder transferirirlos con este mecanismo.


* __[gsutil](https://cloud.google.com/storage/docs/gsutil)__
Esta herramienta es muy versatil y poderosa, esta desarrollada en python y te da control absoluto de las acciones sobre Google Cloud Storage.

Lo que debes tener en cuenta es la velocidad de tu conexion a la red, el volumen de datos y el timepo que dispones para subirla.
Para ello TE debe utilizar el servicio de [Cloud Interconnect](https://cloud.google.com/hybrid-connectivity/), y elegir un tipo de concexión.

Dale un vistazo a las dos modalidades de [interconnect](https://cloud.google.com/interconnect/docs/how-to/choose-type)

* Dedicated Interconnect
* Partner Interconnect

Imaginemos que TE se va por Dedicated interconnect con una velocidad de entre 10 Gbps y 80 Gbps (Máximo permitido). 
Ahora tengamos las siguientes consideraciones, TE genera __981 TB diarios__ de datos, si estos son comprimidos con gzip se reducira tehoricamente en un 80%, quedando un total de __196.2 TB comprimidos__ dependiendo del tipo de concetividad, podría demorar entre 60 horas y 4 horas en el mejor de los casos (con 80 Gbps)

![transfer-speed](https://cloud.google.com/solutions/images/transfer-speed.png)

Pero no basta con solo tener una buena velocidad, sino que hay estrategias para [optimimizar la transferencia](https://medium.com/google-cloud/google-cloud-storage-large-object-upload-speeds-7339751eaa24), en este caso la más útil es la llamada __[parallel_composite_upload_threshold](https://cloud.google.com/storage/docs/gsutil/commands/cp)__, esto cortará tus archivos en pequeños chuncks, para aprovechar el envio en paralelo, lo que reduce por mucho el tiempo de subida. 

![big-data-single-threaded-transfer](https://cloud.google.com/solutions/images/big-data-single-threaded-transfer.svg)

![big-data-multithreaded-transfer](https://cloud.google.com/solutions/images/big-data-multithreaded-transfer.svg)

Para hacer la prueba, creemos un Bucket en nuestro proyecto, recuerda que el nombre debe ser único, reemplaza las XXXX por algo mágicamente único. 


```sh
BUCKET_NAME=terramearth-batch-XXXX
gsutil mb gs://$BUCKET_NAME

```

Ahora debes dar un valor a __parallel_composite_upload_threshold__ en MB, para nuestro ejemplo probemos con 15MB. 

```sh
gsutil -o GSUtil:parallel_composite_upload_threshold=15M cp ./data.json gs://$BUCKET_NAME
```

Esto va a crear múltiples hilos, los cuales subirán nuestro archivo de forma paralela en pequeños chunks de 15MB, realemente hermos verdad? XD.

Ahora veamos como sería este proceso para los vehículos que tiene conexion a intenet.

#### Transferencia Streaming

Dentro de la flota de TE existe un 20% de los vehiculos que cuenta con acceso a la red, lo que evita la acomulación de datos, y la necesidad de un proceso masivo. Muy por el contrario permite que estos datos se puedan procesar en streaming, cada vez que se van generando las muestras de sensores en los vehiculos estos son enviados en tiempo real a la nube.

Para esto debemos comprender el concepto de [IoT (Internet of Things)](https://es.wikipedia.org/wiki/Internet_de_las_cosas), el cual busca estandarizar la forma en la que los dispositivos/vehiculos/electrodomesticos se comunican y se gestionan a traves de la red.

Dentro de los [protocolos](https://cloud.google.com/iot/docs/concepts/protocols) más utilizados para esto se encuentran el [MQTT](http://www.steves-internet-guide.com/mqtt-protocol-messages-overview/) y el HTTP, y el componente que nos permite consumir estos en Google Cloud es [Cloud IoT Core](https://cloud.google.com/iot-core/)
	
Su funcionamiento en el caso de TE es bi-direccional, ya que permite recopilar los datos desde los vehículos, asi como enviar nuevas configuraciones a estos.

![MQTT Operation](https://codelabs.developers.google.com/codelabs/cloud-iot-core-overview/img/e7232d5c3c53d8f2.png)

Como se aprecia, estos datos en binario viajan haciendo uso de un [topico](https://cloud.google.com/pubsub/docs/publisher#pubsub-publish-message-nodejs) en [Pub/Sub](https://cloud.google.com/pubsub/) los que crearemos en unos instantes.

Para crear un registro de IoT core dentro de Google Cloud y poder hacer puebas con este, puedes utilizar el ejemplo que se encuentra en la carpeta IoT de este repositorio.

Dado que la seguridad es primordial en la nuebe, los dispositivos que quiera cominicarse con Cloud IoT core deben hacer uso de tokens de JWT los que deben incluir una clave privada la cual es validada contra la llave púbilca almacenada en la configuracion de IoT Core.

Para crear tus certificados autofirmados, puedes ejecutar el siguentes comando, aquí te dejo algo de [documentación](https://cloud.google.com/iot/docs/how-tos/credentials/keys) 

```sh
#si es que stas en otro directorio
cd IoT/resources; 
openssl req -x509 -nodes -newkey rsa:2048 -keyout rsa_private.pem -days 1000000 -out rsa_cert.pem -subj "/CN=unused"
```

Lo primero que debes tener en cuenta es que para Cloud IoT Core solo tienes disponibles tres regiones, us-central1, europe-west1, and asia-east1.

Recuerda que para este caso los [tópicos los debes crear](https://cloud.google.com/sdk/gcloud/reference/pubsub/topics/create?hl=es-419) antes que el registro de IoT Core. Estos tópicos seran los encargados de recibir como eventos cada uno de los mensajes que genere el dispositivo.

```sh
gcloud pubsub topics create te-tractor-topic;
gcloud pubsub topics create te-tractor-state-topic;
```


Cloud IoT Core permite la creación de registros para concentrar múltiples dispositivos con un objetivo o operativa en comun, en este caso crearemos el registro para los tractores.

```sh
gcloud iot registries create te-tractor \
    --project=TU_PROJECT_ID \
    --region=us-central1 \
    --event-notification-config=topic=te-tractor-topic \
    --state-pubsub-topic=te-tractor-state-topic
```

Ahora debemos crear el dispositivo, es decir, un tractor en particular.

```sh
gcloud iot devices create te-tractor-device \
  --project=TU_PROJECT_ID \
  --region=us-central1 \
  --registry=te-tractor \
  --public-key path=rsa_cert.pem,type=rs256
```

Para emular los datos generados por el tractor he modificado el [codigo de ejemplo](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/iot/mqtt_example) en NodeJs de IoT Core en Github, éste toma el template de los 120 campos en un JSON y los envía por MQTT hacia IoT Core que finalemente los injecta en el topico que creamos en Pub/Sub 

```sh
#vuelve al directoro TerramEarth/IoT
cd ..; 
#instalamos las dependencias

npm install 
# Emulamos en envio de 10 ensajes desde el tractor, puedes cambiar la cantidad pero creo que con 10 se entiende el concepto.

node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo    \
  --projectId=TU_PROJECT_ID \
  --cloudRegion=us-central1 \
  --registryId=te-tractor  \
  --deviceId=te-tractor-device  \
  --privateKeyFile=resources/rsa_private.pem \
  --numMessages=10 \
  --algorithm=RS256
```

Esto funciona de maravillas, aun que no tengas como verlo XD, si quisieras hacerlo te recomiendo lo siguente.
Crea un flujo en [DataFlow usando un template desde PubSub hacia Cloud Storage](https://cloud.google.com/dataflow/docs/guides/templates/provided-templates#cloudpubsubtogcstext), esto creara un Flujo en streaming que tomara los eventos enviados y los dejara en un archivo dentro de un bucket. Dado que no es el funcionamiento final que esperamos no documentare el proceso, pero funciona excelente y te animo a probarlo por tu cuente, en especial considerando que a esta altura estamos ciegos respecto a los mensajes que estan llegando al tópico.

Excelente ya logramos sacar los datos desde nuestros Tractores, tanto conectado como desconectados, pero para TE esto no es baratito, en realidad para ese volumen de datos es bastante caro.

Por ahora veremos el costo del proceso en streaming y a continuacion veremos como abaratar los costos del proceso batch.


#### Hablemos de plata 

Lo promero que tienes que tener presente es que si usas [Cloud IoT Core con Cloud Pub/Sub](https://cloud.google.com/iot/pricing), también se te facturará el consumo de recursos de Cloud Pub/Sub por separado.

Y considerando que TE genera __9TB__ de datos por dia, podemos entender que generará un total de __279TB__ mensuales, si los agregamos a la [calculadora de precios](https://cloud.google.com/products/calculator/#) de Google Cloud. 
A lo anterior debemos sumar el volumen de datos que se transmitirán por Pub/Sub que también son __279TB__, lo que da un total de __153,841.30 USD__, Wooow, mas de 150 mil dolares, solo por el proceso en Streaming, en la imágen a continuación puedes ver el detalle de cada uno de los componentes.

<img src="./img/IoT_streaming_price.png" alt="IoT_streaming_price" width=400>

A mi parecer es muy caro, me hace pensar en que tal vez esos datos son descomprimidos, sin envargo una de las grandes ventajas de MQTT es que es binario y comprime el payload cerca del 85%, lo que baja un poco el total trasnferido, buscando info encontre un [análisis de MQTT](https://help.devicewise.com/display/ARG/MQTT+data+usage) y su consumo y justo hay una estimación de 100 propiedades enviadas cada 1 hora, lo que da un aprox de __1.4MB__ mensual por dispositivo. Si lo multiplicamos por 4 millones de dispositivos (20% del total de la flota) da __5.6TB__ ,si recordamos que esto es para 100 campos le agregamos el 20% lo que da __6.72TB__ mensuales a traves de MQTT sobre Cloud IoT Core y llegando a Pub/Sub probablemente ya descomprimido. Así que hagamos otro cálculo.

<img src="./img/IoT_streaming_price_gziped.png" alt="IoT_streaming_price_gziped" width=400>

Esto si me hace más sentido, ya que de la otra forma IoT Core se vuelve inviable, creo, para cualquier compañia.
Asi que tengamos en cuanta en nustras estimaciones que los datos se reducen al enviarlos por MQTT. Te dejo los dos pantallazos que me ayudaron a descubrir esto.

![MQTTvsHTTP](./img/MQTTvsHTTP.png)

Y de este análisis genial en [Device Wise](https://help.devicewise.com/display/ARG/MQTT+data+usage)

![devicewise](./img/IoT_streaming_price_gziped.png)

Ahora veamos como podemos optimizar los costos para el proceso Batch que es 4 veces mas grande que el Streaming. 

### 3) Almacenamiento

Cada vez que tenemos que almacenar algo en la nube es muy importante que secojamos bien el tipo de almacenamiento que utilizaremos, este puede ser una Base de Datos en distintos tipos, un NFS y hasta un sistema de almacenamiento global como Cloud Storage.

Te dejo el [link a la documentación oficial](https://cloud.google.com/storage-options/) y un diagrama de flujo excelente que te ayudará a determinar que tipo de almacenamiento requiere tu solución, aprendetelo para la certificación te servirá mucho.

![Storage](https://cloud.google.com/images/storage-options/flowchart.svg)

Para el caso de TE utilizaremos claramente Cloud Storage, pero como ya sabrás existen [4 clases](https://cloud.google.com/storage/docs/storage-classes) de almacenamientos en este producto y una serie de buenas practicas que nos permitirán ahorrar unas [moneditas](https://cloud.google.com/storage/pricing) XD.

Te dejo un link a las [buenas prácticas](https://cloud.google.com/storage/docs/best-practices) que debes considerar al utilizar Cloud Storage.

El precio y caracteristicas de cada una de las clases es el siguiente


|Storage Class		|SLA	|Precio GB/Mes	|Acceso esperado|
|---				|---	|---			|---			|
|Multi-Regional		|99.95%	|$0.026			|En caliente	|
|[Dual-Region](https://cloud.google.com/storage/docs/locations#location-dr)*		|99.95%	|$0.026			|En caliente	|
|Regional			|99.9%	|$0.020			|En Caliente	|
|Nearline regional	|99.0%	|$0.010			|Una vez al mes	|
|Coldline regional	|99.0%	|$0.007			|Una vez al año	|

Si te preocupan esos SLA, ten presente que los Storages de Googles estan diseñados para cumplir un 99.999999999% (11 9's) de durabilidad anual, Logrado gracias a el almacenamiento redundante de objetos en múltiples dispositivos a lo largo de multiples zonas disponibles.

#### Estrategia de Storage TerramEarth

A mi parecer la mejor estrategia para este caso es un __Storage Regional__ el cual tendra un costo de __$0.020__ por Gb almacenado al mes, y una __[política de ciclo de vida](https://cloud.google.com/storage/docs/managing-lifecycles)__ que permita eliminar los archivos. Pero vamos por parte...

* Tipo

Lo primero que tenemos que hacer es cambiar el tipo de Storage desde Multi-Regional a Regional, la docu [aquí](https://cloud.google.com/storage/docs/changing-storage-classes)

```sh
gsutil rewrite -s regional -r gs://$BUCKET_NAME/**
```
Segun la documentacion debía ser así per me da error:


	BadRequestException: 400 The combination of locationConstraint and storageClass you provided is not supported for your project

Asi que la mejor solución a esta altura es crearlo de cero directamente regional.

```sh
# Para eliminar el bucket

gsutil rm -r gs://$BUCKET_NAME

# Para crearlo regional en 

gsutil mb -c regional -l us-central1 gs://$BUCKET_NAME/
```

ya tenemos el bucket en una región, la misma que IoT Core us-central1, lo que nos queda es crear una política para que elimine los archivos.

* Politica

Creo que lo mejor es conservarlo 2 días, en caso que el proceso Batch no funcione a la primera. Para ello debemos crear un archivo Json con el siguente contenido, creo que se explica solo. Y como simpre aquí te dejo la [documentacion](https://cloud.google.com/storage/docs/managing-lifecycles)

```json
{
	"lifecycle": {
	  "rule": [
	  {
	    "action": {"type": "Delete"},
	    "condition": {
	      "age": 2,
	      "isLive": true
	    }
	  }
	]
	}
}
```

Para aplicar la política debemos usar el siguiente comando:

```sh
gsutil lifecycle set lifecycle.json gs://$BUCKET_NAME
```

Esto nos permitirá controlar un poco el costo ya que los archivos durarán máximo 2 días. Igualente esto nos mueve un tanto la aguja en los costos asi que veamos cuanto sale tener estos datos en Cloud Storage.

* Costos

Recuerda que TE genera un total de __196.2TB__ comprimidos diarios, y si estos se mantienen por dos días normalmente tendras el doble de datos almacenados normalmente.

Si calculamos el costo de estos dato, __392.4TB__ permanentemente almacenados por mes en storage regional nos da:

<img src="./img/storage_price.png" alt="storage_price" width=400>

La pequeña suma de 8 mil dolares XD, de todas formas podria haber sido más caro si no hubieramos aplicado la compresión, el cambio de clase y la política de borrado automático.


### 4) Procesamiento 

	TextIO.read().from(filepattern)


* Function
	+ Cantidad de Ejecuciones
* Composer + Dataflow
	+ Workers
* Dataflow
	+ Workers

* Acciones sobre la data
	+ Un Zip
	+ Limpiera
	+ Nutrir
	+ Normalizar v/s D.W
	+ Almacenar
	+ Descartar

### 5) Almacenamiento
* BigQuery
	+ Objetivo
	+ Esquema
	+ Precio
	+ Optimizacion
		- Clusterizacion
	+ Cuotas
	+ Sub Tablas
	+ Permisos desde proyestos externos
* BigTable
	+ Objetivo
	+ Esquema
	+ Precio
	+ Optimizacion
	+ Cuotas
	+ Permisos

### 6) Visualizacion
* Data Studio