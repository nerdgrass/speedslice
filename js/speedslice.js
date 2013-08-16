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
    case 'touchend': this.onClick(event); break;
    case 'click': this.onClick(event); break;
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
loader=$("<img src='img/loading.gif' id='loader'>");
lastY=0;
initY=0;
lastSlides=new Array();
scrollBarNmbr=0;
touchStarted=false;
var pushNotification;
window.onerror = function(msg, url, linenumber) {
    alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
    return true;
}
function onLoad() {
	document.addEventListener("deviceready", onDeviceReady, false);
}
function onDeviceReady() {
	checkConnection();
	document.addEventListener("menubutton", onMenuKeyDown, false);
	document.addEventListener("backbutton", onBackButton, false);
	document.addEventListener("offline", checkConnection, false);
	pushNotification = window.plugins.pushNotification;
}
function checkConnection(){  
	var networkState = navigator.network.connection.type;//needs to be navigator.connection if phonegap updated.
	if(networkState==Connection.NONE){
		navigator.notification.alert("SpeedSlice requires an active internet connection.",function(){
			setTimeout(checkConnection,1000);
		},"SpeedSlice","Okay");
	}
	else{
		if(typeof loggedIn=="undefined"){
			loadInfo();
		}
	}
}
function loadInfo(){
	$(window).on("resize",function(){
		$("html").css("font-size",($(window).width()/5.12)+"%");
	});
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
			$("#orderText,#createText").toggle();
			getDeliveryOpts();
			getPizzaList();
			getCardInfo();
			getUserInfo();
			if(localStorage.getItem("LastAddress")!=null){
				address.addrNick=localStorage.LastAddress;//ie placeholder
				$("#addressTo").val(address.addrNick);
			}
		}
	});	
	customScrolling("abtContentWrapper","abtContent","aboutSlider");
	customScrolling("legalContentWrapper","legalContent","legalSlider");
	customScrolling("supportContentWrapper","supportContent","supportSlider");
	checkCustomScrolling();
	$("#facebookLink").on("touchstart",function(e){
		e.preventDefault();
		webpageTimer=setTimeout(function(){window.plugins.childBrowser.showWebPage("https://www.facebook.com/SpeedSlice");},150);
	}).on("touchmove",function(){
		clearTimeout(webpageTimer);
	}).on("click",function(e){
		e.preventDefault();
	});
	$("section").on("blur","input",function(){
		window.scrollTo(0,0);
	});
	new FastButton(document.getElementsByClassName("home")[0],function(){switchSlides(3);});
	new FastButton(document.getElementById("orderPizza"),function(){switchSlides(0);});
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

	new FastButton(document.getElementById("addresses"),function(){ //Addresses
		if(loggedIn){
			switchSlides(13);
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
		switchSlides(2);
		setTimeout(function(){
			$("#map-canvas").css({width:$("section:visible").width(),height:window.innerHeight/3});
			initialize();
		},100);
	});
	new FastButton(document.getElementById("addressTo"),function(){
		$("#addressTo").blur();
		selectAddress(); 
		addrRtrnTo='selectPizza';
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
	$("#orderSummary").on("swipe",".removePizza",function(){
		pizzaToDelete=this;
		navigator.notification.confirm(
			"Are you sure you wish to remove "+$(this).children("h4").text().substr(0,$(this).children("h4").text().length-1)+"?",
			deletePizza,        
			'Press "Yes" to delete pizza',
			'No,Yes'
		);
	});
	$("#addPizza").on("touchstart",function(){ 
		//fix bug where pizza can have same name and different toppings
		thePiz=$("TESTPIZZANAME");//NOTE: This is a workaround for testing -Alex
		//ie
		if($(thePiz).val()=="" || $(thePiz).val=="Custom Pizza"){
			navigator.notification.alert("Please give your pizza a name.",function(){},"No pizza name","Okay");
			$("#pizzaName").addClass("redBrdr");
			return false;
		}
		$(thePiz).removeClass("redBrdr");		
		$("#pizzaID").children("option").each(function(index, element) {
			if($("#pizzaName").val()==$(element).text()){
				if(loggedIn){
					if($("[name=q"+$(element).val()+"]").length!=0){
						$("[name=q"+$(element).val()+"]").val(parseInt($("[name=q"+$(element).val()+"]").val())+1);
					}
					else{
						$("#addressTo").parent("div").before("<div class='removePizza'><h4>"+thePiz.val()+":</h4><input type='number' value='1' name='q"+$(element).val()+"'></div>");
					}
				}
				else{
					$("#orderSummary>.infoWrapper>div>h4").each(function(ind, ele) {//basically, if pizza exists increase num for that pizza		
						if($(ele).text()==($(element).text()+":")){
					//same as $(element).prev("h4").text().substr(0,$(element).prev("h4").text().length-1) might want to change the long one
							$(ele).next("input").val((parseInt($(ele).next("input").val())+1));
							return false;
						}
						else{
							if(ind==$("#orderSummary>.infoWrapper>div>h4").length-1){
								$("#addressTo").parent("div").before("<div class='removePizza'><h4>"+$(element).text()+":</h4><input type='number' value='1' name='"+(parseInt($(element).val())=="NaN" ? "qUpdate":"q"+$(element).val())+"'></div>");
							}
						}
					});	
				}
				return false;	
			}
			else{
				if((index+1)==$("#pizzaID").children("option").length){
					hasPizzaAlready=false;
					$("[name=qUpdate]").each(function(index, element) {
						if($(element).prev("h4").text().substr(0,$(element).prev("h4").text().length-1)==$("#pizzaName").val()){
							$(element).val(parseInt($(element).val())+1);
							hasPizzaAlready=true;
						}
					});
					if(!hasPizzaAlready){
						addUserPizza();
						$("#addressTo").parent("div").before("<div class='removePizza'><h4>"+thePiz.val()+":</h4><input type='number' value='1' name='qUpdate'></div>");
					}
				}
			}
		});
		$("#delTxt").show();
	});
	$("#tapOrder").on("touchstart",function(){
		orderPizzaPage();
	});
	var signout;
    $("#signOut").on("touchstart",function(e){
		signout=setTimeout(function(){
			navigator.notification.confirm(
				"You need to be signed in to order pizza. Are you sure you want to sign out?",
				completeSignout,
				'Press "Confirm" to sign out',
				'Cancel,Confirm'
			);
		},100);
	}).on("touchmove",function(e){
		clearTimeout(signout);
	}).on("click",function(e){
		e.preventDefault();
	});
	$("#pizzaToppings").on("touchstart",".topping:not(#cheeseTopping)",function(e){
		//check this with logged in
		theTopID=$(this).attr("id");
		toppingTouched=setTimeout(function(){
			var removeName=false;
			$("#orderSummary>.infoWrapper>div:not(:first)").each(function(index, element) {
				var theH4=$(element).children("h4").text();
				theH4=theH4.substr(0,theH4.length-1);
				if(theH4.toUpperCase()==$("#pizzaName").val().toUpperCase()){
					removeName=true;
				}
			});
			if(removeName){
				$("#pizzaName").val("").attr("name","");
			}
			addTopping(theTopID);
		},150);
	}).on("touchmove",".topping:not(#cheeseTopping)",function(e){
		clearTimeout(toppingTouched);
	});
	$("#orderOptions").on("touchstart",".orderOpt",function(){
		theSelection=this;
		orderTimer=setTimeout(function(){	
			var restAndPrice=$(theSelection).text().split("$");
			navigator.notification.confirm(
				restAndPrice[0]+" $"+restAndPrice[1],
				finalOrderConfirmation,
				'Press "Confirm" to finalize your order',
				'Cancel,Confirm'
			);
		},150);
	}).on("touchmove",function(){
		clearTimeout(orderTimer);
	});
	$("#delOpts").on("touchstart",".delLoc",function(){
		if($(this).index()==0){
			switchSlides(2);	
			$("#deleteAddress").hide();
			clearAddressForm();
		}
		else{
			address.addrNick=$(this).text().substr(4);//ie placeholder
			$("#addressTo").val(address.addrNick).removeClass("redBrdr placeholder");
			switch(addrRtrnTo){
				case "selectPizza":	switchSlides(0);
				break;
				case "account": switchSlides(7);
				break;
			}
		}
	}).on("mousedown",".editButton",function(){
		$(this).parent().attr("name","editClick");
	}).on("mouseup",".editButton",function(){
		$(this).parent().removeAttr("name");
	}).on("touchstart",".editButton",function(e){
		e.stopPropagation();
		switchSlides(2);
		//code for filling in fields
		var addrNick=$(this).parent().text().substr(4);
		$("#addrNick").val(addrNick);
		var loaderClone=$(loader).clone();
		$(loaderClone).addClass("bigLoader");
		var blockChanges="#addr,#addr2,#city,#state,#zip,#phone";
		$(blockChanges).attr("readonly","1");
		$("#deliveryLoc>.infoWrapper").css("opacity","0.5").prepend(loaderClone);
		$.getJSON(host+"DeliveryOpts.php?addrNick="+addrNick,function(data){
			$("#addr").val(data.addr);
			$("#addr2").val(data.addr2);
			$("#city").val(data.city);
			$("#state").children("option").removeAttr("selected").each(function(index, element) {
                if($(element).val()==data.state){
					$(element).attr("selected","selected");	
				}
            });
			$("#zip").val(data.zip);
			$("#phone").val(data.phone);
			$("#deleteAddress").show();
			makeActive("#deliveryLoc>.infoWrapper",blockChanges);
		}).error(function(){
			makeActive("#deliveryLoc>.infoWrapper",blockChanges);
			$("#deleteAddress").show();
		});
	});
	
}
function makeActive(cntnrStr,rdOnlyStr){
	$(rdOnlyStr).removeAttr("readonly");
	$(cntnrStr).animate({opacity:1},300);
	$("#loader").remove();
}
function getDeliveryOpts(){
	$.getJSON(host+"DeliveryOpts.php",function(data){
		if(data!=null){
			$(".delLoc:not(:first)").remove();
			$.each(data,function(index,value){
				$("#delOpts").append('<div class="next bigRed delLoc"><div class="editButton">EDIT</div>'+value+'</div>');
			});
			checkCustomScrolling();
		}
	});
}
function deletePizza(indSel){
	if(indSel==2){
		var pizName=$(pizzaToDelete).children("h4").text();
		pizName=pizName.substr(0,pizName.length-1);
		if(typeof additionalPizzas!="undefined" && typeof additionalPizzas[pizName] != "undefined"){
			delete(additionalPizzas[pizName]);
		}
		$(pizzaToDelete).remove();
		if($(".removePizza").length==0){
			$("#delTxt").hide();	
		}		
	}
}
function orderError(theError){
	$("#orderErrorOccurred").remove();
	$("#orderOptions>.bigRed:first").after("<div id='orderErrorOccurred'><span class='cRed'>"+(typeof theError!="undefined" ? theError:"Order failed. Please try again later.")+"</span></div>");
	$("#loader").remove();
	$("#pickSpot").css("opacity",1);
}
function addTopping(theID){
	switch(theID.substr(0,2)){
		case "pe":
			toppingsOnOff("pe","Pepperoni",theID,2);
		break;
		case "sa":
			toppingsOnOff("sa","Sausage",theID,3);
		break;
		case "p3":
			toppingsOnOff("p3","Peppers",theID,4);
		break;
		case "ol":
			toppingsOnOff("ol","Olives",theID,5);
		break;
		case "on":
			toppingsOnOff("on","Onion",theID,6);
		break;
		case "mu":
			toppingsOnOff("mu","Mushroom",theID,7);
		break;
	}
}
function completeSignout(indexSel){
	if(indexSel==2){
		$.post(host+"Logout.php",function(){
			navigator.app.exitApp();	
		});
	}
}
function finalOrderConfirmation(indexSel){
	$("#loader").remove();
	$("#pickSpot").css("opacity",1);
	$("#orderErrorOccurred").remove();
	if(indexSel==2){
		var newLoader=$(loader).clone();
		$("#pickSpot").css("opacity",0.8);
		$("#pickSpot").append($(newLoader).addClass("bigLoader"));
		var pizzaOrderInfo={RestaurantID:$(theSelection).attr("data-restID"),
							TrayOrder:$(theSelection).attr("data-order"),
							AddressName:$("#addressTo").val(),
							Price:$(theSelection).children(".fR").text()};
		if($("#couponCode").val()!=""){
			pizzaOrderInfo.Coupon=$("#couponCode").val();
		}
		$.post(host+"PlaceOrder.php",pizzaOrderInfo,function(data){	
			$("#loader").remove();
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
function toppingsOnOff(theSmallID,topping,theID,topID){
	if($("#"+theSmallID).length==0){
		$("#someToppings").append("<li id='"+theSmallID+"' data-topping='"+topID+"'>"+topping+"</li>");
		$("#"+theID).addClass(theSmallID+"Select");
	}
	else{
		if(theSmallID=="ch"){
			return;
		}
		$("#"+theSmallID).remove();
		$("#"+theID).removeClass(theSmallID+"Select");
	}
}
function orderPizzaPage(curSlide){
	$("#orderErrorOccurred").remove();
	$("#noRests").parent().remove();
	$("#noPizzas").remove();
	//ie
	if(address.addrNick!="" && address.addrNick!="ADDRESS"){
		$("#addressTo").removeClass("redBrdr");	
	}
	else{
		navigator.notification.alert("Please select or create a new delivery address.",function(){},"No location set","Okay");
		$("#addressTo").addClass("redBrdr");
		return false;	
	}
	if($("input[name^=q]").length==0){
		navigator.notification.alert("Please add at least 1 pizza to order.",function(){},"No pizza added","Okay");
		$("#addressTo").parent("div").after("<div class='cRed' id='noPizzas'>Please add at least 1 pizza to order</div>");	
		return false;
	}
	if(!loggedIn){
		switchSlides(3);	
	}
	else{
		if($("#expYr").val()==""){
			if(typeof curSlide!="undefined"){
				switchSlides(5);	
			}
			else{
				switchSlides(5);
			}
			cardReturnTo="order";
			return false;	
		}
		if($("#cardInfo").css("display")!="none"){
			switchSlides(6);
		}
		else{
			switchSlides(6);
		}
		$(".orderOpt").parent("div").remove();
		$("#orderOptions").children("div:first").after($(loader).clone());
		pizzasString="";
		$("[name^=q]").each(function(index, element) {
            pizzasString+=$(element).attr("name").substr(1)+"q"+$(element).val()+",";
        });
		pizzasString=pizzasString.substr(0,(pizzasString.length-1));
		localStorage.setItem("LastAddress",address.addrNick);
		$.getJSON(host+"FindPizzaPlaces.php?PizzaID="+pizzasString+"&AddressName="+address.addrNick,function(data){
			$("#loader").remove();
			if(typeof data.error=="undefined"){				
				$.each(data,function(index,value){
					$("#orderOptions").append("<div><h4 class='orderOpt' data-order='"+value.Tray_Order+"' data-restID='"+value.RestaurantID+"'>"+value.Rest_Name+"<span class='fR pl10'>$"+value.Total_Price+"</span></h4></div>");
				});
				$("#couponCodeDiv").show();
				checkCustomScrolling();
			}
			else{
				$("#couponCodeDiv").hide();
				$("#orderOptions").append("<div><h4 id='noRests'>"+data.error+"</h4></div>");
			}
		}).error(function(){
			$("#loader").remove();
			$("#orderOptions").append("<div><h4 id='noRests'>Unknown error occurred. Please try again in a couple of minutes.</h4></div>");
		});	
	}
	return true;
}	
function setNewAddress(){
	address.addr=$("#addr").val();
	//ie
	if($("#addr2").val()=="Address Line 2"){
		$("#addr2").val("");
	}
	address.addr2=$("#addr2").val();
	address.city=$("#city").val();
	address.zip=$("#zip").val();
	address.state=$("#state").val();
	address.phone=$("#phone").val();
	address.addrNick=$("#addrNick").val();
	for(var i in address){
		if(i!="addr2"){
			failedCheck=emptyLine(address[i],i);
		}
		if(failedCheck){
			return false;
		}
	}
	if(isNaN(address.zip)){
		$("#zip").addClass("redBrdr");
		return false;	
	}
	switch(addrRtrnTo){
		case "selectPizza":	switchSlides(0);
		$("#addressTo").val($("#addrNick").val()).removeClass("redBrdr");
		break;
		case "account": switchSlides(7);
		break;
		case "card":switchSlides(6);
		$("#noCards").remove();
		break;
	}
	if(loggedIn){
		$.post(host+"SetAddress.php",address,function(data){
			getDeliveryOpts();	
		});	
	}
}
function deleteAddress(){
	$.post(host+"DeleteAddress.php",{"addrNick":$("#addrNick").val()});
	$(".delLoc").each(function(index, element) {
        if($(element).text().substr(4)==$("#addrNick").val()){
			$(element).remove();	
		}
    });
	clearAddressForm();
	switchSlides(1);
}
function clearAddressForm(){
	$("#addr,#addr2,#addrNick,#zip,#phone,#city").val("");	
}
function emptyLine(addrLine,addrID){
	if(addrLine==""){
		$("#"+addrID).addClass("redBrdr");
		return true;
	}
	else{
		$("#"+addrID).removeClass("redBrdr");
		return false;
	}
}
function selectAddress(){
	$("#addressTo").blur();
	if($("#delOpts").children(".delLoc").length==1){
		switchSlides(2);
	}
	else{
		switchSlides(1);
	}
}
function logIn(theDiv){
	$(theDiv).append($(loader).clone());
	var PW=document.getElementById('pWordLogIn').value;
	var email=document.getElementById('emailLogIn').value;
	var userAndPW="Email="+email+"&Password="+PW;
	$.post(host+"Login.php",userAndPW,function(data){
		loader=$("#loader").remove();
		if(!isNaN(data.substr(0,1))){
			$("#badLogin").remove();
			switch(parseInt(data)){
				case 401:$("#pWordLogIn").parent("div").after("<div id='badLogin' class='cRed'>Invalid email or password</div>");
				break;
				default: 
				loggedIn=1;
				$("#orderText,#createText").toggle();
				getDeliveryOpts();
				getPizzaList();	
				getCardInfo();
				showUserInfo(data);
				addUserPizza();
				if(!orderPizzaPage(4)){
					switchSlides(0);
				}
				else{
					switchSlides(7);
				}
				break;
			}
		}
	}).error(function(){
		loader=$("#loader").remove();
		$("#pWordLogin").parent("div").after("<div id='badLogin' class='cRed'>Invalid email or password</div>");
	});
}
function createAccount(theDiv){
	var PW=document.getElementById('pWord').value;
	var email=document.getElementById('emailAdd').value;
	var fName=document.getElementById('fName').value;
	var lName=document.getElementById('lName').value;
	var info="Email="+email+"&Password="+PW+"&fName="+fName+"&lName="+lName;
	$(theDiv).append($(loader).clone());
	$.post(host+"CreateAccount.php",info,function(data){
		loader=$("#loader").remove();
		if(!isNaN(data)){
			loggedIn=1;
			$("#orderText,#createText").toggle();
			$("#emailAdd").removeClass("redBrdr");
			var dVal=$("#addressTo").val();
			if(dVal.length==0 || dVal=="ADDRESS"){
				switchSlides(0);
			}
			else{//should be tested
				switchSlides(5);//check me
				cardReturnTo="order";
				$.post(host+"SetAddress.php",address);
				addUserPizza();
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
function addUserPizza(){//same pizza different name doesn't get added to array, how to handle?
	if(!loggedIn){
		toppings=currentToppings();
		var pizzaName=$("#pizzaName").val();
		if(typeof additionalPizzas[pizzaName] == "undefined"){
			additionalPizzas[pizzaName]=toppings;
		}
		$.post(host+"CreatePizza.php",{"Toppings":toppings,"PizzaName":pizzaName},function(data){			
			populatePizzaList($.parseJSON(data));
		});
		return false;
	}
	//multiple pizzas on first sign up
	//if pizza isn't saved by the time the order button is clicked (maybe just use loading icon on pizza)
	if(typeof additionalPizzas != "undefined" && !$.isEmptyObject(additionalPizzas)){
		//add the additional pizzas	and update the numbers
		var count = 0;
		for (k in additionalPizzas){
			count++;
		}
		var theCount=0;
		$.each(additionalPizzas,function(index,value){
			$.post(host+"CreatePizza.php",{"Toppings":value,"PizzaName":index},function(data){
				if(theCount==(count-1)){
					populatePizzaList($.parseJSON(data));	
				}
			});
			theCount++;	
		});
		delete(additionalPizzas);
		return false;
	}
	if(($("#pizzaName").attr("name")=="" || typeof $("#pizzaName").attr("name")=="undefined") && $("#pizzaName").val()!=""){//name is the pizzaid, if no pizza id, needs to be saved
		toppings=currentToppings();
		//validate pizzaname
		$.post(host+"CreatePizza.php",{"Toppings":toppings,"PizzaName":$("#pizzaName").val()},function(data){
			populatePizzaList($.parseJSON(data));	
		});	
	}
}
function currentToppings(){
	toppings="";
	$("#someToppings").children("li").each(function(index, element) {
		toppings+=$(element).attr("data-topping")+",";
	});
	toppings=toppings.substr(0,toppings.length-1);
	return toppings;
}
function getPizzaList(){
	$.getJSON(host+"GetUserPizzas.php",function(data){
		if(data!=null){
			populatePizzaList(data);
		}
	}).error(function(){
		populatePizzaList({});
	});
}
function populatePizzaList(data){
	$("#pizzaID").children("option:not([value=9]):not([value=2])" ).remove();
	if($("[name=qUpdate]").length>1){
		var qLength=$("[name=qUpdate]").length-1;	
	}
	$.each(data,function(index,value){
		//relies on most recent pizza being the highest num, also on only one pizza being added at a time (so should use swirly loader)
		//if(parseInt(value.PizzaID)!=2 && parseInt(value.PizzaID)!=9){
			$("#pizzaID").append("<option value='"+value.PizzaID+"' data-toppings='"+value.Toppings+"'>"+value.PizzaName+"</option>");
			if(typeof qLength !="undefined"){
				if($("#pizzaName").val()==value.PizzaName){
					$("#pizzaName").attr("name",value.PizzaID);
				}
				$("[name=qUpdate]:eq("+qLength+")").attr("name","q"+value.PizzaID);
				qLength--;
			}		
			else{
				if(value.PizzaName==$("#pizzaName").val()){
					$("#pizzaName").attr("name",value.PizzaID);	
					$("[name=qUpdate]").attr("name","q"+value.PizzaID);
				}
			}
		//}
		//ie
		if(index==0){
			$("#pizzaName").removeClass("placeholder");	
		}
	});
	$("#pizzaID").append("<option selected></option>");	
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
	$("#addCardButton").append($(loader).clone());
	$.post(host+"Card.php",cardData,function(data){
		$("#loader").remove();
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
function changePizza(theChoice){
	$("#pizzaName").attr("name",$(theChoice).val()).val($(theChoice).text());
	$("#someToppings > li:not(:first)").remove();
	$(".topping:not(.chSelect)").attr("class","topping");
	if($(theChoice).val()!=""){
		pizTop=$(theChoice).attr("data-toppings").split(",");
		$.each(pizTop,function(ind,top){
			if(top=="Peppers" && $("#p3ppersTopping").attr("class").indexOf("Select")==-1){
				addTopping("p3ppersTopping");
			}
			else{
				top=top.toLowerCase();
				if($("#"+top+"Topping").attr("class").indexOf("Select")==-1){
					addTopping(top+"Topping");
				}
			}
		});
	}	
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
	$("#yourEmail").empty().prepend(data.substring(1,data.indexOf(",")));
	$("#nameChange").prepend(data.substring(data.indexOf("/")+1,data.indexOf("["))).prepend(data.substring(data.indexOf(",")+1,data.indexOf("/"))+" ");	
	$("#welcome").html("Welcome, "+data.substring(data.indexOf(",")+1,data.indexOf("/")));
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

function switchSlides(newSlide,backButton){
	prevSlide=$("section:visible").index();
	if(typeof backButton=="undefined"){
		lastSlides.push(prevSlide);
	}
	
	$("section").hide().eq(newSlide).show();
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
	if($(lastDiv).position().top>=$(visiSct).children("header").height() && ($(lastDiv).position().top+$(lastDiv).height())>$(visiSct).children("footer").position().top){
		if($(visiSct).has(".aSlider").length==0){
			createCustomScroller(visiSct);
		}
	}
	/*else if($(visiSct).has(".aSlider").length!=0){
		$(visiSct).find(".aSlider").unwrap().unwrap().remove();
	}*/
}
function createCustomScroller(sctnForScroller){
	$(sctnForScroller).children("div,h2").wrapAll("<div id='custom-scrollbar-wrapper"+scrollBarNmbr+"' class='ovrFlwHide' />").wrapAll("<div id='custom-scrollbar-content"+scrollBarNmbr+"' class='clearFix' />");
	$("#custom-scrollbar-content"+scrollBarNmbr).append('<div class="h380 aSlider nD"><div class="h380 pntr"><div id="custom-scrollbar-slider'+scrollBarNmbr+'" style="position: relative; top: 3px;" class="ui-draggable"></div></div></div>');
	customScrolling('custom-scrollbar-wrapper'+scrollBarNmbr,'custom-scrollbar-content'+scrollBarNmbr,'custom-scrollbar-slider'+scrollBarNmbr);
	scrollBarNmbr++;
}
function customScrolling(theContainer,innerContainer,sliderHandle){
	$("#"+sliderHandle).draggable({scroll:false,axis:"y",containment:"parent",drag:function(e,u){ 
		$("#"+innerContainer).css("margin-top",(-$("#"+innerContainer).height()*(u.position.top/$(".aSlider:first").height()))+"px");}
	});
	$("#"+theContainer).on("touchstart",function(e){
		initY=e.originalEvent.touches[0].pageY;
	}).on("touchmove",function(e){
		e.preventDefault();
		var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		//var elm = $(this).offset();
		var y = touch.pageY;
		if(lastY!=0 && Math.abs(y-initY)>30){
			touchStarted=true;
			scrollDiv(e,(y-lastY),"#"+innerContainer,"#"+sliderHandle,1,$(".aSlider:first").height());
		}
		lastY=y;
	}).on("touchend",function(e){
		if(touchStarted){
			e.preventDefault();
			e.stopPropagation();
			touchStarted=false;
		}
	}).mousewheel(function(e){
		scrollDiv(e,e.originalEvent.wheelDelta,"#"+innerContainer,"#"+sliderHandle,0,$(".aSlider:first").height());
	});
	$("#"+theContainer).on("touchstart",".aSlider",function(e){
		e.stopPropagation();
		if(typeof timeoutId!="undefined"){
			clearInterval(timeoutId);
		}
		var touchSpot=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
	    if (!touchSpot.offsetY) {
			offY = touchSpot.pageY - $(e.target).offset().top;
		}
		else{
			offY=touchSpot.offsetY;
		}
		timeoutId=setInterval("clickScroll("+offY+",'"+innerContainer+"','#"+sliderHandle+"',"+$(".aSlider:first").height()+")",30);
	});
	$(document).on("touchend",function(e){
		if(typeof timeoutId!="undefined"){
			clearInterval(timeoutId);
		}
		$("#"+sliderHandle).stop(true);
	});
}
function scrollDiv(e,upOrDown,innerContainer,sliderHandle,touch,sliderHeight){
	e.preventDefault();
	e.stopPropagation();
	var iContMrgnTop=parseInt($(innerContainer).css("margin-top"),10);
	var heightAdj=sliderHeight-$("footer:first").height()-20;
	if(upOrDown<0){
		if((iContMrgnTop-(heightAdj))>-$(innerContainer).height()){
			$(innerContainer).css({"margin-top":"-="+(touch ? "15":"30")+"px","padding-bottom":"+="+(touch ? "15":"30")+"px"});
		}
	}
	else{
		if((iContMrgnTop+(heightAdj))<=(heightAdj-1)){
			$(innerContainer).css({"margin-top":"+="+(touch ? "15":"30")+"px","padding-bottom":"-="+(touch ? "15":"30")+"px"});
		}
	}
	adjustSlider(iContMrgnTop,innerContainer,sliderHandle,sliderHeight);	
}
function clickScroll(theOffset,innerContainer,sliderHandle,sliderHeight){
	$(sliderHandle).stop(true);
	var sliderPosition=parseInt($(sliderHandle).css("top"),10);
	if(theOffset>sliderPosition){
		if(sliderPosition<sliderHeight && sliderPosition!=theOffset){
			$(sliderHandle).css("top","+=1");
			$("#"+innerContainer).css("margin-top",(-($("#"+innerContainer).height()/sliderHeight)*parseInt($(sliderHandle).css("top"),10))+"px");
		}
	}
	else{
		if(sliderPosition>0 && sliderPosition!=theOffset){
			$(sliderHandle).css("top","-=1");
			$("#"+innerContainer).css("margin-top",(-($("#"+innerContainer).height()/sliderHeight)*parseInt($(sliderHandle).css("top"),10))+"px");
		}
	}					
}
function adjustSlider(iContMrgnTop,innerContainer,sliderHandle,sliderHeight){
	var slidePixels=-(iContMrgnTop/$(innerContainer).height())*sliderHeight;
	var handleHt=$(sliderHandle).height();
	// + or - height of slider 
	if(slidePixels<handleHt){
		slidePixels=0;
	}
	if(slidePixels>(sliderHeight-handleHt)){
		slidePixels=(sliderHeight-handleHt);
	}
	$(sliderHandle).css("top",slidePixels+"px"); 
}
function onMenuKeyDown(){
	$('nav#my-menu').mmenu().trigger($('nav#my-menu:visible').length==0 ? "open.mm":"close.mm");
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
(function(a){a.fn.mousewheel=function(a){return this[a?"on":"trigger"]("wheel",a)},a.event.special.wheel={setup:function(){a.event.add(this,b,c,{})},teardown:function(){a.event.remove(this,b,c)}};var b=a.browser.mozilla?"DOMMouseScroll"+(a.browser.version<"1.9"?" mousemove":""):"mousewheel";function c(b){switch(b.type){case"mousemove":return a.extend(b.data,{clientX:b.clientX,clientY:b.clientY,pageX:b.pageX,pageY:b.pageY});case"DOMMouseScroll":a.extend(b,b.data),b.delta=-b.detail/3;break;case"mousewheel":b.delta=b.wheelDelta/120}b.type="wheel";return a.event.handle.call(this,b,b.delta)}})(jQuery);