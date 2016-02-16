var root=this;function dumpCollections(b){for(var a in b){console.info(b[a])}}var Readability=function(b,c,a){a=a||{};this._articleMinimumSize=a.articleMinimumSize;this._linkDensity=a.linkDensity;this._uri=b;this._doc=c;this._biggestFrame=false;this._articleByline=null;this._articleDir=null;this._specialTreatment=a.specialTreatment;this._debug=!!a.debug;this._maxElemsToParse=a.maxElemsToParse||this.DEFAULT_MAX_ELEMS_TO_PARSE;this._nbTopCandidates=a.nbTopCandidates||this.DEFAULT_N_TOP_CANDIDATES;this._maxPages=a.maxPages||this.DEFAULT_MAX_PAGES;this._flags=this.FLAG_STRIP_UNLIKELYS|this.FLAG_WEIGHT_CLASSES|this.FLAG_CLEAN_CONDITIONALLY;this._parsedPages={};this._pageETags={};this._curPageNum=1;if(this._debug){function d(h){var i=h.nodeName+" ";if(h.nodeType==h.TEXT_NODE){return i+'("'+h.textContent+'")'}var f=h.className&&("."+h.className.replace(/ /g,"."));var g=h.id?"(#"+h.id+f+")":(f?"("+f+")":"");return i+g}this.log=function(){if("dump" in root){var f=Array.prototype.map.call(arguments,function(g){return(g&&g.nodeName)?d(g):g}).join(" ");dump("Reader: (Readability) "+f+"\n")}else{if("console" in root){var e=["Reader: (Readability) "].concat(arguments);console.log.apply(console,e)}}}}else{this.log=function(){}}};Readability.prototype={FLAG_STRIP_UNLIKELYS:1,FLAG_WEIGHT_CLASSES:2,FLAG_CLEAN_CONDITIONALLY:4,DEFAULT_MAX_ELEMS_TO_PARSE:0,DEFAULT_N_TOP_CANDIDATES:5,DEFAULT_MAX_PAGES:5,DEFAULT_TAGS_TO_SCORE:"section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),REGEXPS:{unlikelyCandidates:/banner|combx|comment|community|disqus|extra|foot|header|menu|related|remark|rss|share|shoutbox|sidebar|skyscraper|sponsor|ad-break|agegate|pagination|pager|popup/i,okMaybeItsACandidate:/and|article|body|column|main|shadow/i,positive:/article|body|content|entry|hentry|main|page|pagination|post|text|blog|story/i,negative:/hidden|banner|combx|comment|com-|contact|foot|footer|footnote|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|tool|widget/i,extraneous:/print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,byline:/byline|author|dateline|writtenby/i,replaceFonts:/<(\/?)font[^>]*>/gi,normalize:/\s{2,}/g,videos:/\/\/(www\.)?(dailymotion|youtube|youtube-nocookie|player\.vimeo)\.com/i,nextLink:/(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,prevLink:/(prev|earl|old|new|<|«)/i,whitespace:/^\s*$/,hasContent:/\S$/},DIV_TO_P_ELEMS:["A","BLOCKQUOTE","DL","DIV","IMG","OL","P","PRE","TABLE","UL","SELECT"],ALTER_TO_DIV_EXCEPTIONS:["DIV","ARTICLE","SECTION","P"],_postProcessContent:function(a){this._fixRelativeUris(a)},_forEachNode:function(a,b){return Array.prototype.forEach.call(a,b,this)},_someNode:function(a,b){return Array.prototype.some.call(a,b,this)},_concatNodeLists:function(){var c=Array.prototype.slice;var a=c.call(arguments);var b=a.map(function(d){return c.call(d)});return Array.prototype.concat.apply([],b)},_getAllNodesWithTag:function(b,a){if(b.querySelectorAll){return b.querySelectorAll(a.join(","))}return[].concat.apply([],a.map(function(c){return b.getElementsByTagName(c)}))},_fixRelativeUris:function(d){var c=this._uri.scheme;var a=this._uri.prePath;var e=this._uri.pathBase;function g(h){if(/^[a-zA-Z][a-zA-Z0-9\+\-\.]*:/.test(h)){return h}if(h.substr(0,2)=="//"){return c+"://"+h.substr(2)}if(h[0]=="/"){return a+h}if(h.indexOf("./")===0){return e+h.slice(2)}return e+h}var b=d.getElementsByTagName("a");this._forEachNode(b,function(i){var h=i.getAttribute("href");if(h){if(h.indexOf("javascript:")===0){var j=this._doc.createTextNode(i.textContent);i.parentNode.replaceChild(j,i)}else{i.setAttribute("href",g(h))}}});var f=d.getElementsByTagName("img");this._forEachNode(f,function(h){var i=h.getAttribute("src");if(i){h.setAttribute("src",g(i))}})},_getArticleTitle:function(){var f=this._doc;var h="";var c="";try{h=c=f.title;if(typeof h!=="string"){h=c=this._getInnerText(f.getElementsByTagName("title")[0])}}catch(d){}if(h.match(/ [\|\-] /)){h=c.replace(/(.*)[\|\-] .*/gi,"$1");if(h.split(" ").length<3){h=c.replace(/[^\|\-]*[\|\-](.*)/gi,"$1")}}else{if(h.indexOf(": ")!==-1){var g=this._concatNodeLists(f.getElementsByTagName("h1"),f.getElementsByTagName("h2"));var b=this._someNode(g,function(e){return e.textContent===h});if(!b){h=c.substring(c.lastIndexOf(":")+1);if(h.split(" ").length<3){h=c.substring(c.indexOf(":")+1)}}}else{if(h.length>150||h.length<15){var a=f.getElementsByTagName("h1");if(a.length===1){h=this._getInnerText(a[0])}}}}h=h.trim();if(h.split(" ").length<=4){h=c}return h},_prepDocument:function(){var a=this._doc;this._forEachNode(a.getElementsByTagName("style"),function(b){b.parentNode.removeChild(b)});if(a.body){this._replaceBrs(a.body)}this._forEachNode(a.getElementsByTagName("font"),function(b){this._setNodeTag(b,"SPAN")})},_nextElement:function(b){var a=b;while(a&&(a.nodeType!=Node.ELEMENT_NODE)&&this.REGEXPS.whitespace.test(a.textContent)){a=a.nextSibling}return a},_replaceBrs:function(a){this._forEachNode(a.getElementsByTagName("br"),function(c){var e=c.nextSibling;var f=false;while((e=this._nextElement(e))&&(e.tagName=="BR")){f=true;var d=e.nextSibling;e.parentNode.removeChild(e);e=d}if(f){var g=this._doc.createElement("p");c.parentNode.replaceChild(g,c);e=g.nextSibling;while(e){if(e.tagName=="BR"){var b=this._nextElement(e);if(b&&b.tagName=="BR"){break}}var d=e.nextSibling;g.appendChild(e);e=d}}})},_setNodeTag:function(d,a){this.log("_setNodeTag",d,a);if(d.__JSDOMParser__){d.localName=a.toLowerCase();d.tagName=a.toUpperCase();return d}var c=d.ownerDocument.createElement(a);while(d.firstChild){c.appendChild(d.firstChild)}d.parentNode.replaceChild(c,d);if(d.readability){c.readability=d.readability}for(var b=0;b<d.attributes.length;b++){c.setAttribute(d.attributes[b].name,d.attributes[b].value)}return c},_prepArticle:function(a){this._cleanStyles(a);this._cleanConditionally(a,"form");this._clean(a,"object");this._clean(a,"embed");this._clean(a,"h1");this._clean(a,"footer");if(a.getElementsByTagName("h2").length===1){this._clean(a,"h2")}this._clean(a,"iframe");this._cleanHeaders(a);this._cleanConditionally(a,"table");this._cleanConditionally(a,"ul");this._cleanConditionally(a,"div");this._forEachNode(a.getElementsByTagName("p"),function(g){var e=g.getElementsByTagName("img").length;var f=g.getElementsByTagName("embed").length;var b=g.getElementsByTagName("object").length;var d=g.getElementsByTagName("iframe").length;var c=e+f+b+d;if(c===0&&!this._getInnerText(g,false)){g.parentNode.removeChild(g)}});this._forEachNode(a.getElementsByTagName("br"),function(b){var c=this._nextElement(b.nextSibling);if(c&&c.tagName=="P"){b.parentNode.removeChild(b)}})},_initializeNode:function(a){a.readability={contentScore:0};switch(a.tagName){case"DIV":a.readability.contentScore+=5;break;case"PRE":case"TD":case"BLOCKQUOTE":a.readability.contentScore+=3;break;case"ADDRESS":case"OL":case"UL":case"DL":case"DD":case"DT":case"LI":case"FORM":a.readability.contentScore-=3;break;case"H1":case"H2":case"H3":case"H4":case"H5":case"H6":case"TH":a.readability.contentScore-=5;break}a.readability.contentScore+=this._getClassWeight(a)},_removeAndGetNext:function(b){var a=this._getNextNode(b,true);b.parentNode.removeChild(b);return a},_getNextNode:function(b,a){if(!a&&b.firstElementChild){return b.firstElementChild}if(b.nextElementSibling){return b.nextElementSibling}do{b=b.parentNode}while(b&&!b.nextElementSibling);return b&&b.nextElementSibling},_getNextNodeNoElementProperties:function(d,a){function b(e){do{e=e.nextSibling}while(e&&e.nodeType!==e.ELEMENT_NODE);return e}if(!a&&d.children[0]){return d.children[0]}var c=b(d);if(c){return c}do{d=d.parentNode;if(d){c=b(d)}}while(d&&!c);return d&&c},_checkByline:function(c,b){if(this._articleByline){return false}if(c.getAttribute!==undefined){var a=c.getAttribute("rel")}if((a==="author"||this.REGEXPS.byline.test(b))&&this._isValidByline(c.textContent)){this._articleByline=c.textContent.trim();return true}return false},_getNodeAncestors:function(c,d){d=d||0;var a=0,b=[];while(c.parentNode){b.push(c.parentNode);if(d&&++a===d){break}c=c.parentNode}return b},_grabArticle:function(e){this.log("**** grabArticle ****");var f=this._doc;var p=(e!==null?true:false);e=e?e:this._doc.body;if(!e){this.log("No body found in document. Abort.");return null}var w=e.innerHTML;this._articleDir=f.documentElement.getAttribute("dir");while(true){var d=this._flagIsActive(this.FLAG_STRIP_UNLIKELYS);var C=[];var z=this._doc.documentElement;while(z){var M=z.className+" "+z.id;if(this._checkByline(z,M)){z=this._removeAndGetNext(z);continue}if(d){if(this.REGEXPS.unlikelyCandidates.test(M)&&!this.REGEXPS.okMaybeItsACandidate.test(M)&&z.tagName!=="BODY"&&z.tagName!=="A"){this.log("Removing unlikely candidate - "+M);z=this._removeAndGetNext(z);continue}}if(this.DEFAULT_TAGS_TO_SCORE.indexOf(z.tagName)!==-1){C.push(z)}if(z.tagName==="DIV"){if(this._hasSinglePInsideElement(z)){var j=z.children[0];z.parentNode.replaceChild(j,z);z=j}else{if(!this._hasChildBlockElement(z)){z=this._setNodeTag(z,"P");C.push(z)}else{this._forEachNode(z.childNodes,function(c){if(c.nodeType===Node.TEXT_NODE){var s=f.createElement("p");s.textContent=c.textContent;s.style.display="inline";s.className="readability-styled";z.replaceChild(s,c)}})}}}z=this._getNextNode(z)}var G=[];this._forEachNode(C,function(c){if(!c.parentNode||typeof(c.parentNode.tagName)==="undefined"){return}var P=this._getInnerText(c);if(P.length<25){return}var t=this._getNodeAncestors(c,3);if(t.length===0){return}var s=0;s+=1;s+=P.split(",").length;s+=Math.min(Math.floor(P.length/100),3);this._forEachNode(t,function(R,S){if(!R.tagName){return}if(typeof(R.readability)==="undefined"){this._initializeNode(R);G.push(R)}var Q=S===0?1:S===1?2:S*3;R.readability.contentScore+=s/Q})});var h=[];for(var O=0,x=G.length;O<x;O+=1){var H=G[O];var n=H.readability.contentScore*(1-this._getLinkDensity(H));if(H.id==this._specialTreatment.id||H.className==this._specialTreatment.className){var v=this._specialTreatment.scoreToAdd;n=n+20}H.readability.contentScore=n;this.log("Candidate:",H,"with score "+n);for(var E=0;E<this._nbTopCandidates;E++){var g=h[E];if(!g||n>g.readability.contentScore){h.splice(E,0,H);if(h.length>this._nbTopCandidates){h.pop()}break}}}var q=h[0]||null;var l=false;if(q===null||q.tagName==="BODY"){q=f.createElement("DIV");l=true;var N=e.childNodes;while(N.length){this.log("Moving child out:",N[0]);q.appendChild(N[0])}e.appendChild(q);this._initializeNode(q)}else{if(q){var a=q.parentNode;var y=q.readability.contentScore;var i=y/3;while(a&&a.readability){var r=a.readability.contentScore;if(r<i){break}if(r>y){q=a;break}y=a.readability.contentScore;a=a.parentNode}}}var A=f.createElement("DIV");if(p){A.id="readability-content"}var K=Math.max(10,q.readability.contentScore*0.2);var J=q.parentNode.children;for(var F=0,m=J.length;F<m;F++){var I=J[F];var B=false;this.log("Looking at sibling node:",I,I.readability?("with score "+I.readability.contentScore):"");this.log("Sibling has score",I.readability?I.readability.contentScore:"Unknown");if(I===q){B=true}else{var u=0;if(I.className===q.className&&q.className!==""){u+=q.readability.contentScore*0.2}if(I.readability&&((I.readability.contentScore+u)>=K)){B=true}else{if(I.nodeName==="P"){var k=this._getLinkDensity(I);var D=this._getInnerText(I);var b=D.length;if(b>80&&k<0.25){B=true}else{if(b<80&&k===0&&D.search(/\.( |$)/)!==-1){B=true}}}}}if(B){this.log("Appending node:",I);if(this.ALTER_TO_DIV_EXCEPTIONS.indexOf(I.nodeName)===-1){this.log("Altering sibling:",I,"to div.");I=this._setNodeTag(I,"DIV")}A.appendChild(I);F-=1;m-=1}}if(this._debug){this.log("Article content pre-prep: "+A.innerHTML)}this._prepArticle(A);if(this._debug){this.log("Article content post-prep: "+A.innerHTML)}if(this._curPageNum===1){if(l){q.id="readability-page-1";q.className="page"}else{var L=f.createElement("DIV");L.id="readability-page-1";L.className="page";var o=A.childNodes;while(o.length){L.appendChild(o[0])}A.appendChild(L)}}if(this._debug){this.log("Article content after paging: "+A.innerHTML)}if(this._getInnerText(A,true).length<this._articleMinimumSize){e.innerHTML=w;if(this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)){this._removeFlag(this.FLAG_STRIP_UNLIKELYS)}else{if(this._flagIsActive(this.FLAG_WEIGHT_CLASSES)){this._removeFlag(this.FLAG_WEIGHT_CLASSES)}else{if(this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)){this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY)}else{console.info("return null");return null}}}}else{return A}}},_isValidByline:function(a){if(typeof a=="string"||a instanceof String){a=a.trim();return(a.length>0)&&(a.length<100)}return false},_getArticleMetadata:function(){var b={};var a={};var e=this._doc.getElementsByTagName("meta");var d=/^\s*((twitter)\s*:\s*)?(description|title)\s*$/gi;var c=/^\s*og\s*:\s*(description|title)\s*$/gi;this._forEachNode(e,function(i){var f=i.getAttribute("name");var g=i.getAttribute("property");if([f,g].indexOf("author")!==-1){b.byline=i.getAttribute("content");return}var h=null;if(d.test(f)){h=f}else{if(c.test(g)){h=g}}if(h){var j=i.getAttribute("content");if(j){h=h.toLowerCase().replace(/\s/g,"");a[h]=j.trim()}}});if("description" in a){b.excerpt=a.description}else{if("og:description" in a){b.excerpt=a["og:description"]}else{if("twitter:description" in a){b.excerpt=a["twitter:description"]}}}if("og:title" in a){b.title=a["og:title"]}else{if("twitter:title" in a){b.title=a["twitter:title"]}}return b},_removeScripts:function(a){this._forEachNode(a.getElementsByTagName("script"),function(b){b.nodeValue="";b.removeAttribute("src");if(b.parentNode){b.parentNode.removeChild(b)}});this._forEachNode(a.getElementsByTagName("noscript"),function(b){if(b.parentNode){b.parentNode.removeChild(b)}})},_hasSinglePInsideElement:function(a){if(a.children.length!=1||a.children[0].tagName!=="P"){return false}return !this._someNode(a.childNodes,function(b){return b.nodeType===Node.TEXT_NODE&&this.REGEXPS.hasContent.test(b.textContent)})},_hasChildBlockElement:function(a){return this._someNode(a.childNodes,function(b){return this.DIV_TO_P_ELEMS.indexOf(b.tagName)!==-1||this._hasChildBlockElement(b)})},_getInnerText:function(c,a){a=(typeof a==="undefined")?true:a;var b=c.textContent.trim();if(a){return b.replace(this.REGEXPS.normalize," ")}else{return b}},_getCharCount:function(b,a){a=a||",";return this._getInnerText(b).split(a).length-1},_cleanStyles:function(a){a=a||this._doc;if(!a){return}var c=a.firstChild;if(typeof a.removeAttribute==="function"&&a.className!=="readability-styled"){var b=a.style.display;a.removeAttribute("style");if(b){console.info("re add style");a.setAttribute("style","display:"+b)}}while(c!==null){if(c.nodeType===c.ELEMENT_NODE){if(c.className!=="readability-styled"){var b=c.style.display;c.removeAttribute("style");if(b){console.info("re add style");c.setAttribute("style","display:"+b)}}this._cleanStyles(c)}c=c.nextSibling}},_getLinkDensity:function(b){var a=this._getInnerText(b).length;if(a===0){return}var c=0;this._forEachNode(b.getElementsByTagName("a"),function(d){c+=this._getInnerText(d).length});return c/a},_findBaseUrl:function(){var d=this._uri;var c=d.path.split("?")[0];var b=c.split("/").reverse();var a=[];var h="";for(var f=0,e=b.length;f<e;f+=1){var g=b[f];if(g.indexOf(".")!==-1){h=g.split(".")[1];if(!h.match(/[^a-zA-Z]/)){g=g.split(".")[0]}}if(g.indexOf(",00")!==-1){g=g.replace(",00","")}if(g.match(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i)&&((f===1)||(f===0))){g=g.replace(/((_|-)?p[a-z]*|(_|-))[0-9]{1,2}$/i,"")}var j=false;if(f<2&&g.match(/^\d{1,2}$/)){j=true}if(f===0&&g.toLowerCase()==="index"){j=true}if(f<2&&g.length<3&&!b[0].match(/[a-z]/i)){j=true}if(!j){a.push(g)}}return d.scheme+"://"+d.host+a.reverse().join("/")},_findNextPageLink:function(s){var f=this._uri;var a={};var b=s.getElementsByTagName("a");var n=this._findBaseUrl();for(var r=0,m=b.length;r<m;r+=1){var h=b[r];var c=b[r].href.replace(/#.*$/,"").replace(/\/$/,"");if(c===""||c===n||c===f.spec||c in this._parsedPages){continue}if(f.host!==c.split(/\/+/g)[1]){continue}var u=this._getInnerText(h);if(u.match(this.REGEXPS.extraneous)||u.length>25){continue}var j=c.replace(n,"");if(!j.match(/\d/)){continue}if(!(c in a)){a[c]={score:0,linkText:u,href:c}}else{a[c].linkText+=" | "+u}var v=a[c];if(c.indexOf(n)!==0){v.score-=25}var k=u+" "+h.className+" "+h.id;if(k.match(this.REGEXPS.nextLink)){v.score+=50}if(k.match(/pag(e|ing|inat)/i)){v.score+=25}if(k.match(/(first|last)/i)){if(!v.linkText.match(this.REGEXPS.nextLink)){v.score-=65}}if(k.match(this.REGEXPS.negative)||k.match(this.REGEXPS.extraneous)){v.score-=50}if(k.match(this.REGEXPS.prevLink)){v.score-=200}var l=h.parentNode;var p=false;var t=false;while(l){var o=l.className+" "+l.id;if(!p&&o&&o.match(/pag(e|ing|inat)/i)){p=true;v.score+=25}if(!t&&o&&o.match(this.REGEXPS.negative)){if(!o.match(this.REGEXPS.positive)){v.score-=25;t=true}}l=l.parentNode}if(c.match(/p(a|g|ag)?(e|ing|ination)?(=|\/)[0-9]{1,2}/i)||c.match(/(page|paging)/i)){v.score+=25}if(c.match(this.REGEXPS.extraneous)){v.score-=15}var g=parseInt(u,10);if(g){if(g===1){v.score-=10}else{v.score+=Math.max(0,10-g)}}}var q=null;for(var e in a){if(a.hasOwnProperty(e)){if(a[e].score>=50&&(!q||q.score<a[e].score)){q=a[e]}}}if(q){var d=q.href.replace(/\/$/,"");this.log("NEXT PAGE IS "+d);this._parsedPages[d]=true;return d}else{return null}},_successfulRequest:function(a){return(a.status>=200&&a.status<300)||a.status===304||(a.status===0&&a.responseText)},_ajax:function(b,a){var d=new XMLHttpRequest();function c(e){if(d.readyState===4){if(this._successfulRequest(d)){if(a.success){a.success(d)}}else{if(a.error){a.error(d)}}}}if(typeof a==="undefined"){a={}}d.onreadystatechange=c;d.open("get",b,true);d.setRequestHeader("Accept","text/html");try{d.send(a.postBody)}catch(f){if(a.error){a.error()}}return d},_appendNextPage:function(d){var c=this._doc;this._curPageNum+=1;var a=c.createElement("DIV");a.id="readability-page-"+this._curPageNum;a.className="page";a.innerHTML='<p class="page-separator" title="Page '+this._curPageNum+'">&sect;</p>';c.getElementById("readability-content").appendChild(a);if(this._curPageNum>this._maxPages){var b="<div style='text-align: center'><a href='"+d+"'>View Next Page</a></div>";a.innerHTML=a.innerHTML+b;return}(function(f,e){this._ajax(f,{success:function(g){var p=g.getResponseHeader("ETag");if(p){if(p in this._pageETags){this.log("Exact duplicate page found via ETag. Aborting.");a.style.display="none";return}else{this._pageETags[p]=1}}var o=c.createElement("DIV");var j=g.responseText.replace(/\n/g,"\uffff").replace(/<script.*?>.*?<\/script>/gi,"");j=j.replace(/\n/g,"\uffff").replace(/<script.*?>.*?<\/script>/gi,"");j=j.replace(/\uffff/g,"\n").replace(/<(\/?)noscript/gi,"<$1div");j=j.replace(this.REGEXPS.replaceFonts,"<$1span>");o.innerHTML=j;this._replaceBrs(o);this._flags=1|2|4;var l=this._findNextPageLink(o);var m=this._grabArticle(o);console.info("grabbd Article="+m);if(!m){this.log("No content found in page to append. Aborting.");return}var n=m.getElementsByTagName("P").length?m.getElementsByTagName("P")[0]:null;if(n&&n.innerHTML.length>100){for(var k=1;k<=this._curPageNum;k+=1){var h=c.getElementById("readability-page-"+k);if(h&&h.innerHTML.indexOf(n.innerHTML)!==-1){this.log("Duplicate of page "+k+" - skipping.");a.style.display="none";this._parsedPages[f]=true;return}}}this._removeScripts(m);e.innerHTML=e.innerHTML+m.innerHTML;setTimeout((function(){this._postProcessContent(e)}).bind(this),500);if(l){this._appendNextPage(l)}}})}).bind(this)(d,a)},_getClassWeight:function(b){if(!this._flagIsActive(this.FLAG_WEIGHT_CLASSES)){return 0}var a=0;if(typeof(b.className)==="string"&&b.className!==""){if(this.REGEXPS.negative.test(b.className)){a-=25}if(this.REGEXPS.positive.test(b.className)){a+=25}}if(typeof(b.id)==="string"&&b.id!==""){if(this.REGEXPS.negative.test(b.id)){a-=25}if(this.REGEXPS.positive.test(b.id)){a+=25}}return a},_clean:function(c,a){var b=["object","embed","iframe"].indexOf(a)!==-1;this._forEachNode(c.getElementsByTagName(a),function(d){if(b){var e=[].map.call(d.attributes,function(f){return f.value}).join("|");if(this.REGEXPS.videos.test(e)){return}if(this.REGEXPS.videos.test(d.innerHTML)){return}}d.parentNode.removeChild(d)})},_hasAncestorTag:function(b,a,d){d=d||3;a=a.toUpperCase();var c=0;while(b.parentNode){if(c>d){return false}if(b.parentNode.tagName===a){return true}b=b.parentNode;c++}return false},_cleanConditionally:function(s,u){if(!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)){return}var b=s.getElementsByTagName(u);var m=b.length;var t=u==="ul"||u==="ol";for(var r=m-1;r>=0;r-=1){var j=this._getClassWeight(b[r]);var q=0;this.log("Cleaning Conditionally",b[r]);console.info("weight="+j+";contentScore="+q+";charCount="+this._getCharCount(b[r],","));if(j+q<0){b[r].parentNode.removeChild(b[r])}else{if(this._getCharCount(b[r],",")<10){var l=b[r].getElementsByTagName("p").length;var v=b[r].getElementsByTagName("img").length;var k=b[r].getElementsByTagName("li").length-100;var g=b[r].getElementsByTagName("input").length;console.info("p.length="+l+";img.length="+v+";li.length="+k+";input.length="+g+";isList="+t);var f=0;var o=b[r].getElementsByTagName("embed");for(var a=0,d=o.length;a<d;a+=1){if(!this.REGEXPS.videos.test(o[a].src)){f+=1}}var h=this._getLinkDensity(b[r]);var c=this._getInnerText(b[r]).length;console.info("linkDensity="+h+";contentLength="+c+";embedCount="+f+";");var n=false;if(v>l&&!this._hasAncestorTag(b[r],"figure")){n=true}else{if(!t&&k>l){n=true}else{if(g>Math.floor(l/3)){n=true}else{if(!t&&c<25&&(v===0||v>2)){n=true}else{if(!t&&j<25&&h>0.2){n=true}else{if(j>=25&&h>this._linkDensity){console.info("to remove....");n=true}else{if((f===1&&c<75)||f>1){n=true}}}}}}}if(n){b[r].parentNode.removeChild(b[r])}}}}},_cleanHeaders:function(c){for(var a=1;a<3;a+=1){var d=c.getElementsByTagName("h"+a);for(var b=d.length-1;b>=0;b-=1){if(this._getClassWeight(d[b])<0){d[b].parentNode.removeChild(d[b])}}}},_flagIsActive:function(a){return(this._flags&a)>0},_addFlag:function(a){this._flags=this._flags|a},_removeFlag:function(a){this._flags=this._flags&~a},isProbablyReaderable:function(c){var a=this._getAllNodesWithTag(this._doc,["p","pre"]);var b=0;return this._someNode(a,function(f){if(c&&!c(f)){return false}var d=f.className+" "+f.id;if(this.REGEXPS.unlikelyCandidates.test(d)&&!this.REGEXPS.okMaybeItsACandidate.test(d)){return false}if(f.matches&&f.matches("li p")){return false}var e=f.textContent.trim().length;if(e<140){return false}b+=Math.sqrt(e-140);if(b>20){return true}return false})},parse:function(){if(this._maxElemsToParse>0){var c=this._doc.getElementsByTagName("*").length;if(c>this._maxElemsToParse){throw new Error("Aborting parsing document; "+c+" elements found")}}if(typeof this._doc.documentElement.firstElementChild==="undefined"){this._getNextNode=this._getNextNodeNoElementProperties}this._removeScripts(this._doc);this._prepDocument();var b=this._getArticleMetadata();var e=b.title||this._getArticleTitle();var a=this._grabArticle();if(!a){console.info("grabArticl content failed");return null}this.log("Grabbed: "+a.innerHTML);this._postProcessContent(a);if(!b.excerpt){var d=a.getElementsByTagName("p");if(d.length>0){b.excerpt=d[0].textContent.trim()}}return{uri:this._uri,title:e,byline:b.byline||this._articleByline,dir:this._articleDir,content:a.innerHTML,length:a.textContent.length,excerpt:b.excerpt}}};Element.prototype.remove=function(){this.parentElement.removeChild(this)};NodeList.prototype.remove=HTMLCollection.prototype.remove=function(){for(var a=this.length-1;a>=0;a--){if(this[a]&&this[a].parentElement){this[a].parentElement.removeChild(this[a])}}};function hideElementsByClassName(a){var c=document.getElementsByClassName(a);if(c!=undefined&&c.length!=0){var b=0;c.remove()}}var specialTreatment={};var host=document.location.host;var isSina=host.indexOf("sina.cn")!=-1;var isSohu=host.indexOf("sohu.com")!=-1;var isQQ=host.indexOf("qq.com")!=-1;var isNetease=host.indexOf("163.com")!=-1;var isJianshu=host.indexOf("jianshu.com")!=-1;var isBaiduJingyan=host.indexOf("jingyan.baidu.com")!=-1;if(isSina){hideElementsByClassName("M_attitude");hideElementsByClassName("extend-module")}else{if(isSohu){hideElementsByClassName("mini2 noDis");hideElementsByClassName("finCnl");hideElementsByClassName("tools_list")}else{if(isQQ){hideElementsByClassName("tvp_ads_inner");hideElementsByClassName("tvp_ads_go tvp_none")}else{if(isNetease){hideElementsByClassName("more-client");hideElementsByClassName("more-dada")}else{if(isJianshu){hideElementsByClassName("author-info");hideElementsByClassName("top");hideElementsByClassName("comments");hideElementsByClassName("article-info");hideElementsByClassName("download");hideElementsByClassName("hot-article");hideElementsByClassName("weixin-browser-help");hideElementsByClassName("qq-browser-help");hideElementsByClassName("share-help");hideElementsByClassName("download-modal");hideElementsByClassName("open-app");hideElementsByClassName("meta-top")}else{if(isBaiduJingyan){hideElementsByClassName("exp-info");hideElementsByClassName("shifu-link clear");hideElementsByClassName("fillet-h2");hideElementsByClassName("_copr");hideElementsByClassName("cp-info");hideElementsByClassName("share-content");specialTreatment.id="main-content";specialTreatment.scoreToAdd=20}}}}}}var articleMinimumSize=500;var shouldDecreaseArticleLimit=isSina||isQQ||isSohu||isNetease;if(shouldDecreaseArticleLimit){articleMinimumSize=256}else{if(isBaiduJingyan){articleMinimumSize=100}}var linkDensity=0.5;if(isBaiduJingyan){linkDensity=0.85}var myLocation=document.location;var uri={spec:myLocation.href,host:myLocation.host,prePath:myLocation.protocol+"//"+myLocation.host,scheme:myLocation.protocol.substr(0,myLocation.protocol.indexOf(":")),pathBase:myLocation.protocol+"//"+myLocation.host+myLocation.pathname.substr(0,myLocation.pathname.lastIndexOf("/")+1)};var options={debug:true,articleMinimumSize:articleMinimumSize,linkDensity:linkDensity,specialTreatment:specialTreatment};var article=new Readability(uri,document,options).parse();var title="<title>"+document.title+"</title>";var codeblockCSSRef='<link href="http://1.toolite.sinaapp.com/test_dir/codeblock.css" media="screen, projection" rel="stylesheet" type="text/css">';var viewPort='<meta name="viewport" content="width=device-width, initial-scale=1">';var content=title+viewPort+codeblockCSSRef+article.content;document.write(content);var screenWidth=window.screen.width;var images=document.getElementsByTagName("img");var image;var isZhihu=host.indexOf("zhihu.com")!=-1;for(var index in images){image=images[index];if(image.width>screenWidth){image.width=screenWidth}if(isZhihu){try{var actualSrc=image.getAttribute("data-actualsrc");if(actualSrc){image.src=actualSrc}else{var dataOriginal=image.getAttribute("data-original");if(dataOriginal){image.src=dataOriginal}}}catch(err){}}};
