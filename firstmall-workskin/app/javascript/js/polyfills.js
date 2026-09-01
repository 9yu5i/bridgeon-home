if (typeof Array.prototype.indexOf !== 'function') {
	Array.prototype.indexOf = function (obj) {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == obj) {
				return i;
			}
		}
		return -1;
	}
}

if (!Object.keys) Object.keys = function (o) {
	if (o !== Object(o))
		throw new TypeError('Object.keys called on a non-object');
	var k = [], p;
	for (p in o) if (Object.prototype.hasOwnProperty.call(o, p)) k.push(p);
	return k;
}

if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function () {
		return this.replace(/^\s+|\s+$/g, '');
	}
}

String.prototype.byteLength = function (mode) {
	mode = (!mode) ? 'euc-kr' : mode;
	text = this;
	byte = 0;
	switch (mode) {
		case 'utf-8':
			for (byte = i = 0; char = text.charCodeAt(i++); byte += char >> 11 ? 3 : char >> 7 ? 2 : 1);
			break;
		default:
			for (byte = i = 0; char = text.charCodeAt(i++); byte += char >> 7 ? 2 : 1);
	}
	return byte
};

String.prototype.replaceAll = function (str1,str2){
	var str	= this;	 
	var result   = str.replace(eval("/"+str1+"/gi"),str2);
	return result;
}