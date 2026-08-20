__ac_stringPool = null;

function $LL(stringId) {

	if (__ac_stringPool  == null) {
		var localeName = enyo.g11n.currentLocale().language;

		if (localeName == "en")
			__ac_stringPool = __accuweather_translatons__en;
		else if (localeName == "de")
			__ac_stringPool = __accuweather_translatons__de;
		else if (localeName == "es")
			__ac_stringPool = __accuweather_translatons__es;
		else if (localeName == "fr")
			__ac_stringPool = __accuweather_translatons__fr;
		else if (localeName == "it")
			__ac_stringPool = __accuweather_translatons__it;
		else if (localeName == "pt") 
			__ac_stringPool = __accuweather_translatons__pt;
		else 
			__ac_stringPool = __accuweather_translatons__en;
	}
	return __ac_stringPool[stringId];
}
