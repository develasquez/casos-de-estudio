module.exports = {
	getRandomMetric: function(){ return {
    "schema": "http://json-schema.org/draft-04/schema#",
    "id": "http://snon.org/v2/snon-schema.json#",
    "definitions": {
        "message": {
            "properties": {
                "messageID":    "messageID" + Math.random(1,5) ,
                "mID":          "mID" + Math.random(1,5) ,
                "messageTime":  new Date() ,
                "mT":           "mT" + Math.random(1,5) ,
                "message":      "message" + Math.random(1,5) ,
                "m":            "m" + Math.random(1,5) 
                }
            },
            "dependencies": {
                "messageID": {
                    "required": ["messageTime", "message"],
                    "not":{"anyOf":[
                        {"required":["mID"]},
                        {"required":["mT"]},
                        {"required":["m"]}
                        ]}
                    },
                "mID": {
                    "required": ["mT", "m"],
                    "not":{"anyOf":[
                        {"required":["messageID"]},
                        {"required":["messageTime"]},
                        {"required":["message"]}
                        ]}
                    },
                "messageTime": ["messageID", "message"],
                "mT": ["mID", "m"],
                "message": ["messageID", "messageTime"],
                "m": ["mID", "mT"]
            },
            "additionalProperties": false
        },
        "fragment_long": {
            "properties": {
                "entityID":             "entityID" + Math.random(1,5) ,
                "entityClass":          "entityClass" + parseInt(Math.random(1,5) * 1000),
                "entityName":           "entityName" + Math.random(1,5) ,
                "entityType":           "entityType" + Math.random(1,5) ,
                "entityRelations":      "entityRelations" + Math.random(1,5) ,
                "precedentID":          "precedentID" + Math.random(1,5) ,
                "measureUnit":          "measureUnit" + parseInt(Math.random(1,5) * 1000),
                "measureType":          "measureType" + parseInt(Math.random(1,5) * 1000),
                "measureAcquire":       "measureAcquire" + parseInt(Math.random(1,5) * 1000),
                "measureUnitPrefix":    "measureUnitPrefix" + Math.random(1,5) ,
                "measureUnitSuffix":    "measureUnitSuffix" + Math.random(1,5) ,
                "measureUnitPrefixEx":  "measureUnitPrefixEx" + Math.random(1,5) ,
                "measureUnitSuffixEx":  "measureUnitSuffixEx" + Math.random(1,5) ,
                "measureLabel":         "measureLabel" + Math.random(1,5) ,
                "measureSpanLow":       "measureSpanLow" + Math.random(1,5) ,
                "measureSpanHigh":      "measureSpanHigh" + Math.random(1,5) ,
                "measureDisplayLow":    "measureDisplayLow" + Math.random(1,5) ,
                "measureDisplayHigh":   "measureDisplayHigh" + Math.random(1,5) ,
                "measureDisplayUnit":   "measureDisplayUnit" + Math.random(1,5) ,
                "measureUpdateRate":    "measureUpdateRate" + Math.random(1,5) ,
                "measureTimeout":       Math.random(1,5) ,
                "measureResolution":    "measureResolution" + Math.random(1,5) ,
                "measureAccuracy":      "measureAccuracy" + Math.random(1,5) ,
                "valueTime":            new Date() ,
                "value":                Math.random(1,5) ,
                "valueMax":             "valueMax" + Math.random(1,5) ,
                "valueMin":             "valueMin" + Math.random(1,5) ,
                "valueTimeout":         Math.random(1,5) ,
                "valueError":           "valueError" + parseInt(Math.random(1,5) * 1000),
                "extensions":           "Obj"
            },
            "dependencies": {
                "entityName": ["entityID"],
                "entityClass": ["entityID"],
                "entityRelations": ["entityID"],
                "valueTime": ["entityID"],
                "value": ["valueTime"],
                "valueMax": ["valueTime"],
                "valueMin": ["valueTime"],
                "valueTimeout": ["valueTime"],
                "valueError": ["valueTime"]
            },
            "additionalProperties": false      
        },
        "fragment_short": {
            "properties": {
                "eID":                  "eID" + Math.random(1,5) ,
                "eC":                   "eC" + parseInt(Math.random(1,5) * 1000),
                "eN":                   "eN" + Math.random(1,5) ,
                "eT":                   "eT" + Math.random(1,5) ,
                "eR":                   "eR" + Math.random(1,5) ,
                "pID":                  "pID" + Math.random(1,5) ,
                "meU":                  "meU" + parseInt(Math.random(1,5) * 1000),
                "meT":                  "meT" + parseInt(Math.random(1,5) * 1000),
                "meAq":                 "meAq" + parseInt(Math.random(1,5) * 1000),
                "meUP":                 "meUP" + Math.random(1,5) ,
                "meUS":                 "meUS" + Math.random(1,5) ,
                "meUPx":                "meUPx" + Math.random(1,5) ,
                "meUSx":                "meUSx" + Math.random(1,5) ,
                "meL":                  "meL" + Math.random(1,5) ,
                "meSL":                 "meSL" + Math.random(1,5) ,
                "meSH":                 "meSH" + Math.random(1,5) ,
                "meDL":                 "meDL" + Math.random(1,5) ,
                "meDH":                 "meDH" + Math.random(1,5) ,
                "meDU":                 "meDU" + Math.random(1,5) ,
                "meUR":                 "meUR" + Math.random(1,5) ,
                "meTo":                 "meTo" + Math.random(1,5) ,
                "meR":                  "meR" + Math.random(1,5) ,
                "meAc":                 "meAc" + Math.random(1,5) ,
                "vT":                   "vT" + Math.random(1,5) ,
                "v":                    "v" + Math.random(1,5) ,
                "vMax":                 "vMax" + Math.random(1,5) ,
                "vMin":                 "vMin" + Math.random(1,5) ,
                "vTo":                  "vTo" + Math.random(1,5) ,
                "vE":                   "vE" + parseInt(Math.random(1,5) * 1000),
                "ext":                  "Obj"
                },
            "dependencies": {
                "eN": ["eID"],
                "eC": ["eID"],
                "eR": ["eID"],
                "vT": ["eID"],
                "v": ["vT"],
                "vMax": ["vT"],
                "vMin": ["vT"],
                "vTo": ["vT"],
                "vE": ["vT"]
            },
            "additionalProperties": false
        }
};
}
};