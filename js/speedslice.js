var clickbuster={};
FastButton = function(element, handler) {
  this.element = element;
  this.handler = handler;
  element.addEventListener('touchstart', this, false);
  element.addEventListener('click', this, false);
};

FastButton.prototype.handleEvent = function(event) {
  switch (event.type) {
    case 'touchstart': this.onTouchStart(event); break;
    case 'touchmove': this.onTouchMove(event); break;
    case 'touchend':this.onClick(event); break;
    case 'click':this.onClick(event); break;
  }
};
FastButton.prototype.onTouchStart = function(event) {
  event.stopPropagation();

  this.element.addEventListener('touchend', this, false);
  document.body.addEventListener('touchmove', this, false);

  this.startX = event.touches[0].clientX;
  this.startY = event.touches[0].clientY;
};
FastButton.prototype.onTouchMove = function(event) {
  if (Math.abs(event.touches[0].clientX - this.startX) > 10 ||
      Math.abs(event.touches[0].clientY - this.startY) > 10) {
    this.reset();
  }
};
FastButton.prototype.onClick = function(event) {
  event.stopPropagation();
  this.reset();
  this.handler(event);

  if (event.type == 'touchend') {
    clickbuster.preventGhostClick(this.startX, this.startY);
  }
};

FastButton.prototype.reset = function() {
  this.element.removeEventListener('touchend', this, false);
  document.body.removeEventListener('touchmove', this, false);
};
clickbuster.preventGhostClick = function(x, y) {
  clickbuster.coordinates.push(x, y);
  window.setTimeout(clickbuster.pop, 2500);
};

clickbuster.pop = function() {
  clickbuster.coordinates.splice(0, 2);
};
clickbuster.onClick = function(event) {
  for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
    var x = clickbuster.coordinates[i];
    var y = clickbuster.coordinates[i + 1];
    if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
      event.stopPropagation();
      event.preventDefault();
	  if(event.type=="mousedown"){
		  event.target.blur();
	  }
    }
  }
};

document.addEventListener('click', clickbuster.onClick, true);
clickbuster.coordinates = [];
address=new Object();
address.addrNick="";
address.addr="";
address.addr2="";
address.city="";
address.zip="";
address.phone="";
address.state="";
//update this value;
additionalPizzas=new Object();
cardReturnTo="account";
prevSlide=1;
//host="https://speedslice.com/app/Final/";
host="http://pizzadelivery.piecewise.com/Final/";
lastY=0;
initY=0;
lastSlides=new Array();
scrollBarNmbr=0;
touchStarted=false;
noAddrText="No location selected";
var pushNotification;
window.onerror = function(msg, url, linenumber) {
	hideLoader();
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}
function onLoad() {
	
	//if('deviceready' in document){
		//alert(true);
		document.addEventListener("deviceready", onDeviceReady, false);
	/*}
	else{
		loadInfo();
	}*/
}
function onDeviceReady() {
	checkConnection();
	document.addEventListener("menubutton", onMenuKeyDown, false);
	document.addEventListener("backbutton", onBackButton, false);
	document.addEventListener("offline", checkConnection, false);
	pushNotification = window.plugins.pushNotification;
}
function checkConnection(){
	setTimeout(function(){
		var networkState = navigator.network.connection.type;//needs to be navigator.connection if phonegap updated.
		if(networkState==Connection.NONE){
			navigator.notification.alert("SpeedSlice requires an active internet connection.",checkConnection,"SpeedSlice","Okay");
		}
		else{
			if(typeof loggedIn=="undefined"){
				loadInfo();
			}
		}
	},1000);
}
function loadInfo(){
	$(window).on("resize",function(){
		$("html").css("font-size",($(window).width()/5.12)+"%");
	});
	document.getElementById("ss-blocker").addEventListener("click",function(e){
		e.stopPropagation();
		e.preventDefault();
	},true);
	document.getElementById("ss-blocker").addEventListener("mousedown",function(e){
		e.stopPropagation();
		e.preventDefault();
	},true);

	var sectionEle=document.getElementsByTagName("section");
	var numEle=sectionEle.length;
	var newHeight=window.innerHeight;
	for(i=0; i<numEle; i++){
		sectionEle.item(i).style.minHeight=newHeight+"px";
		sectionEle.item(i).style.height=newHeight+"px";
	}
	$.get(host+"LoginStatus.php",function(data){
		loggedIn=(data==1 ? true:false);
		//setTimeout("navigator.splashscreen.hide()",1000);
		if(loggedIn){
			showOrderText()
			getDeliveryOpts();
			getCardInfo();
			getUserInfo();
			$("#signIn").hide();
			$("#signOut").removeClass("nD");
			if(localStorage.getItem("LastAddress")!=null){
				address.addrNick=localStorage.LastAddress;//ie placeholder
				$("#addressTo>span").text(address.addrNick);
			}
		}
	});
	var headerHeight=$("section:visible").find("header");
	var footerHeight=$("section:visible").find("footer").outerHeight(true);
	var sliderHeight=window.innerHeight-headerHeight.outerHeight(true)-footerHeight-25;//25 adjusts 
	$(".infoWrapper").css("height",sliderHeight);
	sliderHeight=sliderHeight-headerHeight.outerHeight();//approximating for height of Terms/Privacy bigred header divs
	$(".aSlider,.aSlider>div:first").css("height",sliderHeight);
	$.customScrolling("abtContentWrapper","abtContent","aboutSlider");
	$.customScrolling("legalContentWrapper","legalContent","legalSlider");
	$.customScrolling("supportContentWrapper","supportContent","supportSlider");
	checkCustomScrolling();
	/*new FastButton(document.getElementById("facebookLink"),function(){
		window.plugins.childBrowser.showWebPage("https://www.facebook.com/SpeedSlice");
	});*/
	$("section").on("blur","input",function(){
		window.scrollTo(0,0);
	});
	var mmBtns=document.getElementsByClassName("mmenuLink");
	for(var i=0; i<mmBtns.length; i++){
		new FastButton(mmBtns[i],function(){$("nav#my-menu").trigger("open.mm");});
	}
	var backButtons=document.getElementsByClassName("back");
	for(var i=0; i<backButtons.length; i++){
		new FastButton(backButtons[i],onBackButton);
	}
	new FastButton(document.getElementById("createAccount"),createAccount);
	new FastButton(document.getElementById("findRestaurantsForOrder"),orderPizzaPage);
	new FastButton(document.getElementsByClassName("home")[0],function(){
		if(loggedIn){
			addrRtrnTo="selectPizza";
			switchSlides(1);
		}
		else {
			switchSlides(4);
		}
	});
	new FastButton(document.getElementById("gpsButton"),getGpsLocation);
	new FastButton(document.getElementById("setNewAddress"),setNewAddress);
	new FastButton(document.getElementById("saveEditLoc"),updateAddress);
	new FastButton(document.getElementById("orderPizza"),function(){switchSlides(0);});
	new FastButton(document.getElementById("changePass"),function(){
		showLoader();
		var oldPw=$("#oldPw").val();
		var newPw=$("#newPw").val();
		var email=$("#yourEmail").val();
		if(!emptyLine(oldPw) && !emptyLine(newPw) && !emptyLine(email)){
			$.post(host+"ChangePassword.php",{oldPw:oldPw,newPw:newPw,email:email},function(data){
				hideLoader();
				try{
					data=JSON.parse(data);
					if(typeof data.error!="undefined"){
						$("#changePassError").text(data.error).show();	
						$("#changePassSuccess").hide();
					}
					else{
						$("#changePassSuccess").text(data.success).show();
						$("#changePassError").hide();
					}
				}
				catch(err){
					
				}
			}).error(function(){
				$("#changePassError").text("Error occurred. Please check fields.").show();	
				$("#changePassSuccess").hide();
				hideLoader();
			});
		}
		
	});
	new FastButton(document.getElementById("accountInfo"),function(){
		if(loggedIn) {
			switchSlides(7);
		} else{
			switchSlides(4);
		}
	});
	new FastButton(document.getElementById("paymentInfo"),function(){
		if(loggedIn){
			switchSlides(5);
		} else{
			switchSlides(4);
		}
	});
	new FastButton(document.getElementById("deleteLocation"),deleteAddress);
	new FastButton(document.getElementById("addresses"),function(){ //Addresses
		if(loggedIn){
			addrRtrnTo="selectPizza";
			switchSlides(1);
		}
		else {
			switchSlides(4);
		}
	});
	new FastButton(document.getElementById("about"),function(){switchSlides(10);});
	new FastButton(document.getElementById("support"),function(){switchSlides(12);}); //Support & FAQ
	new FastButton(document.getElementById("terms"),function(){switchSlides(9);});
	new FastButton(document.getElementById("signIn"),function(){switchSlides(4);});
	// Clicking location icon takes you to the location page
	new FastButton(document.getElementById("location"),function(){
		addrRtrnTo='selectPizza';
		selectAddress(2);		
	});
	new FastButton(document.getElementById("addressTo"),function(){
		addrRtrnTo='selectPizza';
		selectAddress();
	});
	new FastButton(document.getElementById("addNewLoc"),function(){
		addrRtrnTo='addresses';
		selectAddress(2);
	});
	new FastButton(document.getElementById("addPizza"),function(){
		//check if pizza exists already
		//if not exists, add
		//else increase count
		var toppingsString="";
		$(".toppingsList>li:not(.nD)").each(function(index, element) {
            toppingsString+=$(this).text()+", ";
        });
		toppingsString=toppingsString.substr(0,toppingsString.length-2);
		var numPizzasOnOrder=$("#pizzasOnOrder>.pizzaOnOrder").length;
		if(numPizzasOnOrder>0){
			$(".pizzaOnOrder").each(function(index, element) {
				if($(element).children(".orderToppings").text()==toppingsString){
					var $quant=$(element).children(".quantity");
					$quant.text(parseInt($quant.text())+1+"x");
					return false;		
				}
				else if(index==numPizzasOnOrder-1){
					$("#pizzasOnOrder").prepend(pizzaOnOrderHtml(toppingsString));	
				}
			});
		}
		else{
			$("#pizzasOnOrder").prepend(pizzaOnOrderHtml(toppingsString));	
		}
	});
	$(".aChev").on("touchstart",function(e){
		if(lastSlides.length!=0){
			switchSlides(lastSlides.pop(),1);
		}
	});
	$(".tip").on("touchstart",function(){
		$(".tipSelected").removeClass("tipSelected");
		$(this).addClass("tipSelected");		
	});
	$("#pizzasOnOrder").on("touchstart",".pizzaOnOrder",function(e){
			deletePizzaStartX=e.originalEvent.touches[0].pageX;
			deletePizzaInitX=deletePizzaStartX;
	}).on("touchmove",".pizzaOnOrder",function(e){
		var touch = e.originalEvent.touches[0];
		var x = touch.pageX;
		var distTraveled=x-deletePizzaInitX;
		
		if(Math.abs(distTraveled)>20){
			var distMovedSinceLastEvent=x-deletePizzaStartX;
			$(this).css({marginLeft:(distMovedSinceLastEvent>0 ? "+=":"-=")+Math.abs(distMovedSinceLastEvent),whiteSpace:"nowrap"});
			deletePizzaStartX=x;
		}
	}).on("touchend",".pizzaOnOrder",function(e){
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		var x = touch.pageX;
		var distTraveled=x-deletePizzaInitX;
		if(Math.abs(distTraveled)>100){
			$(this).remove();
		}
		else{
			$(this).css({marginLeft:"auto",whiteSpace:"normal"});
		}
	});
	//new FastButton(document.getElementById("tapOrder"),orderPizzaPage);
	new FastButton(document.getElementById("signOut"),function(){
		navigator.notification.confirm(
				"You need to be signed in to order pizza. Are you sure you want to sign out?",
				completeSignout,
				'Press "Confirm" to sign out',
				'Cancel,Confirm'
			);
	});
}
function pizzaOnOrderHtml(toppingsString){
	var html=document.createElement("div");
	html.setAttribute("class","pizzaOnOrder");
	var quant=document.createElement("span");
	quant.setAttribute("class","quantity");
	quant.textContent="1x";
	var text=document.createTextNode(toppingsString=="" ? " Cheese Pizza":" Pizza with:")
	var toppings=document.createElement("label");
	toppings.setAttribute("class","orderToppings");
	toppings.textContent=toppingsString;
	html.appendChild(toppings);
	html.insertBefore(quant,toppings);
	html.insertBefore(text,toppings);
	return html;
}
function activateOrderOptions(){
	var orderOpts=document.getElementsByClassName("orderOpt");
	for(var i=0; i<orderOpts.length; i++){
		new FastButton(orderOpts[i],function(){
			theSelection=this.element;
			var restAndPrice=$(theSelection).text().split("$");
			navigator.notification.confirm(
				restAndPrice[0]+" $"+restAndPrice[1],
				finalOrderConfirmation,
				'Press "Confirm" to finalize your order',
				'Cancel,Confirm'
			);	
		});	
	}		
}
function makeActive(cntnrStr,rdOnlyStr){
	$(rdOnlyStr).removeAttr("readonly");
	$(cntnrStr).animate({opacity:1},300);
	hideLoader();
}
function getDeliveryOpts(){
	$.getJSON(host+"DeliveryOpts.php",function(data){
		if(data!=null){
			$(".delLoc:gt(0)").remove();
			$.each(data,function(index,value){
				var delLoc=document.createElement("div");
				delLoc.setAttribute("class","bigRed delLoc");
				var goBtn=document.createElement("div");
				goBtn.setAttribute("class","goBtn");
				var editBtn=document.createElement("div");
				editBtn.setAttribute("class","editButton");
				var val=document.createTextNode(value);
				delLoc.appendChild(val);
				delLoc.appendChild(goBtn);
				delLoc.appendChild(editBtn);
				new FastButton(editBtn,function(){
					clearAddressForm();
					//event.stopPropagation();
					switchSlides(13);
					addrRtrnTo="addresses";
					//code for filling in fields
					var addrNick=$(this.element).parent().text();
					$("#editAddrNick").val(addrNick);
					showLoader();
					var blockChanges="#editAddr,#editAddr2,#editCity,#editState,#editZip,#editPhone";
					$(blockChanges).attr("readonly","1");
					$.getJSON(host+"DeliveryOpts.php?addrNick="+addrNick,function(data){
						$("#editAddr").val(data.addr);
						$("#editAddr2").val(data.addr2);
						$("#editCity").val(data.city);
						$("#editState").children("option").removeAttr("selected").each(function(index, element) {
							if($(element).val()==data.state){
								$(element).attr("selected","selected");	
								return false;
							}
						});
						$("#editZip").val(data.zip);
						$("#editPhone").val(data.phone);
						makeActive("#deliveryLoc>.infoWrapper",blockChanges);
					}).error(function(){
						makeActive("#deliveryLoc>.infoWrapper",blockChanges);
					});
				});
				new FastButton(delLoc,function(){
					address.addrNick=$(this.element).text();//ie placeholder
					$("#addressTo").removeClass("nD redBrdr").children("span").text(address.addrNick);
					$("#orderText").text("order");
					switch(addrRtrnTo){
						case "account": switchSlides(7);
						break;
						default:switchSlides(0);
					}
				});
				$("#delOpts").append(delLoc);
			});
			checkCustomScrolling();
		}
	});
}
function orderError(theError){
	$("#orderErrorOccurred").remove();
	$("#orderOptions>.bigRed:first").after("<div id='orderErrorOccurred'><span class='cRed'>"+(typeof theError!="undefined" ? theError:"Order failed. Please try again later.")+"</span></div>");
	hideLoader();
	$("#pickSpot").css("opacity",1);
}
function completeSignout(indexSel){
	if(indexSel==2){
		$.post(host+"Logout.php",function(){
			if(device.platform=="Android"){
				navigator.app.exitApp();
			}
			else{
				switchSlides(1);
				$("#signIn").show();
				$("#signOut").addClass("nD");
			}
		});
		
	}
}
function finalOrderConfirmation(indexSel){
	hideLoader();
	$("#pickSpot").css("opacity",1);
	$("#orderErrorOccurred").remove();
	if(indexSel==2){
		showLoader();
		var pizzaOrderInfo={RestaurantID:$(theSelection).attr("data-restID"),
							TrayOrder:$(theSelection).attr("data-order"),
							AddressName:$("#addressTo>span").text(),
							Price:$(theSelection).children(".fR").text()};
		if($("#couponCode").val()!=""){
			pizzaOrderInfo.Coupon=$("#couponCode").val();
		}
		$.post(host+"PlaceOrder.php",pizzaOrderInfo,function(data){	
			hideLoader();
			$("#pickSpot").css("opacity",1);
			try{
				data=$.parseJSON(data);
				if(typeof data.error=="undefined"){
					switchSlides(8);
					$("#refNum").text(data.refnum);
					$("#successID").text(data.cs_order_id);
					if(typeof data.discAmt!="undefined"){
						$("#discAmt").text(data.discAmt);
						$("#discAmtWrapper").show();	
					}
					else{
						$("#discAmtWrapper").hide();
					}
				}
				else{
					orderError(data.error);
				}
			}
			catch(er){
				orderError();
			}
		}).error(function(){
			orderError();
		});
	}
}
function showOrderText(){
	$("#orderText,#createText").toggleClass("nD");
	if(localStorage.getItem("LastAddress")==null){
		$("#orderText").text("Select Location");
	}
}
function orderPizzaPage(){
	$("#orderErrorOccurred").remove();
	$("#noRests").parent().remove();
	$("#noPizzas").remove();
	//ie
	if(address.addrNick!="" && address.addrNick!=noAddrText){
		$("#addressTo").removeClass("redBrdr");
		$("#orderText").text("order");	
	}
	else{
		//navigator.notification.alert("Please select or create a new delivery address.",function(){},"No location set","Okay");
		$("#addressTo").addClass("redBrdr");
		if($("#orderText").text()=="Select Location" || $("#createText:visible").length!=0){
			addrRtrnTo='selectPizza';
			selectAddress();
		}
		else{
			$("#orderText").text("Select Location");
		}
		return false;	
	}
	if($("#pizzasOnOrder .pizzaOnOrder").length==0){
		navigator.notification.alert("Please add at least 1 pizza to order.",function(){},"No pizza added","Okay");
		$("#addressTo").after("<div class='cRed' id='noPizzas'>Please add at least 1 pizza to order</div>");	
		return false;
	}
	if(!loggedIn){
		switchSlides(3);
	}
	else{
		if($("#expYr").val()==""){
			switchSlides(5);
			cardReturnTo="order";
			return false;	
		}		
		switchSlides(6);
		$(".orderOpt").parent("div").remove();
		showLoader();
		var pizzasString="";
		$("#pizzasOnOrder .pizzaOnOrder").each(function(index, element) {
			var tops=$(element).children(".orderToppings").text().replace(", ",":")+":";
            pizzasString+=tops+"q"+parseInt($(element).children(".quantity").text(),10)+",";
        });
		pizzasString=pizzasString.substr(0,(pizzasString.length-1));
		localStorage.setItem("LastAddress",address.addrNick);
		$.getJSON(host+"FindPizzaPlaces.php?PizzaID="+pizzasString+"&AddressName="+address.addrNick,function(data){
			hideLoader();
			if(typeof data.error=="undefined"){				
				$.each(data,function(index,value){
					$("#orderOptions").append("<div><h4 class='orderOpt small-10 small-centered columns' data-order='"+value.Tray_Order+"' data-restID='"+value.RestaurantID+"'>"+value.Rest_Name+"<span class='fR pl10'>$"+value.Total_Price+"</span></h4><hr class='checkeredHr'></div>");
				});
				activateOrderOptions();
				$("#couponCodeDiv").show();
				checkCustomScrolling();
			}
			else{
				$("#couponCodeDiv").hide();
				$("#orderOptions").append("<div><h4 id='noRests'>"+data.error+"</h4></div>");
			}
		}).error(function(){
			hideLoader();
			$("#orderOptions").append("<div><h4 id='noRests'>Unknown error occurred. Please try again in a couple of minutes.</h4></div>");
		});	
	}
	return true;
}
function updateAddress(e){
	address={};
	addrRtrnTo="addresses";
	setNewAddress(e,{addr:"editAddr",
					addr2:"editAddr2",
					city:"editCity",
					zip:"editZip",
					state:"editState",
					phone:"editPhone",
					addrNick:"editAddrNick"});
}
function setNewAddress(e,ids){
	var useIds=typeof ids!=="undefined";
	address.addr=$("#" + (useIds ? ids.addr:"addr")).val();
	//ie
	if($("#" + (useIds ? ids.addr2:"addr2")).val()=="Address Line 2"){
		$("#" + (useIds ? ids.addr2:"addr2")).val("");
	}
	address.addr2=$("#" + (useIds ? ids.addr2:"addr2")).val();
	address.city=$("#" + (useIds ? ids.city:"city")).val();
	address.zip=$("#" + (useIds ? ids.zip:"zip")).val();
	address.state=$("#" + (useIds ? ids.state:"state")).val();
	address.phone=$("#" + (useIds ? ids.phone:"phone")).val();
	address.addrNick=$("#" + (useIds ? ids.addrNick:"addrNick")).val();
	for(var i in address){
		if(i!="addr2"){
			failedCheck=emptyLine(address[i],useIds ? ids[i]:i);
		}
		if(failedCheck){
			return false;
		}
	}
	if(isNaN(address.zip)){
		$("#" + (useIds ? ids.zip:"#zip")).addClass("redBrdr");
		return false;
	}
	switch(addrRtrnTo){
		case "selectPizza":	switchSlides(0);
		$("#addressTo>span").text($("#" + (useIds ? ids.nick:"addrNick")).val());
		$("#addressTo").removeClass("redBrdr");
		$("#orderText").text("order");
		break;
		case "account": switchSlides(7);
		break;
		case "card":switchSlides(6);
		$("#noCards").remove();
		break;
		case "addresses":switchSlides(1);
		addrRtrnTo="selectPizza";
		break;
	}
	if(loggedIn){
		$.post(host+"SetAddress.php",address,function(data){
			getDeliveryOpts();	
		});
	}
}
function deleteAddress(){
	var nick=$("#editAddrNick").val();
	if(localStorage.getItem("LastAddress")==nick){
		localStorage.removeItem("LastAddress");	
	}
	if($("#addressTo>span").text()==nick){
		$("#addressTo>span").text(noAddrText);
		address.addrNick="";
	}
	$.post(host+"DeleteAddress.php",{addrNick:nick});
	$(".delLoc").each(function(index, element) {
        if($(element).text()==$("#editAddrNick").val()){
			$(element).remove();	
		}
    });
	clearAddressForm();
	switchSlides(1);
}
function clearAddressForm(){
	$("[name=addr],[name=addr2],[name=addrNick],[name=zip],[name=phone],[name=city]").val("");	
}
function emptyLine(line,id){
	if(line==""){
		$("#"+id).addClass("redBrdr");
		return true;
	}
	else{
		$("#"+id).removeClass("redBrdr");
		return false;
	}
}
function selectAddress(slide){
	if(typeof slide=="undefined"){
		if($("#delOpts>.delLoc").length==0){
			slide=2;
		}
		else{
			slide=1;
		}
	}
	switchSlides(slide);
	if(slide==2 && $("#map-canvas").height()==0){
		setTimeout(function(){
			var oldY=clickbuster.coordinates[clickbuster.coordinates.length-1];
			clickbuster.coordinates[clickbuster.coordinates.length-1]=oldY+window.innerHeight/3;
			$("#map-canvas").css({width:$("section:visible").width(),height:window.innerHeight/3});
			initialize();
			checkCustomScrolling();
		},100);
	}
}
function logIn(){
	showLoader();
	var PW=document.getElementById('pWordLogIn').value;
	var email=document.getElementById('emailLogIn').value;
	var userAndPW="Email="+email+"&Password="+PW;
	$.post(host+"Login.php",userAndPW,function(data){
		hideLoader();
		if(!isNaN(data.substr(0,1))){
			$("#badLogin").remove();
			switch(parseInt(data)){
				case 401:$("#pWordLogIn").parent("div").after("<div id='badLogin' class='cRed'>Invalid email or password</div>");
				break;
				default: 
				loggedIn=1;
				showOrderText();
				getDeliveryOpts();
				getCardInfo();
				showUserInfo(data);
				$("#signIn").hide();
				$("#signOut").removeClass("nD");
				if(!orderPizzaPage()){
					switchSlides(0);
				}
				break;
			}
		}
	}).error(function(){
		hideLoader();
		$("#pWordLogin").parent("div").after("<div id='badLogin' class='cRed'>Invalid email or password</div>");
	});
}
function createAccount(){
	var PW=document.getElementById('pWord').value;
	var email=document.getElementById('emailAdd').value;
	var fName=document.getElementById('fName').value;
	var lName=document.getElementById('lName').value;
	var info="Email="+email+"&Password="+PW+"&fName="+fName+"&lName="+lName;
	showLoader();
	$.post(host+"CreateAccount.php",info,function(data){
		hideLoader();
		if(!isNaN(data)){
			loggedIn=1;
			showOrderText();
			$("#emailAdd").removeClass("redBrdr");
			var dVal=$("#addressTo>span").text();
			if(dVal.length==0 || dVal==noAddrText){
				switchSlides(0);
			}
			else{//should be tested
				switchSlides(5);//check me
				cardReturnTo="order";
				$.post(host+"SetAddress.php",address);
				getUserInfo();
				getCardInfo();
				getDeliveryOpts();
			}
		}
		else{
			$("#"+data).addClass("redBrdr");
		}
	});			
}
function currentToppings(){
	toppings="";
	$("#someToppings").children("li").each(function(index, element) {
		toppings+=$(element).attr("data-topping")+",";
	});
	toppings=toppings.substr(0,toppings.length-1);
	return toppings;
}
function addCard(){
	if($(".tipSelected").length==0){
		return false;
	}
	$("#cNum").removeClass("redBrdr");
	cardData=new Object();
	cardData.csc=$("#csc").val();
	cardData.cardNum=$("#cNum").val();
	cardData.expMo=$("#expMo").val();
	cardData.expYr=$("#expYr").val();
	cardData.zip=$("#cardZip").val();
	cardData.TipAmount=$(".tipSelected").text();
	if(cardData.cardNum.indexOf("*")!=-1){
		$("#cNum").addClass("redBrdr");
		return false;	
	}
	$("#noCards").remove();
	showLoader();
	$.post(host+"Card.php",cardData,function(data){
		hideLoader();
		//needs to be updated to show error without wrapper.
		switch(data){
			case "":switch(cardReturnTo){
				case "account": switchSlides(7);
				break;
				case "order": orderPizzaPage();
				break;
			}
			break;
			case "address": addrRtrnTo="card";
				$("#cardInfo>.infoWrapper:first>div:last").after("<div class='cRed' id='noCards'>Please make sure one of your addresses matches your <span onclick=\"switchSlides(3); clearAddressForm();\" class='u pntr'>billing address.</span></div>");
			break;
			default: 
				var errorLoc=$("#cardInfo .infoWrapper:first>div:last");
				if(data.indexOf("OrdrinException")!=-1){
					$(errorLoc).after("<div class='cRed' id='noCards'>Error: Please re-enter card information and try again.</div>");
				}
				else{
					$(errorLoc).after("<div class='cRed' id='noCards'>Error: "+data+"</div>");
				}
			break;
		}
	});
}

function updateCard(){
	switchSlides(5);
	cardReturnTo="account";	
}
function getCardInfo(){
	$.getJSON(host+"Card.php",function(data){	
		if(data.First.cc_last5!=""){
			$("#cNum").val("****"+data.First.cc_last5);
			$("#expMo").val(data.First.expiry_month);
			$("#expYr").val(data.First.expiry_year);
			$("#cardZip").val(data.First.bill_zip);		
		}
	});
}
function viewAddresses(){
	addrRtrnTo="account";
	selectAddress();	
}
function getUserInfo(){
	$.get(host+"CheckAccount.php",function(data){
		showUserInfo(data);
	});
}
function showUserInfo(data){
	$("#yourEmail").val(data.substring(1,data.indexOf(",")));
	$("#nameChange").val(data.substring(data.indexOf(",")+1,data.indexOf("/")) +" "+ data.substring(data.indexOf("/")+1,data.indexOf("[")));	
	//C=cash 1=15% 2=20%
	switch(data.substr(data.indexOf("[")+1,1)){	
		case "1": $(".tip:eq(0)").addClass("tipSelected");
		break;
		case "2": $(".tip:eq(1)").addClass("tipSelected");
		break;
		case "C": $(".tip:eq(2)").addClass("tipSelected");
		break;
	}
	//add once live
	//pushNotification.register(successHandler, errorHandler,{"senderID":"157047801644","ecb":"onNotificationGCM"});
}
function showLoader(){
	var $loadImg=$("#loader>img");
	$loadImg.css({left:(window.innerWidth-$loadImg.width())/2,top:(window.innerHeight-$loadImg.height())/2});
	$("#loader").show();
}
function hideLoader(){
	$("#loader").hide();
}
function switchSlides(newSlide,backButton){
	$('nav#my-menu').trigger("close.mm");
	$("#ss-blocker").show();
	prevSlide=$("section:visible").index();
	if(typeof backButton=="undefined"){
		lastSlides.push(prevSlide);
	}
	
	$("section").hide().eq(newSlide).show();
	setTimeout(function(){
		$("#ss-blocker").hide();
	},600);
	window.scrollTo(0,0);
	//iphone only
	checkCustomScrolling();
	document.activeElement.blur();
    $("input").blur();
	//iphone	
}
function checkCustomScrolling(){
	var visiSct=$("section:visible");
	var lastDiv=$("section:visible>div:visible:last");
	if(visiSct.find(".aSlider").length==0 && $(lastDiv).position().top>=$(visiSct).children("header").height() && ($(lastDiv).position().top+$(lastDiv).height())>$(visiSct).children("footer").position().top){
		$(visiSct).makeScrollable();
	}
	/*else if($(visiSct).has(".aSlider").length!=0){
		$(visiSct).find(".aSlider").unwrap().unwrap().remove();
	}*/
}
function onMenuKeyDown(){
	$('nav#my-menu').trigger($('nav#my-menu.mm-opened').length==0 ? "open.mm":"close.mm");
}
function onBackButton(){
	if(lastSlides.length!=0){
		switchSlides(lastSlides.pop(),1);
	}
	else{
		navigator.app.exitApp();	
	}
}
function successHandler (result) {
   
}
function errorHandler (error) {

}
 function onNotificationGCM(e) {
	switch(e.event){
		case 'registered':
		if (e.regid.length>0){
			$.post(host+"notifications/HandleRegisterDevice.php",{Device:"Android",DeviceID:e.regid});
		}
		break;
		
		case 'message':navigator.notification.alert(e.payload.message,function(){},e.payload.contentTitle,"Okay");
		break;

		case 'error':
			navigator.notification.alert(e.msg);
		break;
	}
}