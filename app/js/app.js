var app = {};

app.translator = (function() {
	var alphabets = {
		'latin': [
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h',
			'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p',
			'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
			'y', 'z'
		],
		'albhed': [
			'y', 'p', 'l', 't', 'a', 'v', 'k', 'r',
			'e', 'z', 'g', 'm', 's', 'h', 'u', 'b',
			'x', 'n', 'c', 'd', 'i', 'j', 'f', 'q',
			'o', 'w'
		],
		'albhedPhonetics': [
			'ah', 'bae', 'ku', 'de', 'eay', 'fe', 'ge', 'ha',
			'ee', 'jae', 'kuk', 'lu', 'm', 'n', 'oh', 'pe',
			'q', 'ra', 'see', 'te', 'oo', 'fu', 'w', 'x',
			'ae', 'z'
		],
	};
	
	var vowels = [
		'a', 'e', 'i', 'o', 'u', 'y'
	];
	
	var startEscapeChar = '[';
	var endEscapeChar = ']';
	
	var isCharacterUppercase = function(character) {
		return character === character.toUpperCase();
	};
	
	var isCharacterVowel = function(character) {
		var isCharacterVowel = false;
		var vowelsIndex = 0;
		
		while (!isCharacterVowel && vowelsIndex < vowels.length) {
			if (character === vowels[vowelsIndex]) {
				isCharacterVowel = true;
			}
			vowelsIndex++;
		}
		
		return isCharacterVowel;
	};
	
	var getCharacterIndexInAlphabet = function(character, alphabet) {
		var currentAlphabet = alphabets[alphabet];
		var isCharacterFound;
		var characterIndex;
		
		if (currentAlphabet) {
			isCharacterFound = false;
			characterIndex = 0;
			
			while (!isCharacterFound && characterIndex < currentAlphabet.length) {
				if (character.toLowerCase() === currentAlphabet[characterIndex]) {
					isCharacterFound = true;
				}
				characterIndex++;
			}	
		}
		
		return (characterIndex && isCharacterFound) ? characterIndex : -1;
	};
	
	var getCharacterInAlphabet = function(charIndex, alphabet) {
		return alphabets[alphabet][charIndex] ? alphabets[alphabet][charIndex] : ''; 
	};
	
	var convertTo = function(text, oldAlphabet, newAlphabet, withPhonetics) {
		var textTranslation = '';
		var doesEscapeChars = false;
		var separateWord = false;
		
		for (charIndex = 0; charIndex < text.length; charIndex++) {
			var oldChar = text.substring(charIndex, charIndex + 1);
			var oldCharIndex = getCharacterIndexInAlphabet(oldChar, oldAlphabet);
			var newChar = '';
			
			if (oldChar === startEscapeChar) {
				doesEscapeChars = true;
			}
			else if (oldChar === endEscapeChar) {
				doesEscapeChars = false;
			}
			
			if (doesEscapeChars) {
				newChar = oldChar;
			}
			else {
				newChar = getCharacterInAlphabet(oldCharIndex - 1, newAlphabet);
				
				if (newChar === '') {
					newChar = oldChar;
					separateWord = false;
				}
				else {
					if (isCharacterUppercase(oldChar)) {
						newChar = newChar.toUpperCase();
					}
					
					if (newAlphabet === 'albhedPhonetics' && separateWord) {
						if (!isCharacterVowel(oldChar) && newChar.length > 1) {
							newChar = '-' + newChar;
						}
					}
					
					separateWord = true;
				}
			}
			
			textTranslation += newChar;
		}
		
		return textTranslation;
	};
	
	return {
		'convertTo': convertTo,
	};
})();

app.tbxInputText = (function() {
	var $this = $('textarea#tbxInputText');
	
	var init = function() {
		$this.bind('input', onChange);
	}
	
	var onChange = function(event) {
		$(document).trigger({
			'type': 'tbxInputTextChange',
			'text': getText(),
		});
	}
	
	var getText = function() {
		return $this.val();
	};
	
	return {
		'init': init,
		'getText': getText,
	};
})();

app.tbxOutputText = (function() {
	var $this = $('textarea#tbxOutputText');
	
	var init = function() {
		$(document).bind('tbxInputTextChange', onReceive);
	};
	
	var onReceive = function(event) {
		$this.val(app.translator.convertTo(event.text, 'latin', 'albhed'));
		$(document).trigger({
			'type': 'tbxAlbhedTextChange',
			'text': getText(),
		});
	};
	
	var getText = function() {
		return $this.val();
	};
	
	return {
		'init': init,
		'getText': getText,
	};
})();

app.tbxPhoneticText = (function() {
	var $this = $('textarea#tbxPhoneticText');
	
	var init = function() {
		$(document).bind('tbxAlbhedTextChange', onReceive);
	};
	
	var onReceive = function(event) {
		$this.val(app.translator.convertTo(event.text, 'latin', 'albhedPhonetics'));
	};
	
	var getText = function() {
		return $this.val();
	};
	
	return {
		'init': init,
		'getText': getText,
	};
})();

app.btnAudio = (function() {
	var $this = $('input#btnAudio');
	var GoogleTTSLanguage;
	var GoogleTTSBaseUrl;
	
	var init = function() {
		$(document).bind('tbxAlbhedTextChange', onChange);
		$(document).bind('lstLanguagesChange', onLanguageChange);
		$this.bind('click', onClick);
	};
	
	var onChange= function(event) {
		$this.attr('data-text', event.text);
	};
	
	var onLanguageChange = function(event) {
		setGoogleTTSUrl(event.language);
	};
	
	var onClick = function(event) {
		var clearText = encodeURIComponent($this.attr('data-text'));
		var audioUrl = GoogleTTSBaseUrl + clearText;
		var audio = document.createElement('audio');
		audio.src = audioUrl;
		audio.load();
		audio.play();
	};
	
	var getText = function() {
		return $this.val();
	};
	
	var setGoogleTTSUrl = function(language) {
		GoogleTTSBaseUrl = 'http://nicolascarreras.me/gateway.php?ie=utf-8&tl=' + language + '&q=';
	};
	
	return {
		'init': init,
		'getText': getText,
	};
})();

app.lstLanguages = (function() {
	var $this = $('select#lstLanguages');
	var defaultLanguage = 'en';
	var languages = {
      'af' : 'Afrikaans',
      'sq' : 'Albanian',
      'ar' : 'Arabic',
      'hy' : 'Armenian',
      'ca' : 'Catalan',
      'zh-CN' : 'Mandarin (simplified)',
      'zh-TW' : 'Mandarin (traditional)',
      'hr' : 'Croatian',
      'cs' : 'Czech',
      'da' : 'Danish',
      'nl' : 'Dutch',
      'en' : 'English',
      'eo' : 'Esperanto',
      'fi' : 'Finnish',
      'fr' : 'French',
      'de' : 'German',
      'el' : 'Greek',
      'ht' : 'Haitian Creole',
      'hi' : 'Hindi',
      'hu' : 'Hungarian',
      'is' : 'Icelandic',
      'id' : 'Indonesian',
      'it' : 'Italian',
      'ja' : 'Japanese',
      'ko' : 'Korean',
      'la' : 'Latin',
      'lv' : 'Latvian',
      'mk' : 'Macedonian',
      'no' : 'Norwegian',
      'pl' : 'Polish',
      'pt' : 'Portuguese',
      'ro' : 'Romanian',
      'ru' : 'Russian',
      'sr' : 'Serbian',
      'sk' : 'Slovak',
      'es' : 'Spanish',
      'sw' : 'Swahili',
      'sv' : 'Swedish',
      'ta' : 'Tamil',
      'th' : 'Thai',
      'tr' : 'Turkish',
      'vi' : 'Vietnamese',
      'cy' : 'Welsh'
	}
	
	var init = function() {
		for (var key in languages) {
			var $languageOption = $('<option>', {'class': 'optLanguage'});
			$languageOption.val(key);
			$languageOption.html(languages[key]);
			if (key === defaultLanguage) {
				$languageOption.attr('selected', 'selected');
			}
			$this.append($languageOption);
		}
		
		$this.bind('change', onChange);
		onChange();
	};
	
	var onChange = function() {
		$(document).trigger({
			'type': 'lstLanguagesChange',
			'language': $this.val(),
		});
	};
	
	return {
		'init': init,
	};
})();

$(document).bind('ready', function() {
	app.tbxInputText.init();
	app.tbxOutputText.init();
	app.tbxPhoneticText.init();
	app.btnAudio.init();
	app.lstLanguages.init();
});