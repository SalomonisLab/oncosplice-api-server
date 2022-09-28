function removeNewlinesAndUnderscores(inputString){
	inputString = inputString.replace(/_/g, "");
	inputString = inputString.replace(/\n|\r/g, "");
	return inputString;
}

function changeSpecialCharsToBlank(inputString){
	inputString = inputString.replace(/\.|\-/g, "_");
	inputString = inputString.replace(/_/g, " ");
	inputString = inputString.toLowerCase();
	inputString = inputString.replace(/\n|\r/g, "");
	return inputString;
}

function cleanUpTranslator(inputString){

	inputString = inputString.replace(/\.|\-|\(|\)/g, "_");
	inputString = inputString.replace(/\r|\n|_txt/g, "");
	return inputString;
}

function convertToUnderscores(inputString){
	inputString = inputString.replace(/\.|\-|\(/g, "_");
	inputString = inputString.replace(/)\s/g, "__");
	inputString = inputString.replace(/)/g, "_");
	return inputString;
}


module.exports.removeNewlinesAndUnderscores = removeNewlinesAndUnderscores;
module.exports.changeSpecialCharsToBlank = changeSpecialCharsToBlank;
module.exports.cleanUpTranslator = cleanUpTranslator;
module.exports.convertToUnderscores = convertToUnderscores;