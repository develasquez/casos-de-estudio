bigquery.defineFunction(
	'tractordata', [
		'schema',
		'id',
		'messageID',
		'mID',
		'messageTime',
		'mT',
		'message',
		'm',
		'entityID',
		'entityClass',
		'entityName',
		'entityType',
		'entityRelations',
		'precedentID',
		'measureUnit',
		'measureType',
		'measureAcquire',
		'measureUnitPrefix',
		'measureUnitSuffix',
		'measureUnitPrefixEx',
		'measureUnitSuffixEx',
		'measureLabel',
		'measureSpanLow',
		'measureSpanHigh',
		'measureDisplayLow',
		'measureDisplayHigh',
		'measureDisplayUnit',
		'measureUpdateRate',
		'measureTimeout',
		'measureResolution',
		'measureAccuracy',
		'valueTime',
		'value',
		'valueMax',
		'valueMin',
		'valueTimeout',
		'valueError',
		'extensions'
	], // Input column names

	// JSON representation of the output schema
	[{
		name: 'schema',
		type: 'string'
	}, {
		name: 'id',
		type: 'string'
	}, {
		name: 'messageID',
		type: 'string'
	}, {
		name: 'mID',
		type: 'string'
	}, {
		name: 'messageTime',
		type: 'string'
	}, {
		name: 'mT',
		type: 'string'
	}, {
		name: 'message',
		type: 'string'
	}, {
		name: 'm',
		type: 'string'
	}, {
		name: 'entityID',
		type: 'string'
	}, {
		name: 'entityClass',
		type: 'string'
	}, {
		name: 'entityName',
		type: 'string'
	}, {
		name: 'entityType',
		type: 'string'
	}, {
		name: 'entityRelations',
		type: 'string'
	}, {
		name: 'precedentID',
		type: 'string'
	}, {
		name: 'measureUnit',
		type: 'string'
	}, {
		name: 'measureType',
		type: 'string'
	}, {
		name: 'measureAcquire',
		type: 'string'
	}, {
		name: 'measureUnitPrefix',
		type: 'string'
	}, {
		name: 'measureUnitSuffix',
		type: 'string'
	}, {
		name: 'measureUnitPrefixEx',
		type: 'string'
	}, {
		name: 'measureUnitSuffixEx',
		type: 'string'
	}, {
		name: 'measureLabel',
		type: 'string'
	}, {
		name: 'measureSpanLow',
		type: 'string'
	}, {
		name: 'measureSpanHigh',
		type: 'string'
	}, {
		name: 'measureDisplayLow',
		type: 'string'
	}, {
		name: 'measureDisplayHigh',
		type: 'string'
	}, {
		name: 'measureDisplayUnit',
		type: 'string'
	}, {
		name: 'measureUpdateRate',
		type: 'string'
	}, {
		name: 'measureTimeout',
		type: 'string'
	}, {
		name: 'measureResolution',
		type: 'string'
	}, {
		name: 'measureAccuracy',
		type: 'string'
	}, {
		name: 'valueTime',
		type: 'string'
	}, {
		name: 'value',
		type: 'string'
	}, {
		name: 'valueMax',
		type: 'string'
	}, {
		name: 'valueMin',
		type: 'string'
	}, {
		name: 'valueTimeout',
		type: 'string'
	}, {
		name: 'valueError',
		type: 'string'
	}, {
		name: 'extensions',
		type: 'string'
	}],

	function(row, emit) {
		emit({
			schema: row.schema,
			id: row.id,
			messageID: row.definitions.message.properties.messageID,
			mID: row.definitions.message.properties.mID,
			messageTime: row.definitions.message.properties.messageTime,
			mT: row.definitions.message.properties.mT,
			message: row.definitions.message.properties.message,
			m: row.definitions.message.properties.m,
			entityID: fragment_long.properties.entityID,
			entityClass: row.fragment_long.properties.entityClass,
			entityName: row.fragment_long.properties.entityName,
			entityType: row.fragment_long.properties.entityType,
			entityRelations: row.fragment_long.properties.entityRelations,
			precedentID: row.fragment_long.properties.precedentID,
			measureUnit: row.fragment_long.properties.measureUnit,
			measureType: row.fragment_long.properties.measureType,
			measureAcquire: row.fragment_long.properties.measureAcquire,
			measureUnitPrefix: row.fragment_long.properties.measureUnitPrefix,
			measureUnitSuffix: row.fragment_long.properties.measureUnitSuffix,
			measureUnitPrefixEx: row.fragment_long.properties.measureUnitPrefixEx,
			measureUnitSuffixEx: row.fragment_long.properties.measureUnitSuffixEx,
			measureLabel: row.fragment_long.properties.measureLabel,
			measureSpanLow: row.fragment_long.properties.measureSpanLow,
			measureSpanHigh: row.fragment_long.properties.measureSpanHigh,
			measureDisplayLow: row.fragment_long.properties.measureDisplayLow,
			measureDisplayHigh: row.fragment_long.properties.measureDisplayHigh,
			measureDisplayUnit: row.fragment_long.properties.measureDisplayUnit,
			measureUpdateRate: row.fragment_long.properties.measureUpdateRate,
			measureTimeout: row.fragment_long.properties.measureTimeout,
			measureResolution: row.fragment_long.properties.measureResolution,
			measureAccuracy: row.fragment_long.properties.measureAccuracy,
			valueTime: row.fragment_long.properties.valueTime,
			value: row.fragment_long.properties.value,
			valueMax: row.fragment_long.properties.valueMax,
			valueMin: row.fragment_long.properties.valueMin,
			valueTimeout: row.fragment_long.properties.valueTimeout,
			valueError: row.fragment_long.properties.valueError,
			extensions: row.fragment_long.properties.extensions,
		});
	}
);