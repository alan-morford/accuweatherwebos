enyo.kind({
    name: "AccuWeather.LifestyleTraitDisplayStrings",
    kind: enyo.Component,
    published: {
    	titles: {},
    	goodScale: {},
    	badScale: {},
    	frizzScale: {}
    },

    create: function() {
    	this.titles["dogwalking"] = $LL("Dog Walking");
    	this.titles["outdoor"] = $LL("Outdoor Activity");
    	this.titles["barbeque"] = $LL("Barbeque");
    	this.titles["arthritis_daytime"] = $LL("Arthritis Risk");
    	this.titles["asthma"] = $LL("Asthma Risk");
    	this.titles["cold"] = $LL("Common Cold");
    	this.titles["flu"] = $LL("Flu Risk");
    	this.titles["grassgrowing"] = $LL("Grass Growing");
    	this.titles["lawnmowing"] = $LL("Lawn Mowing");
    	this.titles["migraine"] = $LL("Migraine Risk");
    	this.titles["mosquito"] = $LL("Mosquito Risk");
    	this.titles["running"] = $LL("Running");
    	this.titles["sinus"] = $LL("Sinus Risk");
    	this.titles["frizz"] = $LL("Hair Frizz Risk");
    	this.titles["beachgoing"] = $LL("Beachgoing");
    	this.titles["biking"] = $LL("Bicycling");
    	this.titles["outdoorconcert"] = $LL("Outdoor Concert");
    	this.titles["fishing"] = $LL("Fishing Forecast");
    	this.titles["golf"] = $LL("Golf Forecast");
    	this.titles["hiking"] = $LL("Hiking Forecast");
    	this.titles["jogging"] = $LL("Jogging Forecast");
    	this.titles["kiteflying"] = $LL("Kite Flying");
    	this.titles["running"] = $LL("Running");
    	this.titles["sailing"] = $LL("Sailing Forecast");
    	this.titles["skating"] = $LL("Skateboarding");
    	this.titles["skiing"] = $LL("Skiing Forecast");
    	this.titles["stargazing"] = $LL("Stargazing");
    	this.titles["tennis"] = $LL("Tennis Forecast");
    	
    	this.goodScale["low"] = $LL("Poor");
    	this.goodScale["med"] = $LL("Fair");
    	this.goodScale["high"] = $LL("Excellent");
    	
    	this.badScale["low"] = $LL("Low");
    	this.badScale["med"] = $LL("Moderate");
    	this.badScale["high"] = $LL("High");
    	
    	this.frizzScale["low"] = $LL("Low");
    	this.frizzScale["med"] = $LL("Moderate");
    	this.frizzScale["high"] = $LL("High");
    },
    
    convertNumberToGoodScale: function(number){
    	if (number < 3) {
    		return this.goodScale["low"];
    	}
        else if (number < 7) {
        	return this.goodScale["med"];
        }
        else {
        	return this.goodScale["high"];
        }
    },
    
    convertNumberToBadScale: function(number){
    	if (number < 3) {
    		return this.badScale["low"];
    	}
        else if (number < 7) {
        	return this.badScale["med"];
        }
        else {
        	return this.badScale["high"];
        }
    },
    
    convertNumberToFrizzScale: function(number){
    	if (number < 2) {
    		return this.frizzScale["low"];
    	}
        else if (number < 7) {
        	return this.frizzScale["med"];
        }
        else {
        	return this.frizzScale["high"];
        }
    }
});

global_LifestyleTraitDisplayStringInstance = new AccuWeather.LifestyleTraitDisplayStrings();

enyo.kind({
    name: "AccuWeather.LifestyleTrait",
    kind: enyo.Component,
    published: {
    	name: "",
    	value: 0,
    	displayName: "",
    	displayValue: "",
    	displayColorIndex: "",
		reverted: false,
    },

    create: function() {
    	this.inherited(arguments);
    }, 
    
    nameChanged: function() {
    	
    	var displayStrings = global_LifestyleTraitDisplayStringInstance;
    	this.displayName = displayStrings.getTitles()[this.name];
        
    },
    
    valueChanged: function() {
    	var displayStrings = global_LifestyleTraitDisplayStringInstance;
    	
    	// do value updates
    	if (this.name == "arthritis_daytime" ||
    			this.name == "asthma" ||
    			this.name == "cold" ||
    			this.name == "flu" ||
    			this.name == "migraine" ||
    			this.name == "mosquito" ||
    			this.name == "sinus") 
    	{
    		this.value = 9 - this.value; 
    	}
    
    	if (this.name == "frizz" ) {
    		this.value = 10 - (this.value * 2.5);
    	}
        
		var badScale = false;
		
		if (this.name == "arthritis_daytime" ||
        		this.name == "arthritis_nighttime" ||
        		this.name == "asthma" ||
        		this.name == "cold" ||
        		this.name == "flu" ||
        		this.name == "mosquito" ||
        		this.name == "migraine" ||
        		this.name == "sinus")
			badScale = true;
		
    	// set color index
		var value = this.value;
		
		if (badScale)
			value = 10 - value;
		
        if (value < 3) {
        	this.displayColorIndex = "redindex";
    	} else if (value < 7) { 
    		this.displayColorIndex = "yellowindex";
		} else { 
			this.displayColorIndex = "greenindex";
		}
        
        // set value display string
        if (this.name == "frizz") {
        	this.displayValue = displayStrings.convertNumberToFrizzScale(this.value);
        } else if (badScale) {
        	this.displayValue = displayStrings.convertNumberToBadScale(this.value);
        } else {
        	this.displayValue = displayStrings.convertNumberToGoodScale(this.value);
        }
    }
});

enyo.kind({
    name: "AccuWeather.LifestyleModel",
    kind: enyo.Component,
    published: {
    	lifestyleTraits: []
    },
    
    create: function(){
    	this.inherited(arguments);
    },
    
    initFromAppModel: function(appModel) {
    	this.log("initializing from Weather Model");
    	this.lifestyleTraits = [];
    	
    	var indices = appModel.getWeatherModel().getIndices();
    	var index = -1;
    	var count = 0;
    	var srcIndex=0;
    	var destIndex=0;
    	for (srcIndex=0,destIndex=0; srcIndex < indices.length; srcIndex++) {
    		var name = indices[srcIndex].name.toLowerCase().replace(" ", "");
    		
    		if (name =="indooractivity" ||
    				name == "travel" ||
    				name == "arthritis_nighttime") 
    		{
    			continue;
    		}

		
    		this.lifestyleTraits[destIndex] = new AccuWeather.LifestyleTrait();
    		this.lifestyleTraits[destIndex].setName(name);

			this.lifestyleTraits[destIndex].setValue(indices[srcIndex].value);
    		
    		if (name == "running") {
				if (index == -1) {
    				index = destIndex;
    			}
    			count++;
    		}
    		
    		destIndex++;
    	}
    	
    	// remove 1st "running" element
    	if (count > 1) {
    		this.lifestyleTraits.splice(index, 1);
    	}
    }
});
    