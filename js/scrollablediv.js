(function($) {
	var scrollBarNmbr=0;
	var lastY=0;
	$.fn.makeScrollable=function(){
		return this.each(function() {
			if($(this).find(".aSlider").length==0){
				$(this).css("overflow","hidden");
				createCustomScroller(this);
			}
		});
		function createCustomScroller(sctnForScroller){
			var sliderHeight=window.innerHeight-$(sctnForScroller).find("header").outerHeight(true)-$(sctnForScroller).find("footer").outerHeight(true);
			var sliderHeightStyle="style='height:"+sliderHeight+"px'";
			$(sctnForScroller).children(":not(header)").wrapAll("<div id='custom-scrollbar-wrapper"+scrollBarNmbr+"' class='ovrFlwHide' />").wrapAll("<div id='custom-scrollbar-content"+scrollBarNmbr+"' class='clearFix' />");
			
			$("#custom-scrollbar-content"+scrollBarNmbr).append('<div class="aSlider nD" '+sliderHeightStyle+'><div class="pntr" '+sliderHeightStyle+'><div id="custom-scrollbar-slider'+scrollBarNmbr+'" style="position: relative; top: 3px;" class="ui-draggable"></div></div></div>');
			$.customScrolling('custom-scrollbar-wrapper'+scrollBarNmbr,'custom-scrollbar-content'+scrollBarNmbr,'custom-scrollbar-slider'+scrollBarNmbr);
			scrollBarNmbr++;
		}
	}
	$.customScrolling=function(theContainer,innerContainer,sliderHandle){
		$("#"+sliderHandle).draggable({scroll:false,axis:"y",containment:"parent",drag:function(e,u){ 
			$("#"+innerContainer).css("margin-top",(-$("#"+innerContainer).height()*(u.position.top/$(".aSlider:first").height()))+"px");}
		});
		$("#"+theContainer).on("touchstart",function(e){
			initY=e.originalEvent.touches[0].pageY;
			lastY=initY;
		}).on("touchmove",function(e){
			e.preventDefault();
			var touch = e.originalEvent.touches[0];
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
			var touchSpot=e.originalEvent.touches[0];
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
		
		function scrollDiv(e,upOrDown,innerContainer,sliderHandle,touch,sliderHeight){
			e.preventDefault();
			e.stopPropagation();
			var iContMrgnTop=parseInt($(innerContainer).css("margin-top"),10);
			var heightAdj=sliderHeight-$("footer:first").height()-20;
			var moveDistance=Math.abs(touch ? upOrDown:"30");
			if(upOrDown<0){
				if((iContMrgnTop-(heightAdj))>-$(innerContainer).height()){
					$(innerContainer).css({"margin-top":"-="+moveDistance,"padding-bottom":"+="+moveDistance});
				}
			}
			else{
				if((iContMrgnTop+(heightAdj))<=(heightAdj-1)){
					$(innerContainer).css({"margin-top":"+="+moveDistance,"padding-bottom":"-="+moveDistance});
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
	
	}
	}( jQuery ));
	(function(a){a.fn.mousewheel=function(a){return this[a?"on":"trigger"]("wheel",a)},a.event.special.wheel={setup:function(){a.event.add(this,b,c,{})},teardown:function(){a.event.remove(this,b,c)}};var b=a.browser.mozilla?"DOMMouseScroll"+(a.browser.version<"1.9"?" mousemove":""):"mousewheel";function c(b){switch(b.type){case"mousemove":return a.extend(b.data,{clientX:b.clientX,clientY:b.clientY,pageX:b.pageX,pageY:b.pageY});case"DOMMouseScroll":a.extend(b,b.data),b.delta=-b.detail/3;break;case"mousewheel":b.delta=b.wheelDelta/120}b.type="wheel";return a.event.handle.call(this,b,b.delta)}})(jQuery);