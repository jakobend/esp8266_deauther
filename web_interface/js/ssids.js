var ssidJson = {"random":false,"masked":false,"ssids":[],"masks":[]};
				
function load(){
	getFile("run?cmd=save ssids", function(){
		getFile("ssids.json",function(res){
			ssidJson = JSON.parse(res);
			draw();
		});
	});
}

function draw(){
	var html;
	
	html = "<tr>"
		+ "<th class='id'></th>"
		+ "<th class='ssid'></th>"
		+ "<th class='lock'></th>"
		+ "<th class='save'></th>"
		+ "<th class='remove'></th>"
		+ "</tr>";
	
	for(var i=0;i<ssidJson.ssids.length;i++){
		html += "<tr>"
			+ "<td class='id'>"+i+"</td>" // ID
			+ "<td class='ssid' contenteditable='true' id='ssid_"+i+"'>"+esc(ssidJson.ssids[i][0].substring(0,ssidJson.ssids[i][2]))+"</td>" // SSID
			+ "<td class='lock clickable' onclick='changeEnc("+i+")' id='enc_"+i+"'>"+(ssidJson.ssids[i][1] ? "&#x1f512;" : "-")+"</td>" // Enc
			+ "<td class='save'><button class='green' onclick='save("+i+")'>"+lang("save")+"</button></td>" // Save
			+ "<td class='remove'><button class='red' onclick='remove("+i+")'>X</button></td>" // Remove
			+ "</tr>";
	}
	
	getE("randomBtn").innerHTML = ssidJson.random ? lang("disable_random") : lang("enable_random");
	
	getE("ssidTable").innerHTML = html;

	html = "";

	for(var i=0;i<ssidJson.masks.length;i++){
		html += "<tr>"
			+ "<td class='id'>"+i+"</td>" // ID
			+ "<td class='mask' contenteditable='true' id='mask_"+i+"'>"+esc(ssidJson.masks[i])+"</td>" // Mask
			+ "<td class='save'><button class='green' onclick='saveMask("+i+")'>"+lang("save")+"</button></td>" // Save
			+ "<td class='remove'><button class='red' onclick='removeMask("+i+")'>X</button></td>" // Remove
			+ "</tr>";
	}

	getE("maskedBtn").innerHTML = ssidJson.masked ? lang("disable_masked") : lang("enable_masked");
	
	getE("maskTable").innerHTML = html;
}

function remove(id){
	ssidJson.ssids.splice(id, 1);
	getFile("run?cmd=remove ssid "+id);
	draw();
}

function removeMask(id) {
	ssidJson.masks.splice(id, 1);
	getFile("run?cmd=remove mask " + id);
	draw();
}

function add(){
	var ssidStr = getE("ssid").value;
	var wpa2 = getE("enc").checked;
	var clones = getE("ssidNum").value;
	var force = getE("overwrite").checked;
	
	if(ssidStr.length > 0){
		var cmdStr = "add ssid \""+ssidStr+"\""+(force ? " -f":" ")+" -cl "+clones;
		if(wpa2) cmdStr += " -wpa2";
		
		getFile("run?cmd="+cmdStr);
		
		for(var i=0;i<clones;i++){
			if(ssidJson.ssids.length >= 60) ssidJson.ssids.splice(0,1);
			ssidJson.ssids.push([ssidStr,wpa2]);
		}
		
		draw();
	}
}

function addMask() {
	var maskStr = getE("mask").value;
	if (maskStr.length > 0) {
		var cmdStr = "add mask \"" + maskStr + "\"";
		getFile("run?cmd=" + cmdStr);
		ssidJson.masks.push(maskStr);
		draw();
	}
}

function toggleRandom(){
	if(ssidJson.random){
		getFile("run?cmd=disable random",function(){
			load();
		});
	}else{
		getFile("run?cmd=enable random "+getE("interval").value,function(){
			load();
		});
	}
}

function toggleMasked(){
	if(ssidJson.masked){
		getFile("run?cmd=disable masked",function(){
			load();
		});
	}else{
		getFile("run?cmd=enable masked",function(){
			load();
		});
	}
}

function addSelected(){
	getFile("run?cmd=add ssid -s"+(getE("overwrite").checked ? " -f":""));
}

function changeEnc(id){
	ssidJson.ssids[id][1] = !ssidJson.ssids[id][1];
	draw();
	save(id);
}

function removeAll(){
	ssidJson.ssids = [];
	getFile("run?cmd=remove ssids");
	draw();
}

function removeAllMasks() {
	ssidJson.masks = [];
	getFile("run?cmd=remove masks");
	draw();
}

function save(id){
	var name = getE("ssid_"+id).innerHTML.replace("<br>","").substring(0,32);
	var wpa2 = ssidJson.ssids[id][1];
	ssidJson.ssids[id] = [name,wpa2];
	
	getFile("run?cmd=replace ssid "+id+" -n \""+name+"\" "+(wpa2 ? "-wpa2" : ""));
}

function saveMask(id) {
	var mask = getE("mask_" + id).innerHTML.replace("<br>", "");
	ssidJson.masks[id] = mask;
	getFile("run?cmd=replace mask " + id + " \"" + mask + "\"");
}
