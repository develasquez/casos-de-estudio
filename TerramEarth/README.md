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

Lo primeros establecer el nombre de tu proyecto en GCP para facilitar las cosas:

```sh
TU_PROYECTO=xxxxxxxx
```

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
    --project=${TU_PROYECTO} \
    --region=us-central1 \
    --event-notification-config=topic=te-tractor-topic \
    --state-pubsub-topic=te-tractor-state-topic
```

Ahora debemos crear el dispositivo, es decir, un tractor en particular.

```sh
gcloud iot devices create te-tractor-device \
  --project=${TU_PROYECTO} \
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
  --projectId=${TU_PROYECTO} \
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

![devicewise](./img/IoT_100_params.png)

Ahora veamos como podemos optimizar los costos para el proceso Batch que es 4 veces mas grande que el Streaming. 

### 3) Almacenamiento de Archivos

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


### 4) Almacenamiento de Datos

Ante de mover los datos desde Pub/Sub y Cloud Storage, debemos pensar en el almacenamiento definitivo de los datos para su análisis, dentro de todos los mecanismos de almacenamiento que tenemos en GCP el más indicado para cumplir con el requerimiento de TE es BigQuery. pero ¿por que?, que preguntas te debes hacer para determinar esto.

Te doy un par de trucos.

1) __Mira el diagrama de flujo__ que puse antes en la sección de Almacenamiento de Archivos.
2) __La relacion de los datos__:
* Si relacional, Cloud Sql, BigQuery, Spanner. 
* Si es No Relacional, Datastore, BigTable, Firestore.
3) __Piensa en el volumen de datos__: 
* Si es mayor a 10TB descarta Cloud SQL.
* Petabytes? BigQuery, Spanner, BigTable.
4) __El uso o consumo__:
* Si necesitas análisis, descarta Datastore, es poco queriable, no tiene funciones de agregación __SUM__, __AVG__, etc, no tiene __OR__ en los Where y tampoco __IN__ (<- esta es pregunta de cert) y los debes pedir uno a uno.
* Para analítica? por excelencia es BigQuery. 
* Realtime? usa firestore.
* TimeSeries? usa BitTable.
5) __Con que se conecta__: 
* Lo debes conectar a Data Studio, entonces piensa en Cloud Sql o BigQuery
* Una App Mobile? Firestore por excelencia
6) __Replicacion__:
* Una Zona? Todas
* Multi Zona? Cloud SQL
* Multi Regional? Por exelencia Spanner por la altisima consistencia, pero es caro caro, BigQuery (EU, US), En Roadmap Cloud SQL, por ahora no, si es No SQl, firestore y Datastore.

Por lo tanto, si el volumen de datos de TE es tan grande, debe ser accedido desde ambas costas de US y su objetivo principal es el análisis. Entonces creo que la aternativa es Big Query.

__Big Query__: Esta es una poderosa Base de datos muy similar a [Apache Hive](https://hive.apache.org/), la que permite consultar sobre Petabytes de datos en segundos. Se podría decir demasiado acerca de esta base de datos, pero no es el objetivo. Te invita a que veas sus características y limitaciones de cara a la certificación. Pero lo que tienes que saber es que Google le esta poniendo todo su cariño a este motor y busca convertira en un referente del mercado y es nos conviene mucho a nosotros. BigQuery hace que el trabajo sea muy facil para nosotos y se integra a la perfección el resto de la plataforma GCP. 

#### Manos a la Obra

Una de las grandes maravillas de Bigquery es que permite crear nuestros esquemas de base de datos de forma automática tomando como base un archivo, que puede ser CSV, JSON, Avro entre otros. E incluso lo hace si este esta comprimido. Una maravilla XD.

Para crear el [esquema de forma automática a partir de el archivo JSON](https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-json#loading_json_data_with_schema_auto-detection) que dejamos en Google Cloud Storage basta con ejecutar el sieguente comando.

```sh
bq --location=US load --autodetect --source_format=NEWLINE_DELIMITED_JSON terramearth.tractordata gs://$BUCKET_NAME/data.json.gz
```

Las ventajas de esto es que no debes complicarte creando el esquema a mano, en especial cuando es tan comlejo como es que queremos almacenar nosotros para TE.

Algo que tienes que tener en cuenta es que los datos deben estar en Json pero delimitados por un salto de línea, es decir, no es un Array con muchos objetos dentro separados por coma, sino un archivo que tiene un objeto JSON válido por cada línea.

Para ser un buen Arquitecto Cloud debes tener muchas consideraciones en especial con BigQuery, si piensas en la cantidad de datos almacenados, y las veces que se va a consumir esto puede costarle muy caro a TE. Así que veamos una serie de factores que nos ayudarán a optimizar esos costos. Te dejo un [articulo hermoso aquí!!!](https://medium.com/google-cloud/bigquery-optimized-cluster-your-tables-65e2f684594b), y las [buenas prácticas oficiales acá](https://cloud.google.com/bigquery/docs/best-practices-performance-compute) 

* Trata de no transformar datos con la query
* Usa aproximacion en las funciones de agregación por ejemplo, en vez de COUNT(DISTINCT), usa APPROX_COUNT_DISTINCT() 
* Aplica los filtros antes de Ordenar asi el ordenamiento se hace sobre menos data
* Clusteriza tus Tablas
* Trata de buscar campos relevante para la clusterizacion, Fechas o grupos grandes.
* Obliga a que se indique los valores del cluster en la query con __require_partition_filter=true__
* En la querys respeta el orden de los clusters
* Normaliza las tablas y usa correctamente los JOINS
* Usa GROUP BYs en base a los campos clusterizados
* Cuotas, puedes establecer límites en Bytes tanto a nivel de Proyectos, Datasets, Usuarios o Grupos en incluso por query.

Si somos descuidados con los precios podemos tener un desastre financiero, y ha pasado XD..
Fijate cuanto saldria si consideramos los 900TB por día por los 31 días del mes, tanto insertados, almacenados y queryados por solo 1 mes... Da más de 2 millos de dolares, lo que lo vuelve in viable.

<img src="./img/bq_price.png" alt="BQ Price" width=400>

Para que esta locura no ocurra sigue las buenas prácticas.

Algo maravilloso que incluyo hace porco BigQuery es la [__Tarifa Plana__](https://cloud.google.com/bigquery/pricing#flat_rate_pricing) seguramente a TE le convenga mucho este enfoque.


<img src="./img/flat_rate.png" alt="BQ Flat Rate" width=400>

Lo único que tendras que pagar adicional es el almacenamiento, que en este caso para los 27 Mil TB son como $600000 USD. Lo que hace pensar en que no se debe almacenar todos los datos sinó __solo lo que sirva para optimizar la compra de repuestos.__ 

Otra cosa que recomiendo de cara a la certificación es que estudies los permisos necesarios para usar Bigquery tanto dentro de tu mismo proyecto como desde un proyecto distinto (<- esto me lo preguntaron en la certificación)

Bueno ya tenemos nuestra Tabla en la Base de Datos y solo nos queda mover los datos desde Pub/Sub y Cloud Storage a BigQuery.


### 5) Procesamiento 

Venimos excelente con nustra implementación profesional de TerramEarth, y no será menos en el procesamiento de datos, para ello haremos uso de Dataflow, tanto para el proceso Batch como para el basado en eventos/streaming con Pub/Sub

La mejor ventaja que nos da Cloud Dataflow es que tiene plantillas que abordan los escenarios más comunes de movimiento y transformación de datos.

Para concocerlos mejor entra a la [documentacióna oficial de los Templates](https://cloud.google.com/dataflow/docs/guides/templates/provided-templates). Los que más nos sirven para este caso son:

* [Cloud Storage to BigQuery - Streaming](https://cloud.google.com/dataflow/docs/guides/templates/provided-templates#cloud-storage-text-to-bigquery-stream): Este es un job en Dataflow que lee desde un origen en Cloud Storage, desde un archivo que este en formato JSON, que incluso puede estar comprimido y lo transforma usando UDF para insertarlo en una tabla de BigQuery. La gran ventaja de este template que es en streaming o para entenderlo mejor, queda corriendo y en base a un patron identifica cuando se agrega un archivo al bucket y lo procesa inmediatamente.

Para poder implementar este Flujo lo primero es que se debe generar es el esquema de destino en la Base de datos, otra vez BigQuery nos hace el trabajo muy fácil. Para obtener este esquema basta con ejecutar:

```sh
bq show --format=prettyjson ${TU_PROYECTO}:terramearth.tractordata | jq '.schema.fields'
```

Tomamos el contenido que nos entrega este comando y lo guardamos en un archivo llamado __schema.json__ y luego lo subimos a un Storage.

```sh 
cd DataFlow;
gsutil mb gs://${BUCKET_NAME}-dataflow

gsutil cp schema.json gs://${BUCKET_NAME}-dataflow/
```

Y Una funcion de conversión UDF que en este caso no hace mucho. Pero si queires reducir los datos que insertas en BQ este es el lugar indicado...

```sh 
gsutil cp transform.js gs://${BUCKET_NAME}-dataflow/
```

Una vez que tienes los archivos arriba ejecutaremos el Job de Dataflow y lo dejaremos correindo en espera de nuevos archivos.

```sh
JOB_NAME_GCS=gcs_text_to_bigquery-`date +"%Y%m%d-%H%M%S%z"`

gcloud dataflow jobs run ${JOB_NAME_GCS} \
    --gcs-location gs://dataflow-templates/latest/Stream_GCS_Text_to_BigQuery \
    --parameters \
javascriptTextTransformFunctionName=transform,\
JSONPath=gs://${BUCKET_NAME}-dataflow/schema.json,\
javascriptTextTransformGcsPath=gs://${BUCKET_NAME}-dataflow/transform.js,\
inputFilePattern=gs://${BUCKET_NAME}/*.json.gz,\
outputTable=${TU_PROYECTO}:terramearth.tractordata,\
bigQueryLoadingTemporaryDirectory=gs://${BUCKET_NAME}-dataflow/temp

```
Asi se verá en Dataflow

<img src="./img/dataflow-gcs-bq.png" alt="GCS Flow" width=500>

Y para poder probar si funciona, debemos subir un archivo con nuevos datos, en este caso será el mismo pero con otro nombre, ya que lo que espera el flujo es un archivo que cumpla con el esquema JSON y con el patron de nombre \*.json.gz.


```sh
gsutil cp ./data.json.gz gs://$BUCKET_NAME/data_2.json.gz
```

Si vamos a BigQuery y sacamos un __Count__ deberiamos ver los 90000 registros inicialesy al finalizar el proceso deberíamos tener el doble.

```sql
select count(1) from `${TU_PROYECTO}.terramearth.tractordata`;
```



* [Cloud Pub/Sub to BigQuery - Streaming](https://cloud.google.com/dataflow/docs/guides/templates/provided-templates#cloud-pubsub-to-bigquery) Este es un Job un poco más sencillo, va a leer el tópico de Pub/Sub en el que escribe Cloud Iot Core y lo va a insertar en una tabla de BigQuery, al escuchar un tópico de Pub/Sub este proceso queda ecuchando y recibe en Streaming.

Para poder implementarlo es muy sencillo. Ejecuta el Siguente comando:

```sh
JOB_NAME_PUB_SUB=pubsub-to-bigquery-`date +"%Y%m%d-%H%M%S%z"`


gcloud dataflow jobs run ${JOB_NAME_PUB_SUB} \
    --gcs-location gs://dataflow-templates/latest/PubSub_to_BigQuery \
    --parameters \
inputTopic=projects/${TU_PROYECTO}/topics/te-tractor-topic,\
outputTableSpec=${TU_PROYECTO}:terramearth.tractordata

```

Asi se ve en Dataflow:

<img src="./img/dataflow-pub-sub-bq.png" alt="GCS Flow" width=500>

Y como podemos probar que funciona???, Fácil, solo hay que ejecutar el proceso de envio de eventos a IoT Core que usamos al comienzo. (Dale unos minutos para el el Flujo lebvante los workers)

```sh
#vuelve al directoro TerramEarth/IoT
cd ../IoT; 

# Emulamos en envio de 10 ensajes desde el tractor, puedes cambiar la cantidad pero creo que con 10 se entiende el concepto.

node cloudiot_mqtt_example_nodejs.js mqttDeviceDemo    \
  --projectId=${TU_PROYECTO} \
  --cloudRegion=us-central1 \
  --registryId=te-tractor  \
  --deviceId=te-tractor-device  \
  --privateKeyFile=resources/rsa_private.pem \
  --numMessages=10 \
  --algorithm=RS256
```


Podemos ver el resultado en Big Query, deberia haber aumentado en 10 la cantidad de registros.

```sql
select count(1) from `${TU_PROYECTO}.terramearth.tractordata`;
```

Viste que facil es usar Dataflow con los templates, ahora bien si quieres dar tus primeros pasos en Dataflow te recomiendo seguir esta [Guia](https://cloud.google.com/dataflow/docs/quickstarts/quickstart-java-maven).

Y para utilizar desde Eclipse con el Plugin de GCP debes crear una Cuenta de Servicios, para eso te dejo los comandos y los permisos mínimos necesarios para esto.


```sh
#Crea la cuenta de servicios
gcloud iam service-accounts create dataflow-batch \
	--display-name "dataflow-batch"

#Le asigna los roles necesarios que puede necesitar TE
gcloud projects add-iam-policy-binding ${TU_PROYECTO} \
  --member serviceAccount:dataflow-batch@${TU_PROYECTO}.iam.gserviceaccount.com \
  --role roles/dataflow.admin \
  --role roles/storage.objectAdmin
```

Los Roles que incluye Dataflow Admin son:


* dataflow.<resource-type>.list 
* dataflow.<resource-type>.get
* dataflow.jobs.create 
* dataflow.jobs.drain 
* dataflow.jobs.cancel
* compute.machineTypes.get 
* storage.buckets.get 
* storage.objects.create 
* storage.objects.get 
* storage.objects.list

Y se debe agregar permisos para sotrage

*  roles/storage.objectAdmin

Ahora bien para cargar estas credenciales en Eclipse debes crear una JSON con la Cuenta de Servicios, esto se hace con el sieguente comando:

```sh
gcloud iam service-accounts keys create dataflow_service_account.json \
  --iam-account dataflow-batch@${TU_PROYECTO}.iam.gserviceaccount.com
```

## __En próximas entregas veremos los siguientes puntos__

### 6) Visualización

### 7) Predicción