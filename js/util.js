/*
*	通用方法
*	作者asd2fque1
*/
!function(wn){
	var Util={};
	Util.copyright="html词库工具，兼容各种主流操作系统，作者asd2fque1，免费提供给爱好者使用。";
	
	////常量////
	Util.CONST={};
	
	////临时变量////
	//输出文件格式（支持：UTF-8、Unicode 默认UTF-8）
	var exportFileCode="UTF-8";
	//输出文件是否包含文件头（0:不包含 1:包含 默认1）
	var exportFileContainsHead="1";
	
	////读取设置信息////
	if(localStorage.asd2fque1_config_export_file_charset){//输出文件格式
		exportFileCode=localStorage.asd2fque1_config_export_file_charset;
	}
	if(localStorage.asd2fque1_config_export_file_contains_bom){////输出文件是否包含文件头
		exportFileContainsHead=localStorage.asd2fque1_config_export_file_contains_bom;
	}
	
	////通用方法////
	Util.trimSpace=function(str){
		for(var i=0;i<str.length;i++){
			if(str.substr(i,1)!=" "){
				str=str.substr(i);
				break;
			}
		}
		for(var i=str.length-1;i>=0;i--){
			if(str.substr(i,1)!=" "){
				str=str.substr(0,i+1);
				break;
			}
		}
		return str;
	}
	Util.isEmptyObject=function(obj){
		for(var key in obj){
			return false
		};
		return true
	};
	
	////页面通用方法////
	//清空文本框
	Util.cleanTextBox=function(textDom){
		$(textDom).val("");
	};
	//读取文件内容到文本框
	Util.readFileToTextBox=function(fileDom,textDom){
		fileDom=$(fileDom);
		textDom=$(textDom);
		if(fileDom.size()==1 && (fileDom.is("input") || fileDom.is("textarea")) && fileDom.get(0).files && textDom.size()==1){
			if(fileDom.get(0).files.length<1){
//				alert("请选择一个文件。");
			}else if(fileDom.get(0).files.length>1){
				alert("不能选择多个文件。");
			}else{
				var fileObj=fileDom.get(0).files[0];
				var reader=new FileReader();
				reader.readAsText(fileObj);
				reader.onload=function(){
					textDom.val(this.result);
					fileDom.val("");
				}
			}
		}else{
			alert("error:not file dom");
		}
	};
	//选中文本框文字
	Util.selectTextBoxText=function(textDom){
		textDom=$(textDom).get(0);
		textDom.selectionStart=0;
		textDom.selectionEnd=textDom.value.length;
	}
	//下载文件
	Util.downloadFile=function(linkObj,str,fileName,charSet){
		linkObj=$(linkObj).get(0);
		var blob=null;
		var finalCharset=charSet;
		if(!finalCharset){
			finalCharset=exportFileCode;
		}
		if(finalCharset=="UTF-8"){
			blob=Util.createUtf8FileBlob(str);
		}else if(finalCharset=="Unicode"){
			blob=Util.createUnicodeFileBlob(str);
		}else if(finalCharset=="bin"){
			blob=Util.createBinFileBlob(str);
		}else{
			alert("文件编码格式设置错误");
			return;
		}
		if(fileName){
			linkObj.download=fileName;
		}else{
			linkObj.download="export.txt";
		}
		linkObj.href=URL.createObjectURL(blob);
		linkObj.click();
	}
	//生成UTF-8文件的blob
	Util.createUtf8FileBlob=function(str){//UTF-8
		var fileHead="";
		if(exportFileContainsHead=="1"){
			fileHead=new Uint8Array([0xEF,0xBB,0xBF]);//文件头
		}
		return new Blob([fileHead,str]);
	}
	//生成Unicode文件的blob
	Util.createUnicodeFileBlob=function(str){//Unicode（UTF-16le）
		var fileHead="";
		if(exportFileContainsHead=="1"){
			fileHead=new Uint8Array([0xFF,0xFE]);//文件头
		}
		var intArr=[];
		for(var i=0; i<str.length; i++){
			intArr.push(str.charCodeAt(i));
		}
		return new Blob([fileHead,new Uint16Array(intArr)]);
	}
	//生成bin文件的blob
	Util.createBinFileBlob=function(uint8Array){//Bin
		return new Blob([uint8Array]);
	}
	
	////码表通用方法////
	//读取文本行字符串，生成文本行数组
	Util.parseLineStrToLineList=function(str,isIncludeBlankLine){
		var lineList=str.split("\n");
		for(var i=lineList.length-1;i>=0;i--){
			lineList[i]=Util.trimSpace(lineList[i]);//去前后空格
			if(!isIncludeBlankLine && lineList[i]==""){
				lineList.splice(i,1);//去空行
			}
		}
		return lineList;
	}
	//根据文本行数组，生成文本行字符串
	Util.parseLineListToLineStr=function(lineList){
		var str="";
		for(var i=0;i<lineList.length;i++){
			str=str+lineList[i]+"\n";
		}
		return str;
	}
	
	////码表格式转换方法////
	//打散词条
	Util.scatter=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.scatterByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.scatterByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length>=2){
				var hasError=false;
				for(var j=1;j<currSplit.length;j++){
					if(currSplit[j].length>0){
						newLineList.push(currSplit[0]+" "+currSplit[j]);
					}else{
						hasError=true;
					}
				}
				if(hasError){
					errorLineList.push(lineList[i]);
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//合并词条
	Util.combo=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.comboByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.comboByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		var prevCode="";
		var k=-1;
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				if(currSplit[0]!=prevCode){
					newLineList.push(currSplit[0]+" "+currSplit[1]);
					k++;
					prevCode=currSplit[0];
				}else{
					newLineList[k]=newLineList[k]+" "+currSplit[1];
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//MB格式转换成打散格式词条
	Util.mbToNormal=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.mbToNormalByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	}
	Util.mbToNormalByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split("\t");
			if(currSplit.length==2 && currSplit[0].length>0 && currSplit[1].length>0){
				if(lineList[i].replace(/\\\\/g," ").replace(/\\t/g," ").indexOf("\\")>=0){
					errorLineList.push(lineList[i]);
				}else if(currSplit[1].indexOf(" ")>=0){
					errorLineList.push(lineList[i]);
				}else{
					//替换空格和Tab符
					currSplit[0]=currSplit[0].replace(/\\\\/g,"\\").replace(/\\t/g,"\t").replace(/ /g,"$$20");
					
					newLineList.push(currSplit[1]+" "+currSplit[0]);
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//打散格式转换成MB格式词条
	Util.normalToMb=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.normalToMbByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	}
	Util.normalToMbByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2 && currSplit[0].length>0 && currSplit[1].length>0){
				if(currSplit[0].indexOf("\t")>=0){
					errorLineList.push(lineList[i]);
				}else{
					//替换空格和Tab符
					currSplit[1]=currSplit[1].replace(/[$]20/g," ").replace(/\\/g,"\\\\").replace(/\t/g,"\\t");
					
					newLineList.push(currSplit[1]+"	"+currSplit[0]);
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//交换编码与候选的顺序
	Util.exchange=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.exchangeByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	}
	Util.exchangeByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				newLineList.push(currSplit[1]+" "+currSplit[0]);
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//去重合并词库（将str2合并到str1中）
	Util.mergeDict=function(str1,str2){
		var lineList1=Util.parseLineStrToLineList(str1);
		var lineList2=Util.parseLineStrToLineList(str2);
		var newLineList=Util.mergeDictByList(lineList1,lineList2);
		return Util.parseLineListToLineStr(newLineList);
	}
	Util.mergeDictByList=function(lineList1,lineList2){
		if(!lineList2){
			lineList2=[];
		}
		
		var newLineList=[];
		var errorLineList=[];
		
		var lineMap={};
		
		for(var i=0;i<lineList1.length;i++){
			var currSplit=lineList1[i].split(" ");
			if(currSplit.length==2){
				if(!lineMap[lineList1[i]]){
					lineMap[lineList1[i]]=lineList1[i];
				}
			}else{
				errorLineList.push(lineList1[i]);
			}
		}
		
		for(var i=0;i<lineList2.length;i++){
			var currSplit=lineList2[i].split(" ");
			if(currSplit.length==2){
				if(!lineMap[lineList2[i]]){
					lineMap[lineList2[i]]=lineList2[i];
				}
			}else{
				errorLineList.push(lineList2[i]);
			}
		}
		
		for(var line in lineMap){
			newLineList.push(line);
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	
	////码表处理方法////
	//排序词条
	Util.sort=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.sortByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.sortByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		var compareFunc=function(x,y){
			var splitX=x.split(" ");
			var splitY=y.split(" ");
			if(splitX[0]<splitY[0]){
				return -1;
			}else if(splitX[0]>splitY[0]){
				return 1;
			}else{
				return 0;
			}
		}
		
		for(var i=lineList.length-1;i>=0;i--){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length!=2){
				errorLineList.push(lineList[i]);
				lineList.splice(i,1);//去错误行
			}
		}
		
		//检测是否已经排好序
		var isSorted=true;
		for(var i=0;i<lineList.length-1;i++){
			if(compareFunc(lineList[i],lineList[i+1])>=0){
				isSorted=false;
				break;
			}
		}
		
		//是不是排序好的词库则进行排序
		if(isSorted){
			//是排序好的词库无需排序(节省处理时间)
			newLineList=lineList;
		}else{
			//不是排序好的词库则进行排序
			
			//调用系统排序
			newLineList=lineList.sort(compareFunc);
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//反转词条顺序
	Util.reverse=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.reverseByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.reverseByList=function(lineList){
		var newLineList=[];
		var errorLineList=[];
		
		for(var i=lineList.length-1;i>=0;i--){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length>=2){
				for(var j=1;j<currSplit.length;j++){
					if(currSplit[j].length<=0){
						errorLineList.push(lineList[i]);
						break;
					}
				}
				newLineList.push(lineList[i]);
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//检测重码情况
	Util.countSameCode=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		return Util.countSameCodeByList(lineList);
	};
	Util.countSameCodeByList=function(lineList){
		var resultStr="";
		var errorLineList=[];
		
		var codeNumberMap={};
		
		var sameCodeCount=0;
		var charCount=0;
		var wordCount=0;
		var i=0;
		var lastCode="";
		for(;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				if(lastCode!=currSplit[0]){
					sameCodeCount++;
				}
				if(currSplit[1].length==1){
					charCount++;
				}
				if(currSplit[1].length>1){
					wordCount++;
				}
				
				if(!codeNumberMap[currSplit[0]]){
					codeNumberMap[currSplit[0]]=0;
				}
				codeNumberMap[currSplit[0]]++;
				
				lastCode=currSplit[0];
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		var notMulCount=0;
		var maxMulNum=0;
		var codeMulCount=[];//共?个几重编码(值存个数，下标存几重)
		var codeLenCount=[];//共?个几码编码有重码(值存个数，下标存几码)
		for(var code in codeNumberMap){
			var codeMul=codeNumberMap[code];
			var codeLen=code.length;
			
			if(codeMul>1){
				if(!codeMulCount[codeMul]){
					codeMulCount[codeMul]=0;
				}
				codeMulCount[codeMul]++;
				
				if(!codeLenCount[codeLen]){
					codeLenCount[codeLen]=0;
				}
				codeLenCount[codeLen]++;
			}else{
				notMulCount++;
				maxMulNum=1;
			}
		}
		
		resultStr=resultStr+"词条共"+i+"行\n";
		resultStr=resultStr+"编码共"+sameCodeCount+"组\n";
		resultStr=resultStr+"单字共"+charCount+"个\n";
		resultStr=resultStr+"词组共"+wordCount+"个\n";
		resultStr=resultStr+"\n";
		
		resultStr=resultStr+"共"+notMulCount+"个无重码词条\n";
		for(var i=2; i<codeMulCount.length; i++){
			if(codeMulCount[i]){
				resultStr=resultStr+"共"+codeMulCount[i]+"个"+i+"重编码\n";
				maxMulNum=i;
			}
		}
		for(var i=1; i<codeLenCount.length; i++){
			if(codeLenCount[i]){
				resultStr=resultStr+"共"+codeLenCount[i]+"个"+i+"码编码有重码\n";
			}
		}
		
		resultStr=resultStr+"\n";
		if(maxMulNum>1){
			var tempCode=""
			resultStr=resultStr+"最高"+maxMulNum+"重编码\n";
			for(var code in codeNumberMap){
				if(codeNumberMap[code]==maxMulNum){
					tempCode=tempCode+"\n"+code;
				}
			}
			resultStr=resultStr+"最高重码的编码是："+tempCode+"\n";
		}else{
			resultStr=resultStr+"词库无重码\n";
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行（错误数据将不计入统计结果）：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行（错误数据将不计入统计结果）：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return resultStr;
	};
	//检测全码的空简码
	Util.testEmptySimple=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.testEmptySimpleByList(lineList);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.testEmptySimpleByList=function(lineList){
		var newLineList=[];
		var newLineMap={};
		var existArray=[];
		var errorLineList=[];
		var lastCode="";
		
		//排序
		lineList=Util.sortByList(lineList);
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				var codeStr=currSplit[0];
				var charStr=currSplit[1];
				var codeLength=codeStr.length;
				var charLength=charStr.length;
				
				if (lastCode!=codeStr.toLowerCase()) {
					lastCode=codeStr.toLowerCase();
				} else {
					//跳过重复编码
					continue;
				}
				
				existArray.splice(codeLength);
				for (var j=1;j<=codeLength-1;j++){
					var currSplitCode=codeStr.substr(0,j);
					if(existArray[j]!=currSplitCode){
						//检出不存在的简码
						if(!newLineMap.hasOwnProperty(currSplitCode)){
							//记录没有记录过的空简码
							newLineMap[currSplitCode]="";
							newLineList.push(currSplitCode+" "+"空");
						}
					}
				}
				existArray[codeLength]=codeStr;
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//出简不出全(isCharOrWord:0=单字加词组 1=仅单字 2=仅词组)
	Util.simpleNotFull=function(str,isCharOrWord,keepMaxType,keepMaxLength){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.simpleNotFullByList(lineList,isCharOrWord,keepMaxType,keepMaxLength);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.CONST.CHAR_OR_WORD={};
	Util.CONST.CHAR_OR_WORD.ALL=0;
	Util.CONST.CHAR_OR_WORD.CHAR=1;
	Util.CONST.CHAR_OR_WORD.WORD=2;
	Util.CONST.KEEP_MAX_TYPE={};
	Util.CONST.KEEP_MAX_TYPE.LARGE_THAN=0;
	Util.CONST.KEEP_MAX_TYPE.SMALL_THAN=1;
	Util.simpleNotFullByList=function(lineList,isCharOrWord,keepMaxType,keepMaxLength){
		var newLineList=[];
		var errorLineList=[];
		
		keepMaxLength=Number(keepMaxLength);
		
		if(!isCharOrWord || isCharOrWord<Util.CONST.CHAR_OR_WORD.ALL || isCharOrWord>Util.CONST.CHAR_OR_WORD.WORD){
			isCharOrWord=Util.CONST.CHAR_OR_WORD.ALL;
		}
		
		var codeCharMap={};
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				if(isCharOrWord==Util.CONST.CHAR_OR_WORD.ALL
				|| isCharOrWord==Util.CONST.CHAR_OR_WORD.CHAR && currSplit[1].length==1
				|| isCharOrWord==Util.CONST.CHAR_OR_WORD.WORD && currSplit[1].length>1
				){
					if(!codeCharMap[currSplit[1]]){
						codeCharMap[currSplit[1]]=[];
					}
					codeCharMap[currSplit[1]].push(currSplit[0]);
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		for(var tempCodeChar in codeCharMap){
			var tempCodeCharArr = [];
			var referCodeCharArr=codeCharMap[tempCodeChar];
			for(var i=0;i<referCodeCharArr.length;i++){
				var hasSimpleCode = false;
				var currCode = referCodeCharArr[i];
				if(keepMaxLength>0 && (keepMaxType==Util.CONST.KEEP_MAX_TYPE.LARGE_THAN && currCode.length>keepMaxLength || keepMaxType==Util.CONST.KEEP_MAX_TYPE.SMALL_THAN && currCode.length<keepMaxLength)){
					tempCodeCharArr.push(currCode);
				}else{
					for(var j=0;j<currCode.length-1;j++){
						if(tempCodeCharArr.indexOf(currCode.substr(0,j+1))>=0){
							hasSimpleCode = true;
							break;
						}
					}
					
					if (!hasSimpleCode){
						for(var j=tempCodeCharArr.length-1;j>=0;j--){
							if(tempCodeCharArr[j].indexOf(currCode)==0){
								tempCodeCharArr.splice(j,1);
							}
						}
						tempCodeCharArr.push(currCode);
					}
				}
			}
			codeCharMap[tempCodeChar] = tempCodeCharArr;
		}
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				if(isCharOrWord==Util.CONST.CHAR_OR_WORD.ALL
				|| isCharOrWord==Util.CONST.CHAR_OR_WORD.CHAR && currSplit[1].length==1
				|| isCharOrWord==Util.CONST.CHAR_OR_WORD.WORD && currSplit[1].length>1
				){
					var isExist=false;
					for(var j=0;j<codeCharMap[currSplit[1]].length;j++){
						if(codeCharMap[currSplit[1]][j]==currSplit[0]){
							isExist=true;
							break;
						}
					}
					if(isExist){
						newLineList.push(currSplit[0]+" "+currSplit[1]);
					}
				}else{
					newLineList.push(currSplit[0]+" "+currSplit[1]);
				}
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//提取词条
	Util.pickDict=function(str,codeMinLength,codeMaxLength,charMinLength,charMaxLength,isIncludeCode,isIncludeChar,isIncludeNum){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.pickDictByList(lineList,codeMinLength,codeMaxLength,charMinLength,charMaxLength,isIncludeCode,isIncludeChar,isIncludeNum);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.pickDictByList=function(lineList,codeMinLength,codeMaxLength,charMinLength,charMaxLength,isIncludeCode,isIncludeChar,isIncludeNum){
		var newLineList=[];
		var errorLineList=[];
		
		var lastCode="";
		var currCodeTimes=0;
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				var codeLength=currSplit[0].length;
				var charLength=currSplit[1].length;
				
				if (lastCode!=currSplit[0].toLowerCase()) {
					lastCode=currSplit[0].toLowerCase();
					currCodeTimes=1;
				} else {
					currCodeTimes++;
				}
				
				if ((codeMinLength<0 || codeLength>=codeMinLength) &&
					(codeMaxLength<0 || codeLength<=codeMaxLength) &&
					(charMinLength<0 || charLength>=charMinLength) &&
					(charMaxLength<0 || charLength<=charMaxLength)
				) {
					var outCode = "";
					var outChar = "";
					var outNumber="";
					var splitSpace = "";
					
					if(isIncludeCode){
						outCode=currSplit[0];
					}
					if(isIncludeChar){
						outChar=currSplit[1];
					}
					if(isIncludeNum){
						outNumber=currCodeTimes;
					}
					if((isIncludeCode || isIncludeNum) && isIncludeChar){
						splitSpace = " ";
					}
					
					newLineList.push(outCode+outNumber+splitSpace+outChar);
				}
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	};
	//生成百度手机输入法blob
	Util.parseBaiduBlob=function(autoCodeLength,str,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space){
		var lineList=Util.parseLineStrToLineList(str);
		return Util.parseBaiduBlobByList(autoCodeLength,lineList,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space);
	};
	Util.parseBaiduBlobByList=function(autoCodeLength,lineList,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space){
		var errorLineList=[];
		var byteList=[autoCodeLength];
		var lengthList=[];
		var contentList=[];
		
		//排序
		lineList=Util.sortByList(lineList);
		
		//添加全角空格候选来去除全码候选唯一
		if(isNonuniqueness || isSeparateCharAndFollow){
			var tempList=[];
			var codeLength=0;
			var lastCode="";
			var lastLine="";
			var repeatNum=2;
			for(var i=0;i<lineList.length;i++){
				var currSplit=lineList[i].split(" ");
				if(currSplit.length==2){
					var currCode=currSplit[0].toLowerCase();
					var currChar=currSplit[1];
					codeLength=currCode.length;
					var charLength=currChar.length;
					
					if(lastCode!=currCode){
						//测试并添加全角空格候选
						internalCheckAddNonuniquenessChoice(tempList,lastLine,lastCode,lastCode.length,autoCodeLength,repeatNum,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space);
						
						repeatNum=1;
						lastCode=currCode;
					}else{
						repeatNum++;
					}
				}
				
				lastLine=lineList[i];
				tempList.push(lineList[i]);
			}
			//测试并添加全角空格候选
			internalCheckAddNonuniquenessChoice(tempList,lastLine,lastCode,lastCode.length,autoCodeLength,repeatNum,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space);
			if(tempList[0]==" 　" || tempList[0]==" 　　　　　　　　　　　　　　　"){
				tempList=tempList.slice(1);
			}
			
			lineList=tempList;
		}
		
		var baseLatter=0x60;//字母a的上一个字符
		var lastCode="";
		var repeatNum=1;
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				var currCode=currSplit[0].toLowerCase();
				var currChar=currSplit[1];
				
                //替换空格
				currChar=currChar.replace(/[$]20/g," ");
				
				var codeLength=currCode.length;
				var charLength=currChar.length;
				
				if(lastCode!=currCode){
					repeatNum=1;
					lastCode=currCode;
				}else{
					repeatNum++;
				}
				if(repeatNum>99){
					//选重超过99重
					continue;
				}
				if(repeatNum<10){
					codeLength=codeLength+2;
				}else{
					codeLength=codeLength+3;
				}
				
				//计算首字母偏移量，数组作为下标
				var latterNumber=currCode.charCodeAt(0)-baseLatter;
				if(!lengthList[latterNumber]){
					lengthList[latterNumber]=0;
				}
				//累计首字母词条总长度
				lengthList[latterNumber]=lengthList[latterNumber]+2+codeLength+charLength*2+6;
				
				//写内容部分(词条)
				contentList.push(codeLength);//编码长度
				contentList.push(charLength*2+2);//候选长度
				for(var j=0;j<currCode.length;j++){
					//写编码
					contentList.push(currCode.charCodeAt(j));
				}
				
				//写重码号
				contentList.push("=".charCodeAt(0));
				if(repeatNum>=10){
					contentList.push(Math.floor(repeatNum/10)+0x30);
				}
				contentList.push(repeatNum%10+0x30);
				
				//写候选词
				for(var j=0;j<currChar.length;j++){
					var tempCharCode=currChar.charCodeAt(j);
					contentList.push(tempCharCode%0x100, Math.floor(tempCharCode/0x100)%0x100);
				}
				contentList.push(0,0,0,0,0,0);
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		var currNum=0;
		for(var i=0;i<=26;i++){
			//写头部偏移量
			var latterLength=lengthList[i];
			if(!latterLength){
				latterLength=0;
			}
			currNum=currNum+latterLength;
			
			byteList.push(currNum%0x100, Math.floor(currNum/0x100)%0x100, Math.floor(currNum/0x10000)%0x100, Math.floor(currNum/0x1000000)%0x100);
		}
		
		byteList=byteList.concat(contentList);
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		if(currNum>0xffffffff){
			alert("词库过大，无法生成");
			return new Blob();
		}
		
		return new Blob([new Uint8Array(byteList)]);
	};
	//测试并添加全角空格候选
	function internalCheckAddNonuniquenessChoice(lineList,lineStr,codeStr,codeLength,autoCodeLength,repeatNum,isNonuniqueness,isSeparateCharAndFollow,isSeparate15Space){
		if(isNonuniqueness && (autoCodeLength>0 && codeLength==autoCodeLength && repeatNum==1)){
			//测试并添加全角空格候选来去除候选唯一
			lineList.push(codeStr+" "+"　");
		}
		if(isSeparateCharAndFollow && (autoCodeLength==0 || codeLength<autoCodeLength)){
			//测试并添加全角空格候选来分隔当前候选和后续候选
			if(isSeparate15Space){
				lineList.push(codeStr+" "+"　　　　　　　　　　　　　　　");
			}else{
				lineList.push(codeStr+" "+"　");
			}
		}
	}
	//生成微软五笔输入法blob
	Util.parseMsWubiBlob=function(str,isSeparateCharAndFollow){
		var lineList=Util.parseLineStrToLineList(str);
		return Util.parseMsWubiBlobByList(lineList,isSeparateCharAndFollow);
	};
	Util.parseMsWubiBlobByList=function(lineList,isSeparateCharAndFollow){
		var errorLineList=[];
		var splitListMain=[];
		var splitListCustom=[];
		
		//排序
		lineList=Util.sortByList(lineList);
		
		//去除候选唯一（添加全角空格候选）
		if(isSeparateCharAndFollow){
			//去除候选唯一
			var tempLineList=[];
			var currCode="";
			var lastCode="";
			var codeLength=0;
			var lastCodeLength=0;
			var repeatNum=0;
			
			for(var i=0;i<lineList.length;i++){
				var currSplit=lineList[i].split(" ");
				if(currSplit.length==2){
					currCode=currSplit[0];
					var currChar=currSplit[1];
					codeLength=currCode.length;
					var charLength=currChar.length;
					
					if(lastCode!=currCode){
						if(repeatNum>0 && lastCodeLength<4){
							//补充全角空格到九个候选
							var stopSpaceNum=0;
							for(var j=repeatNum+1;j<=9;j++){
								var spaceStr="";
								for(var k=0;k<=stopSpaceNum;k++){
									spaceStr=spaceStr+"　";
								}
								tempLineList.push(lastCode + " " + spaceStr);
								stopSpaceNum++;
							}
						}
						
						repeatNum=1;
						lastCode=currCode;
					}else{
						repeatNum++;
					}
					
					lastCodeLength=codeLength;
					tempLineList.push(lineList[i]);
				}else{
					errorLineList.push(lineList[i]);
				}
			}
			
			if(repeatNum>0 && codeLength<4){
				//补充全角空格到九个候选
				var stopSpaceNum=0;
				for(var j=repeatNum+1;j<=9;j++){
					var spaceStr="";
					for(var k=0;k<=stopSpaceNum;k++){
						spaceStr=spaceStr+"　";
					}
					tempLineList.push(currCode + " " + spaceStr);
					stopSpaceNum++;
				}
			}
			
			lineList=tempLineList;
		}
		
		//分离主码表与自定义短语
		var i=0;
		for(;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				currSplit[0]=currSplit[0].toLowerCase();
				currSplit[1]=currSplit[1].replace(/[$]20/g," ");//替换空格
				
				if(/^[a-zA-Z]{1,4}$/.test(currSplit[0]) && currSplit[1].length<=64){
					if(!/z/.test(currSplit[0])){
						splitListMain.push(currSplit);
					}else{
						splitListCustom.push(currSplit);
					}
				} else {
					errorLineList.push(lineList[i]);
				}
			}
		}
		
		var blobList=[];
		
		////主码表
		var mainHeadList=[0x69,0x6D,0x73,0x63,0x77,0x75,0x62,0x69,0x01,0x00,0x01,0x00,0x40,0x00,0x00,0x00,
						  0xA8,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x12,0x34,0x56,0x78,0x00,0x00,0x00,0x00,
						  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
						  0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
		var mainContentList=[];
		
		var mainOffset=0;
		var letter1="`";
		var mainPrevLetter="`";
		var mainLetterOffsetList=[];//26字母偏移
		
		var prevCode="";
		var repeatNum=1;
			
		for(var i=0;i<splitListMain.length;i++){
			var currCode=splitListMain[i][0];
			var currChar=splitListMain[i][1];
			var codeLength=currCode.length;
			var charLength=currChar.length;
			letter1=currCode.substr(0,1);
				
			if(prevCode!=currCode){
				repeatNum=1;
				prevCode=currCode;
			}else{
				repeatNum++;
			}
			
			if(letter1!=mainPrevLetter){
				//计算头部各字母偏移
				for(var le=mainPrevLetter.charCodeAt(0)+1;le<=letter1.charCodeAt(0);le++){
					mainLetterOffsetList[(le-0x61)*4+0]=mainOffset%0x100;
					mainLetterOffsetList[(le-0x61)*4+1]=Math.floor(mainOffset/0x100)%0x100;
					mainLetterOffsetList[(le-0x61)*4+2]=Math.floor(mainOffset/0x10000)%0x100;
					mainLetterOffsetList[(le-0x61)*4+3]=Math.floor(mainOffset/0x1000000)%0x100;
				}
				
				mainPrevLetter=letter1;
			}
			
			//词条头部
			var contentLength=0x10+charLength*2;
			mainContentList.push(contentLength, 0x00);//词条长度
			mainContentList.push(repeatNum, 0x00);//重码号
			mainContentList.push(codeLength, 0x00);//编码长度
			
			//写编码
			var c=0;
			for(;c<codeLength;c++){
				var tempCodeCode=currCode.substr(c,1).charCodeAt(0);
				mainContentList.push(tempCodeCode, 0x00);//有编码
			}
			for(;c<4;c++){
				mainContentList.push(0x00, 0x00);//无编码
			}
			
			//写候选
			for(c=0;c<charLength;c++){
				var tempCharCode=currChar.substr(c,1).charCodeAt(0);
				mainContentList.push(tempCharCode%0x100, Math.floor(tempCharCode/0x100)%0x100);//候选
			}
			
			//结尾
			mainContentList.push(0x00, 0x00);
			
			//偏移
			mainOffset=mainOffset+contentLength;
			
			if(mainOffset+0x40+0x68>0xffffffff){
				alert("词库过大，无法生成");
				return [new Blob()];
			}
		}
		
		//计算头部各字母偏移
		for(var le=letter1.charCodeAt(0)+1;le<="z".charCodeAt(0);le++){
			mainLetterOffsetList[(le-0x61)*4+0]=mainOffset%0x100;
			mainLetterOffsetList[(le-0x61)*4+1]=Math.floor(mainOffset/0x100)%0x100;
			mainLetterOffsetList[(le-0x61)*4+2]=Math.floor(mainOffset/0x10000)%0x100;
			mainLetterOffsetList[(le-0x61)*4+3]=Math.floor(mainOffset/0x1000000)%0x100;
		}
		
		//合并固定头部与偏移
		mainHeadList=mainHeadList.concat(mainLetterOffsetList);
		
		//文件大小
		mainHeadList[0x14]=(mainOffset+0x40+0x68)%0x100;
		mainHeadList[0x15]=Math.floor((mainOffset+0x40+0x68)/0x100)%0x100;
		mainHeadList[0x16]=Math.floor((mainOffset+0x40+0x68)/0x10000)%0x100;
		mainHeadList[0x17]=Math.floor((mainOffset+0x40+0x68)/0x1000000)%0x100;
		
		//生成文件
		if(letter1!="`"){
			//生成文件
			blobList.push(new Blob([new Uint8Array(mainHeadList.concat(mainContentList))]));
		}else{
			//无主码表词条时生成空文件
			blobList.push(new Blob());
		}
		
		
		////自定义短语码表
		if(splitListCustom.length>0){
			var customHeadList=[0x6D,0x73,0x63,0x68,0x78,0x75,0x64,0x70,0x02,0x00,0x60,0x00,0x01,0x00,0x00,0x00,
								0x40,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
								0x12,0x34,0x56,0x78,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
								0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
			var customContentList=[];
			
			var customHeadOffset=0x40+4*splitListCustom.length;
			var customOffset=0;
			var customCharOffsetList=[];
			
			var prevCode="";
			var repeatNum=1;
			
			//词条起始位置
			customHeadList[0x14]=customHeadOffset%0x100;
			customHeadList[0x15]=Math.floor(customHeadOffset/0x100)%0x100;
			customHeadList[0x16]=Math.floor(customHeadOffset/0x10000)%0x100;
			customHeadList[0x17]=Math.floor(customHeadOffset/0x1000000)%0x100;
			
			//词条数
			customHeadList[0x1C]=splitListCustom.length%0x100;
			customHeadList[0x1D]=Math.floor(splitListCustom.length/0x100)%0x100;
			customHeadList[0x1E]=Math.floor(splitListCustom.length/0x10000)%0x100;
			customHeadList[0x1F]=Math.floor(splitListCustom.length/0x1000000)%0x100;
			
			//自定义短语
			for(var i=0;i<splitListCustom.length;i++){
				var currCode=splitListCustom[i][0];
				var currChar=splitListCustom[i][1];
				var codeLength=currCode.length;
				var charLength=currChar.length;
				
				if(prevCode!=currCode){
					repeatNum=1;
					prevCode=currCode;
				}else{
					repeatNum++;
				}
				
				//偏移
				customCharOffsetList.push(customOffset%0x100);
				customCharOffsetList.push(Math.floor(customOffset/0x100)%0x100);
				customCharOffsetList.push(Math.floor(customOffset/0x10000)%0x100);
				customCharOffsetList.push(Math.floor(customOffset/0x1000000)%0x100);
				
				//词条头部
				customContentList.push(0x10, 0x00, 0x10, 0x00);
				customContentList.push(0x12+codeLength*2, 0x00);
				customContentList.push(repeatNum, 0x06);
				customContentList.push(0x00, 0x00, 0x00, 0x00);
				customContentList.push(0x12, 0x34, 0x56, 0x78);
				
				//写编码
				for(var c=0;c<codeLength;c++){
					var tempCodeCode=currCode.substr(c,1).charCodeAt(0);
					customContentList.push(tempCodeCode, 0x00);//编码
				}
				customContentList.push(0x00, 0x00);
				
				//写候选
				for(var c=0;c<charLength;c++){
					var tempCharCode=currChar.substr(c,1).charCodeAt(0);
					customContentList.push(tempCharCode%0x100, Math.floor(tempCharCode/0x100)%0x100);//候选
				}
				customContentList.push(0x00, 0x00);
				
				customOffset=customOffset+0x14+codeLength*2+charLength*2;
			}
			
			//合并固定头部与偏移
			customHeadList=customHeadList.concat(customCharOffsetList);
			
			//文件大小
			customHeadList[0x18]=(customHeadOffset+customOffset)%0x100;
			customHeadList[0x19]=Math.floor((customHeadOffset+customOffset)/0x100)%0x100;
			customHeadList[0x1A]=Math.floor((customHeadOffset+customOffset)/0x10000)%0x100;
			customHeadList[0x1B]=Math.floor((customHeadOffset+customOffset)/0x1000000)%0x100;
			
			//生成文件
			blobList.push(new Blob([new Uint8Array(customHeadList.concat(customContentList))]));
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行(编码只使能用26个字母，编码长度不能超过4，候选长度不能超过64)：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行(编码只使能用26个字母，编码长度不能超过4，候选长度不能超过64)：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return blobList;
	}
	//生成QQ五笔输入法txt
	Util.parseQqWubi=function(str){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineListObj=Util.parseQqWubiByList(lineList);
		return {normal:Util.parseLineListToLineStr(newLineListObj.normal),custom:Util.parseLineListToLineStr(newLineListObj.custom)};
	};
	Util.parseQqWubiByList=function(lineList){
		var newLineListNormal=[];
		var newLineListCustom=[];
		var errorLineList=[];
		
		lineList=Util.sortByList(lineList);
		
		var repeatCount=1;
		var lastCode="";
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length>=2){
				currSplit[0]=currSplit[0].toLowerCase();
				if(lastCode!=currSplit[0]){
					lastCode=currSplit[0]
					repeatCount=1;
				}
				
				//替换空格
				currSplit[1]=currSplit[1].replace(/[$]20/g," ");
				
				var isCheckOk=false;//QQ五笔系统词库是否支持
				isCheckOk=/^[a-y]+$/.test(currSplit[0]);//编码为a到y
				if(isCheckOk){
					//候选在指定范围
					for(var j=0;j<currSplit[1].length;j++){
						var currCharCode=currSplit[1].charCodeAt(j);
						if(!(currCharCode>=0x3400&&currCharCode<=0x4db5 || currCharCode>=0x4e00&&currCharCode<=0x9faf || currCharCode>=0xe815&&currCharCode<=0x3864)){
							isCheckOk=false;
							break;
						}
					}
				}
				
				if(isCheckOk){
					newLineListNormal.push(currSplit[0]+" "+currSplit[1]);
				}else{
					newLineListCustom.push(currSplit[0]+"="+repeatCount+","+currSplit[1]);
				}
				
				repeatCount++;
			}else{
				errorLineList.push(lineList[i]);
			}
		}
		
		newLineListNormal=Util.comboByList(newLineListNormal);
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return {normal:newLineListNormal,custom:newLineListCustom};
	};
	//生成编码
	Util.generateCode=function(singleStr1,singleStr2,wordStr,ruleStr,isExceptWord){
		var singleLineList1=Util.parseLineStrToLineList(singleStr1);
		var singleLineList2=Util.parseLineStrToLineList(singleStr2);
		var wordLineList=Util.parseLineStrToLineList(wordStr);
		var ruleLineList=Util.parseLineStrToLineList(ruleStr,true);
		var newLineList=Util.generateCodeByList(singleLineList1,singleLineList2,wordLineList,ruleLineList,isExceptWord);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.generateCodeByList=function(singleLineList1,singleLineList2,wordLineList,ruleLineList,isExceptWord){
		var newLineList=[];
		var errorLineList=[];
		
		var tempLineList=[];
		var tempErrorLineList=[];
		
		//A组单字Map
		var singleLineMap1={};
		tempErrorLineList=[];
		for(var i=0;i<singleLineList1.length;i++){
			var currSplit=singleLineList1[i].split(" ");
			var currCode=currSplit[0];
			var currChar=currSplit[1];
			if(currSplit.length==2 && currCode.indexOf("　")<0){
				if(currChar.length==1){//只接收单字
					if(!singleLineMap1[currChar]){
						singleLineMap1[currChar]=[];
					}
					singleLineMap1[currChar].push(currCode);
				}
			}else{
				tempErrorLineList.push(singleLineList1[i]);
			}
		}
		if(tempErrorLineList.length>0){
			errorLineList.push(" A组单字词条：");
			errorLineList=errorLineList.concat(tempErrorLineList);
		}
		
		//B组单字Map
		var singleLineMap2={};
		tempErrorLineList=[];
		for(var i=0;i<singleLineList2.length;i++){
			var currSplit=singleLineList2[i].split(" ");
			var currCode=currSplit[0];
			var currChar=currSplit[1];
			if(currSplit.length==2 && currCode.indexOf("　")<0){
				if(currChar.length==1){//只接收单字
					if(!singleLineMap2[currChar]){
						singleLineMap2[currChar]=[];
					}
					singleLineMap2[currChar].push(currCode);
				}
			}else{
				tempErrorLineList.push(singleLineList2[i]);
			}
		}
		if(tempErrorLineList.length>0){
			errorLineList.push(" B组单字词条：");
			errorLineList=errorLineList.concat(tempErrorLineList);
		}
		
		//无编码词条List
		tempLineList=[];
		tempErrorLineList=[];
		for(var i=0;i<wordLineList.length;i++){
			if(wordLineList[i].split(" ").length==1){
				tempLineList.push(wordLineList[i]);
			}else{
				tempErrorLineList.push(wordLineList[i]);
			}
		}
		wordLineList=tempLineList;
		if(tempErrorLineList.length>0){
			errorLineList.push(" 无编码词条：");
			errorLineList=errorLineList.concat(tempErrorLineList);
		}
		
		//规则List
		tempLineList=[];
		tempErrorLineList=[];
		for(var i=0;i<ruleLineList.length;i++){
			if(/^$|^((([1-9][0-9]*[AB][R]?[1-9][0-9]*([:][R]?[1-9][0-9]*)?[UL]?)|(0[A-Z,./;'`\-=\[\]]))([ ](([1-9][0-9]*[AB][R]?[1-9][0-9]*([:][R]?[1-9][0-9]*)?[UL]?)|(0[A-Z,./;'`\-=\[\]])))*)$/i.test(ruleLineList[i])){
				var newRuleList=[];
				var oldRuleList=ruleLineList[i].split(" ");
				
				for(var j=0;j<oldRuleList.length;j++){
					var currRuleStr=oldRuleList[j];
					if(currRuleStr!=""){
						var ruleObj={
							isACharNotRule:false,//是直接字符还是规则(true：直接字符)
							charNum:0,//取第几个字的编码
							isANotB:true,//使用A组还是B组的编码(true：A组)
							numStart:0,//开始位置
							isStartFromRight:false,//开始位置是否倒数
							numEnd:0,//末尾位置
							isEndFromRight:false,//末尾位置是否倒数
							isUpperLower:0,//大小写，0不变，1大写，2小写
							str:""//字符
						};
						var tempStr="";
						
						if(currRuleStr.substr(0,1)=="0"){
							ruleObj.isACharNotRule=true;//直接字符
							ruleObj.str=currRuleStr.substr(1,1);
						}else{
							ruleObj.isACharNotRule=false;//规则
							
							currRuleStr=currRuleStr.toUpperCase();
							
							//取第几个字的编码
							tempStr=currRuleStr.match(/[0-9]+/);
							ruleObj.charNum=Number(tempStr)-1;
							currRuleStr=currRuleStr.substr(tempStr[0].length);
							
							//使用A组还是B组的编码
							if(currRuleStr.substr(0,1)=="A"){
								ruleObj.isANotB=true;//A
							}else{
								ruleObj.isANotB=false;//B
							}
							currRuleStr=currRuleStr.substr(1);
							
							//开始位置是否倒数
							if(currRuleStr.substr(0,1)=="R"){
								ruleObj.isStartFromRight=true;
								currRuleStr=currRuleStr.substr(1);
							}else{
								ruleObj.isStartFromRight=false;
							}
							
							//开始位置
							tempStr=currRuleStr.match(/[0-9]+/);
							ruleObj.numStart=Number(tempStr)-1;
							currRuleStr=currRuleStr.substr(tempStr.length);
							
							if(currRuleStr.length>0 && currRuleStr.substr(0,1)==":"){
								//规则中还有结束位置
								currRuleStr=currRuleStr.substr(1);
								
								//末尾位置是否倒数
								if(currRuleStr.substr(0,1)=="R"){
									ruleObj.isEndFromRight=true;
									currRuleStr=currRuleStr.substr(1);
								}else{
									ruleObj.isEndFromRight=false;
								}
								
								//末尾位置
								tempStr=currRuleStr.match(/[0-9]+/);
								ruleObj.numEnd=Number(tempStr)-1;
								currRuleStr=currRuleStr.substr(tempStr.length);
							}else{
								//规则中只有开始位置
								ruleObj.numEnd=ruleObj.numStart;
								ruleObj.isEndFromRight=ruleObj.isStartFromRight;
							}
							
							//大小写
							if(currRuleStr=="U"){
								ruleObj.isUpperLower=1;//大写
							}else if(currRuleStr=="L"){
								ruleObj.isUpperLower=2;//小写
							}
						}
						
						newRuleList.push(ruleObj);
					}
				}
				
				tempLineList.push(newRuleList);
			}else{
				tempErrorLineList.push(ruleLineList[i]);
			}
		}
		ruleLineList=tempLineList;
		if(tempErrorLineList.length>0){
			ruleLineList=[];
			tempErrorLineList.splice(0, 0, " 规则： 直接字符只支持英文字母或 , . / ; ' ` - = [ ]")
			errorLineList=tempErrorLineList.concat(errorLineList);
		}
		
		//生成编码
		var isRuleBlank=true;
		for(var i=0;i<ruleLineList.length;i++){
			if(ruleLineList[i].length>0){
				isRuleBlank=false;
				break;
			}
		}
		if(!isRuleBlank){
			var excludeCharStrMap={};//无编码词条中包含编码A或B中没有包含的字，临时存储
			
			wordLineWarp:
			for(var i=0;i<wordLineList.length;i++){
				
				var currStr=wordLineList[i];
				var currStrLength=currStr.length;//待生成词的字数
				
				var currRuleList=ruleLineList[currStrLength-1];
				if(currRuleList && currRuleList.length>0){
					var concatedCodeList=[""];
					
					for(var j=0;j<currRuleList.length;j++){
						var currRule=currRuleList[j];
						
						if(currRule.isACharNotRule){//直接字符
							for(var k=0;k<concatedCodeList.length;k++){
								concatedCodeList[k]=concatedCodeList[k]+currRule.str;
							}
						}else{//规则
							if(currRule.charNum>=currStrLength){
								continue;
							}else{
								var currChar=currStr.substr(currRule.charNum,1);
								var currCodeList=currRule.isANotB?singleLineMap1[currChar]:singleLineMap2[currChar];
								
								if(!currCodeList){
									excludeCharStrMap[currStr]=currStr;
									continue wordLineWarp;
								}
								
								var fromNum=0;
								var endNum=0;
								var stepNum=0;
								
								var tempList=[];
								for(var k=0;k<currCodeList.length;k++){
									var currCode=currCodeList[k];
									
									//开始编码位置
									if(currRule.isStartFromRight){
										fromNum=currCode.length-1-currRule.numStart;
									}else{
										fromNum=currRule.numStart;
									}
									
									//结尾编码位置
									if(currRule.isEndFromRight){
										endNum=currCode.length-1-currRule.numEnd;
									}else{
										endNum=currRule.numEnd;
									}
									
									for(var l=0;l<concatedCodeList.length;l++){
										var concatedCode=concatedCodeList[l];
										
										var tempCodeStr="";
										for(var m=fromNum;fromNum<=endNum && m<=endNum || fromNum>endNum && m>=endNum;m+=(endNum>=fromNum?1:-1)){
											if(m>=currCode.length || m<0){
												tempCodeStr+="　";
											}else{
												tempCodeStr+=currCode.substr(m,1);
											}
										}
										
										if(currRule.isUpperLower==1){//大写
											tempCodeStr=tempCodeStr.toUpperCase();
										}else if(currRule.isUpperLower==2){//小写
											tempCodeStr=tempCodeStr.toLowerCase();
										}
										
										tempCodeStr=tempCodeStr.replace(/_/g,"")//下划线识别为无编码
										
										tempList.push(concatedCodeList[l]+tempCodeStr);
									}
								}
								concatedCodeList=tempList;
							}
						}
					}
					
					if(concatedCodeList.length==1 && concatedCodeList[0]==""){
						concatedCodeList=[];
					}
					
					for(var j=concatedCodeList.length-1;j>=0;j--){
						if(concatedCodeList[j].indexOf("　")>=0){
							if(isExceptWord==1){
								concatedCodeList.splice(j,1);
								continue;
							}else{
								concatedCodeList[j]=concatedCodeList[j].replace("　","")
								if(concatedCodeList[j].length<=0){//替换后编码不足1码时，删除当前编码
									concatedCodeList.splice(j,1);
									continue;
								}
							}
						}
						concatedCodeList[j]=concatedCodeList[j]+" "+currStr;
					}
					
//					newLineList=newLineList.concat(concatedCodeList);//数组concat在循环中效率低下，所以只能自己手写push的循环
					for(var j=0;j<concatedCodeList.length;j++){
						newLineList.push(concatedCodeList[j]);
					}
				}
			}
			
			if(!Util.isEmptyObject(excludeCharStrMap)){
				errorLineList.push(" 无编码词条中有未包含的字：");
				for(var excludeStr in excludeCharStrMap){
					errorLineList.push(excludeStr);
				}
			}
		}
		
		//去重
		newLineList=Util.mergeDictByList(newLineList);
		
		if(errorLineList.length>0){
			console.log("格式错误：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//编辑编码（重新生成编码）
	Util.generateEditCode=function(wordStr1,singleStr2,ruleStr,isExceptWord){
		var wordLineList1=Util.parseLineStrToLineList(wordStr1);
		var singleLineList2=Util.parseLineStrToLineList(singleStr2);
		var ruleLineList=Util.parseLineStrToLineList(ruleStr,true);
		var newLineList=Util.generateEditCodeByList(wordLineList1,singleLineList2,ruleLineList,isExceptWord);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.generateEditCodeByList=function(wordLineList1,singleLineList2,ruleLineList,isExceptWord){
		var newLineList=[];
		var errorLineList=[];
		
		var tempLineList=[];
		var tempErrorLineList=[];
		
		//A组待生成编码Map
		var wordLineMap1={};
		tempErrorLineList=[];
		for(var i=0;i<wordLineList1.length;i++){
			var currSplit=wordLineList1[i].split(" ");
			var currCode=currSplit[0];
			var currChar=currSplit[1];
			if(currSplit.length==2 && currCode.indexOf("　")<0){
				if(!wordLineMap1[currChar]){
					wordLineMap1[currChar]=[];
				}
				wordLineMap1[currChar].push(currCode);
			}else{
				tempErrorLineList.push(wordLineList1[i]);
			}
		}
		if(tempErrorLineList.length>0){
			errorLineList.push(" A组单字词条：");
			errorLineList=errorLineList.concat(tempErrorLineList);
		}
		
		//B组单字Map
		var singleLineMap2={};
		tempErrorLineList=[];
		for(var i=0;i<singleLineList2.length;i++){
			var currSplit=singleLineList2[i].split(" ");
			var currCode=currSplit[0];
			var currChar=currSplit[1];
			if(currSplit.length==2 && currCode.indexOf("　")<0){
				if(currChar.length==1){//只接收单字
					if(!singleLineMap2[currChar]){
						singleLineMap2[currChar]=[];
					}
					singleLineMap2[currChar].push(currCode);
				}
			}else{
				tempErrorLineList.push(singleLineList2[i]);
			}
		}
		if(tempErrorLineList.length>0){
			errorLineList.push(" B组单字词条：");
			errorLineList=errorLineList.concat(tempErrorLineList);
		}
		
		//规则List
		tempLineList=[];
		tempErrorLineList=[];
		for(var i=0;i<ruleLineList.length;i++){
			if(/^$|^(((((1A)|([1-9][0-9]*B))[R]?[1-9][0-9]*([:][R]?[1-9][0-9]*)?[UL]?)|(0[A-Z,./;'`\-=\[\]]))([ ]((((1A)|([1-9][0-9]*B))[R]?[1-9][0-9]*([:][R]?[1-9][0-9]*)?[UL]?)|(0[A-Z,./;'`\-=\[\]])))*)$/i.test(ruleLineList[i])){
				var newRuleList=[];
				var oldRuleList=ruleLineList[i].split(" ");
				
				for(var j=0;j<oldRuleList.length;j++){
					var currRuleStr=oldRuleList[j];
					if(currRuleStr!=""){
						var ruleObj={
							isACharNotRule:false,//是直接字符还是规则(true：直接字符)
							charNum:0,//取第几个字的编码
							isANotB:true,//使用A组还是B组的编码(true：A组)
							numStart:0,//开始位置
							isStartFromRight:false,//开始位置是否倒数
							numEnd:0,//末尾位置
							isEndFromRight:false,//末尾位置是否倒数
							isUpperLower:0,//大小写，0不变，1大写，2小写
							str:""//字符
						};
						var tempStr="";
						
						if(currRuleStr.substr(0,1)=="0"){
							ruleObj.isACharNotRule=true;//直接字符
							ruleObj.str=currRuleStr.substr(1,1);
						}else{
							ruleObj.isACharNotRule=false;//规则
							
							currRuleStr=currRuleStr.toUpperCase();
							
							//取第几个字的编码
							tempStr=currRuleStr.match(/[0-9]+/);
							ruleObj.charNum=Number(tempStr)-1;
							currRuleStr=currRuleStr.substr(tempStr[0].length);
							
							//使用A组还是B组的编码
							if(currRuleStr.substr(0,1)=="A"){
								ruleObj.isANotB=true;//A
							}else{
								ruleObj.isANotB=false;//B
							}
							currRuleStr=currRuleStr.substr(1);
							
							//开始位置是否倒数
							if(currRuleStr.substr(0,1)=="R"){
								ruleObj.isStartFromRight=true;
								currRuleStr=currRuleStr.substr(1);
							}else{
								ruleObj.isStartFromRight=false;
							}
							
							//开始位置
							tempStr=currRuleStr.match(/[0-9]+/);
							ruleObj.numStart=Number(tempStr)-1;
							currRuleStr=currRuleStr.substr(tempStr.length);
							
							if(currRuleStr.length>0 && currRuleStr.substr(0,1)==":"){
								//规则中还有结束位置
								currRuleStr=currRuleStr.substr(1);
								
								//末尾位置是否倒数
								if(currRuleStr.substr(0,1)=="R"){
									ruleObj.isEndFromRight=true;
									currRuleStr=currRuleStr.substr(1);
								}else{
									ruleObj.isEndFromRight=false;
								}
								
								//末尾位置
								tempStr=currRuleStr.match(/[0-9]+/);
								ruleObj.numEnd=Number(tempStr)-1;
								currRuleStr=currRuleStr.substr(tempStr.length);
							}else{
								//规则中只有开始位置
								ruleObj.numEnd=ruleObj.numStart;
								ruleObj.isEndFromRight=ruleObj.isStartFromRight;
							}
							
							//大小写
							if(currRuleStr=="U"){
								ruleObj.isUpperLower=1;//大写
							}else if(currRuleStr=="L"){
								ruleObj.isUpperLower=2;//小写
							}
						}
						
						newRuleList.push(ruleObj);
					}
				}
				
				tempLineList.push(newRuleList);
			}else{
				tempErrorLineList.push(ruleLineList[i]);
			}
		}
		ruleLineList=tempLineList;
		if(tempErrorLineList.length>0){
			ruleLineList=[];
			tempErrorLineList.splice(0, 0, " 规则： 直接字符只支持英文字母或 , . / ; ' ` - = [ ]")
			errorLineList=tempErrorLineList.concat(errorLineList);
		}
		
		//生成编码
		var isRuleBlank=true;
		for(var i=0;i<ruleLineList.length;i++){
			if(ruleLineList[i].length>0){
				isRuleBlank=false;
				break;
			}
		}
		if(!isRuleBlank){
			var excludeCharStrMap={};//无编码词条中包含编码A或B中没有包含的字，临时存储
			
			wordLineWarp:
			for(var currStr in wordLineMap1){
				
				var currStrLength=currStr.length;//待生成词的字数
				
				var currRuleList=ruleLineList[currStrLength-1];
				if(currRuleList && currRuleList.length>0){
					var concatedCodeList=[""];
					
					for(var j=0;j<currRuleList.length;j++){
						var currRule=currRuleList[j];
						
						if(currRule.isACharNotRule){//直接字符
							for(var k=0;k<concatedCodeList.length;k++){
								concatedCodeList[k]=concatedCodeList[k]+currRule.str;
							}
						}else{//规则
							if(currRule.charNum>=currStrLength){
								continue;
							}else{
								var currChar=currStr.substr(currRule.charNum,1);
								var currCodeList=currRule.isANotB?wordLineMap1[currChar]:singleLineMap2[currChar];
								var currCodeList="";
								if(currRule.isANotB){
									currCodeList=wordLineMap1[currStr];
								}else{
									currCodeList=singleLineMap2[currChar];
								}
								
								if(!currCodeList){
									excludeCharStrMap[currStr]=currStr;
									continue wordLineWarp;
								}
								
								var fromNum=0;
								var endNum=0;
								var stepNum=0;
								
								var tempList=[];
								for(var k=0;k<currCodeList.length;k++){
									var currCode=currCodeList[k];
									
									//开始编码位置
									if(currRule.isStartFromRight){
										fromNum=currCode.length-1-currRule.numStart;
									}else{
										fromNum=currRule.numStart;
									}
									
									//结尾编码位置
									if(currRule.isEndFromRight){
										endNum=currCode.length-1-currRule.numEnd;
									}else{
										endNum=currRule.numEnd;
									}
									
									for(var l=0;l<concatedCodeList.length;l++){
										var concatedCode=concatedCodeList[l];
										
										var tempCodeStr="";
										for(var m=fromNum;fromNum<=endNum && m<=endNum || fromNum>endNum && m>=endNum;m+=(endNum>=fromNum?1:-1)){
											if(m>=currCode.length || m<0){
												tempCodeStr+="　";
											}else{
												tempCodeStr+=currCode.substr(m,1);
											}
										}
										
										if(currRule.isUpperLower==1){//大写
											tempCodeStr=tempCodeStr.toUpperCase();
										}else if(currRule.isUpperLower==2){//小写
											tempCodeStr=tempCodeStr.toLowerCase();
										}
										
										tempCodeStr=tempCodeStr.replace(/_/g,"")//下划线识别为无编码
										
										tempList.push(concatedCodeList[l]+tempCodeStr);
									}
								}
								concatedCodeList=tempList;
							}
						}
					}
					
					if(concatedCodeList.length==1 && concatedCodeList[0]==""){
						concatedCodeList=[];
					}
					
					for(var j=concatedCodeList.length-1;j>=0;j--){
						if(concatedCodeList[j].indexOf("　")>=0){
							if(isExceptWord==1){
								concatedCodeList.splice(j,1);
								continue;
							}else{
								concatedCodeList[j]=concatedCodeList[j].replace("　","")
								if(concatedCodeList[j].length<=0){//替换后编码不足1码时，删除当前编码
									concatedCodeList.splice(j,1);
									continue;
								}
							}
						}
						concatedCodeList[j]=concatedCodeList[j]+" "+currStr;
					}
					
//					newLineList=newLineList.concat(concatedCodeList);//数组concat在循环中效率低下，所以只能自己手写push的循环
					for(var j=0;j<concatedCodeList.length;j++){
						newLineList.push(concatedCodeList[j]);
					}
				}
			}
			
			if(!Util.isEmptyObject(excludeCharStrMap)){
				errorLineList.push(" 组待生成编码词条中有B组未包含的字：");
				for(var excludeStr in excludeCharStrMap){
					errorLineList.push(excludeStr);
				}
			}
		}
		
		//去重
		newLineList=Util.mergeDictByList(newLineList);
		
		if(errorLineList.length>0){
			console.log("格式错误：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//排除字词
	Util.includeExcludeWord=function(str,includeExcludeStr,isNoCode,isNoCode2,isCheckCode,isExclude){
		var lineList=Util.parseLineStrToLineList(str);
		var lineListIncludeExclude=Util.parseLineStrToLineList(includeExcludeStr);
		var newLineList=Util.includeExcludeWordByList(lineList,lineListIncludeExclude,isNoCode,isNoCode2,isCheckCode,isExclude);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.includeExcludeWordByList=function(lineList,lineListIncludeExclude,isNoCode,isNoCode2,isCheckCode,isExclude){
		var isAllMatch=false;
		var newLineList=[];
		var errorLineList=[];
		var tempErrorList=[];
		var inexcludeMap={};
		
		if(isNoCode==1){
			isNoCode=true;
		}else{//isNoCode==2
			isNoCode=false;
		}
		if(isNoCode2==1){
			isNoCode2=true;
		}else{//isNoCode2==2
			isNoCode2=false;
		}
		if(Math.floor(isExclude / 2)==0){
			isAllMatch=true;
		}else{//Math.floor(isExclude / 2)==1
			isAllMatch=false;
		}
		if(isExclude % 2==1){
			isExclude=true;
		}else{//isExclude % 2==0
			isExclude=false;
		}
		
		if(!isNoCode && !isNoCode2 && isCheckCode==1){
			//两组都是带编码词条，比较编码且比较候选
			for(var i=0;i<lineListIncludeExclude.length;i++){
				var currSplit=lineListIncludeExclude[i].split(" ");
				if(currSplit.length==2){
					if(!inexcludeMap[currSplit[0]]){
						inexcludeMap[currSplit[0]]=[];
					}
					inexcludeMap[currSplit[0]].push(currSplit[1]);
				}else{
					tempErrorList.push(lineListIncludeExclude[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 参考字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
			
			for(var i=0;i<lineList.length;i++){
				var currSplit=lineList[i].split(" ");
				if(currSplit.length==2){
					if(inexcludeMap.hasOwnProperty(currSplit[0])){
						var currCharList=inexcludeMap[currSplit[0]];
						var isCurrMatch=false;
						for(var j=0;j<currCharList.length;j++){
							if(isAllMatch && currSplit[1] == currCharList[j] || !isAllMatch && currSplit[1].indexOf(currCharList[j]) >= 0){
								isCurrMatch=true;
								break;
							}
						}
						if(isExclude ^ isCurrMatch){
							newLineList.push(lineList[i]);
						}
					}else{
						if(isExclude){
							newLineList.push(lineList[i]);
						}
					}
				}else{
					tempErrorList.push(lineList[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 待提取字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
		}else if(!isNoCode && !isNoCode2 && isCheckCode==2){
			//两组都是带编码词条，仅比较编码
			for(var i=0;i<lineListIncludeExclude.length;i++){
				var currSplit=lineListIncludeExclude[i].split(" ");
				if(currSplit.length==2){
					if(!inexcludeMap[currSplit[0]]){
						inexcludeMap[currSplit[0]]=[];
					}
					inexcludeMap[currSplit[0]].push(currSplit[1]);
				}else{
					tempErrorList.push(lineListIncludeExclude[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 参考字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
			
			for(var i=0;i<lineList.length;i++){
				var currSplit=lineList[i].split(" ");
				if(currSplit.length==2){
					if(inexcludeMap.hasOwnProperty(currSplit[0])){
						newLineList.push(lineList[i]);
					}
				}else{
					tempErrorList.push(lineList[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 待提取字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
		}else{
			//仅比较候选
			var inexcludeMap={};
			for(var i=0;i<lineListIncludeExclude.length;i++){
				var currSplit=lineListIncludeExclude[i].split(" ");
				if(isNoCode2 && currSplit.length==1){
					inexcludeMap[lineListIncludeExclude[i]]=lineListIncludeExclude[i];
				}else if(!isNoCode2 && currSplit.length==2){
					inexcludeMap[currSplit[1]]=currSplit[1];
				}else{
					tempErrorList.push(lineListIncludeExclude[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 参考字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
			
			for(var i=0;i<lineList.length;i++){
				var currSplit=lineList[i].split(" ");
				var inexcludeCharStr="";
				if(isNoCode && currSplit.length==1){
					inexcludeCharStr=lineList[i];
				}else if(!isNoCode && currSplit.length==2){
					inexcludeCharStr=currSplit[1];
				}else{
					tempErrorList.push(lineList[i]);
				}
				
				var isCurrMatch=false;
				if(isAllMatch){
					isCurrMatch=inexcludeMap.hasOwnProperty(inexcludeCharStr);
				}else{
					for(var inexcludeChar in inexcludeMap){
						if(inexcludeCharStr.indexOf(inexcludeChar) >= 0){
							isCurrMatch=true;
							break;
						}
					}
				}
				if(isExclude ^ isCurrMatch){
					newLineList.push(lineList[i]);
				}
			}
			if(tempErrorList.length>0){
				errorLineList.push(" 待提取字词词条：");
				errorLineList=errorLineList.concat(tempErrorList);
			}
			tempErrorList=[];
		}
		
		if(errorLineList.length>0){
			console.log("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
			alert("格式错误数据行：\n"+Util.parseLineListToLineStr(errorLineList));
		}
		
		return newLineList;
	}
	//去除候选唯一
	Util.breakUnique=function(str,breakCodeLength){
		var lineList=Util.parseLineStrToLineList(str);
		var newLineList=Util.breakUniqueByList(lineList,breakCodeLength);
		return Util.parseLineListToLineStr(newLineList);
	};
	Util.breakUniqueByList=function(lineList,breakCodeLength){
		var newLineList=[];
		var lastCode="";
		var codeLength=0;
		var repeatNum=0;
		
		for(var i=0;i<lineList.length;i++){
			var currSplit=lineList[i].split(" ");
			if(currSplit.length==2){
				var currCode=currSplit[0].toLowerCase();
				var currChar=currSplit[1];
				codeLength=currCode.length;
				var charLength=currChar.length;
				
				//测试并添加全角空格候选
				if(codeLength!=breakCodeLength){
					if(repeatNum==1){
						newLineList.push(lastCode+" "+"　");
					}
					lastCode=currCode;
					repeatNum=0;
				}else if(lastCode!=currCode){
					if(repeatNum==1){
						newLineList.push(lastCode+" "+"　");
					}
					lastCode=currCode;
					repeatNum=1;
				}else{
					repeatNum++;
				}
				
				newLineList.push(lineList[i]);
			}
		}
		//测试并添加全角空格候选
		if(codeLength==breakCodeLength){
			if(repeatNum==1){
				newLineList.push(lastCode+" "+"　");
			}
		}
		
		return newLineList;
	}
	
	//功能加固组件
	!function(w,u){function i(s){return s>=0}w.Util={};for(var n in u)if(typeof u[n] == "string")if(n=="\x63\x6f\x70\x79\x72\x69\x67\x68\x74"&&i(u[n].indexOf("\u4F5C\u8005\x61\x73\x64\x32\x66\x71\x75\x65\x31")))w.Util=u;}(wn,Util);
}(window);
$(document).ready(function(){
	//设置初始焦点
	var startDom=$("#txtSource");
	if(startDom.size()>0){
		startDom.focus();
	}else{
		startDom=$("#txtSource1");
		if(startDom.size()>0){
			startDom.focus();
		}
	}
});