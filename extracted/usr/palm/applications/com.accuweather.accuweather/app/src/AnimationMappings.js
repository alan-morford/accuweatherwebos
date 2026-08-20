// cloud types
var LIGHT = 1;
var MODERATE = 2;
var HEAVY = 3;
var HAZE = 4;
var FOG = 5;

// cloud / rain / snow amounts
var SOME = 1;
var MODERATE = 2;
var LOTS = 3;

// rain types
var RAIN = 1;
var HAIL = 2;
var FREEZING = 3;

/*
 * sun: true|false
 * moon: true|false
 * cloudType: null|LIGHT|MODERATE|HEAVY|HAZE|FOG
 * cloudAmount: null|SOME|MODERATE|LOTS
 * rainType: null|RAIN|HAIL|FREEZING
 * rainAmount: null|SOME|MODERATE|LOTS
 * lightning: true|false
 * snowAmount: null|SOME|MODERATE|LOTS
 * snowBase: true|false
 * ice: true|false
 * hot: true|false
 * cold: true|false
 * leaves: true|false
 * 
 */



var AnimationMappings = {
/*sun*/   "01": {id: "01", sun: true, moon: false, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "02": {id: "02", sun: true, moon: false, cloudType: LIGHT, cloudAmount: SOME, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "03": {id: "03", sun: true, moon: false, cloudType: MODERATE, cloudAmount: SOME, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "04": {id: "04", sun: true, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "05": {id: "05", sun: true, moon: false, cloudType: HAZE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "06": {id: "06", sun: true, moon: false, cloudType: MODERATE, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "07": {id: "07", sun: false, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "08": {id: "08", sun: false, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "11": {id: "11", sun: false, moon: false, cloudType: FOG, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "12": {id: "12", sun: false, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: RAIN, rainAmount: SOME, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "13": {id: "13", sun: true, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: RAIN, rainAmount: MODERATE, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "14": {id: "14", sun: true, moon: false, cloudType: LIGHT, cloudAmount: MODERATE, rainType: RAIN, rainAmount: MODERATE, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "15": {id: "15", sun: false, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: RAIN, rainAmount: MODERATE, lightning: true, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "16": {id: "16", sun: false, moon: false, cloudType: MODERATE, cloudAmount: LOTS, rainType: RAIN, rainAmount: MODERATE, lightning: true, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "17": {id: "17", sun: false, moon: false, cloudType: LIGHT, cloudAmount: MODERATE, rainType: RAIN, rainAmount: MODERATE, lightning: true, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "18": {id: "18", sun: false, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: RAIN, rainAmount: LOTS, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "19": {id: "19", sun: false, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: SOME, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "20": {id: "20", sun: true, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: SOME, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "21": {id: "21", sun: true, moon: false, cloudType: LIGHT, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: MODERATE, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "22": {id: "22", sun: false, moon: false, cloudType: MODERATE, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: LOTS, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "23": {id: "23", sun: false, moon: false, cloudType: MODERATE, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: LOTS, snowBase: true, ice: false, hot: false, cold: false, leaves: false},
/*ice*/	  "24": {id: "24", sun: false, moon: false, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: true, hot: false, cold: false, leaves: false},
		  "25": {id: "25", sun: false, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: HAIL, rainAmount: MODERATE, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "26": {id: "26", sun: false, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: FREEZING, rainAmount: MODERATE, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
		  "29": {id: "29", sun: false, moon: false, cloudType: MODERATE, cloudAmount: MODERATE, rainType: RAIN, rainAmount: LIGHT, lightning: false, snowAmount: SOME, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
/*hot*/	  "30": {id: "30", sun: true, moon: false, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: true, cold: false, leaves: false},
/*cold*/  "31": {id: "31", sun: true, moon: false, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: true, leaves: false},
/*leaves*/"32": {id: "32", sun: true, moon: false, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: true}, 		
/*moon*/  "33": {id: "33", sun: false, moon: true, cloudType: null, cloudAmount: null, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "34": {id: "34", sun: false, moon: true, cloudType: LIGHT, cloudAmount: SOME, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "35": {id: "35", sun: false, moon: true, cloudType: LIGHT, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "36": {id: "36", sun: false, moon: true, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "37": {id: "37", sun: false, moon: true, cloudType: FOG, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "38": {id: "38", sun: false, moon: true, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "39": {id: "39", sun: false, moon: true, cloudType: MODERATE, cloudAmount: MODERATE, rainType: RAIN, rainAmount: SOME, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "40": {id: "40", sun: false, moon: true, cloudType: MODERATE, cloudAmount: MODERATE, rainType: RAIN, rainAmount: SOME, lightning: false, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "41": {id: "41", sun: false, moon: false, cloudType: HEAVY, cloudAmount: MODERATE, rainType: RAIN, rainAmount: MODERATE, lightning: true, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "42": {id: "42", sun: false, moon: false, cloudType: HEAVY, cloudAmount: LOTS, rainType: RAIN, rainAmount: MODERATE, lightning: true, snowAmount: null, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "43": {id: "43", sun: false, moon: true, cloudType: MODERATE, cloudAmount: MODERATE, rainType: null, rainAmount: null, lightning: false, snowAmount: SOME, snowBase: false, ice: false, hot: false, cold: false, leaves: false},
          "44": {id: "44", sun: false, moon: true, cloudType: MODERATE, cloudAmount: LOTS, rainType: null, rainAmount: null, lightning: false, snowAmount: MODERATE, snowBase: true, ice: false, hot: false, cold: false, leaves: false}
};