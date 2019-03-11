# TerramEarth - Vista técnica a los casos de estudio de la certificación Profesional Cloud Architect 

El objetivo de este articulo no es evitar que tengas que estudiar por tu cuenta los casos de estudio, sino para ayudarte a ver los múltiples aspectos que se deben tener en cuenta al momento de analizar un proyecto de gran envergadura y de paso ver las implicancias técnicas detrás de cada uno de los componentes de la solución. Si sigues los pasos en tu cuenta gratuita de GCP te ayudará a estar mejor preparado para la certificación. 

## Caso de Estudio

Lo primero que debes hacer es analizar el caso de estudio de [TerramEarth](https://cloud.google.com/certification/guides/cloud-architect/casestudy-terramearth-rev2/). Este fue recientemente revisado para la actualización del examen que se realizo en Noviembre del 2018. 

Para resumir, TerramEarth cuanta con una gran flota de vehiculos Agricola/Mineros los cualers generan TB de datos, el 20% de estos vehiculos pueden enviar estos valores mediante conexión inalámbrica, mientras que el resto es enviado cuando el vehiculo entra en mantención.

La arquitectura de esta empresa esta dividida en dos flujos, el Batch y el Steaming, quedando algo similar a la siguiente imágen. Recuerda que esta es una solución tentativa ya que existen muchas forma de implementarla, te invito a ponerla a prueba y encontrar una mejor, te será de ayuda para la Cert.

![Diagra Arquitectura TerramEarth]()

Segun esto los componentes son los siguientes, cada uno te lleva a un Code Lab o Qwiklab para que experimentes con ellos.

* <a href="https://codelabs.developers.google.com/codelabs/cloud-upload-objects-to-cloud-storage/index.html?index=..%2F..index" target="_blank">Cloud Storage</a>


* [Cloud Storage](https://codelabs.developers.google.com/codelabs/cloud-upload-objects-to-cloud-storage/index.html?index=..%2F..index)

* [Functions](https://codelabs.developers.google.com/codelabs/cloud-starting-cloudfunctions/index.html?index=..%2F..index)

* [Dataflow Batch](https://www.qwiklabs.com/focuses/3460?catalog_rank=%7B%22rank%22%3A1%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=2129082)

* [BigQuery](https://codelabs.developers.google.com/codelabs/genomics-vcfbq/index.html?index=..%2F..index)

* [Data Studio](https://www.qwiklabs.com/focuses/1005?catalog_rank=%7B%22rank%22%3A5%2C%22num_filters%22%3A0%2C%22has_search%22%3Atrue%7D&parent=catalog&search_id=2128990)

* [BigQuery ML](https://codelabs.developers.google.com/codelabs/bqml-intro/index.html?index=..%2F..index)

* [IoT Core](https://codelabs.developers.google.com/codelabs/iot-data-pipeline/index.html?index=..%2F..index)

* [Pub/Sub](https://codelabs.developers.google.com/codelabs/cloud-spring-cloud-gcp-pubsub-integration/index.html?index=..%2F..index)

* [Dataflow Streaming](https://gist.github.com/maciekrb/9c73cb94a258e177e023dba9049dda13)


No hagas trampa, deja de leer y termina los laboratorios XD.

## Del papel a la Nube

Si ya hiciste los labs estas en condiciones de entrar en materia, vamos a hacer un análisis de cada uno de los pasos necesarios para llevar a TerramEarth a la Nube.


1) Pre Transferencia
	Para el caso de los vehiculos que se encuentran desconectados de la red, se espera un inmenso volúmen de datos diarios, es por eso que es necesario comprimir los datos antes de subirlos a la nube. Para ellos utilizaremos a modos de ejemplo 

2) Transferencia
	gsutil
	File Transfe
	Transfer Appliancia
	IoT Core 
		[MQTT](http://www.steves-internet-guide.com/mqtt-protocol-messages-overview/) 

3) Almacenamiento
	* Tipo
	* Costo
	* Politica

4) Procesamiento 
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

5) Almacenamiento
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

6) Visualizacion
	* Data Studio