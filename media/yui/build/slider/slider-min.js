/*
Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
version: 2.3.0

NOTE: This file contains a preview release of the YUI library made
available for testing purposes.  It is not recommended that this code
be used in production environments.  You should replace this version
with the 2.3.0 release as soon as it is available.

*/

YAHOO.widget.Slider=function(sElementId,sGroup,oThumb,sType){if(sElementId){this.init(sElementId,sGroup,true);this.initSlider(sType);this.initThumb(oThumb);}};YAHOO.widget.Slider.getHorizSlider=function(sBGElId,sHandleElId,iLeft,iRight,iTickSize){return new YAHOO.widget.Slider(sBGElId,sBGElId,new YAHOO.widget.SliderThumb(sHandleElId,sBGElId,iLeft,iRight,0,0,iTickSize),"horiz");};YAHOO.widget.Slider.getVertSlider=function(sBGElId,sHandleElId,iUp,iDown,iTickSize){return new YAHOO.widget.Slider(sBGElId,sBGElId,new YAHOO.widget.SliderThumb(sHandleElId,sBGElId,0,0,iUp,iDown,iTickSize),"vert");};YAHOO.widget.Slider.getSliderRegion=function(sBGElId,sHandleElId,iLeft,iRight,iUp,iDown,iTickSize){return new YAHOO.widget.Slider(sBGElId,sBGElId,new YAHOO.widget.SliderThumb(sHandleElId,sBGElId,iLeft,iRight,iUp,iDown,iTickSize),"region");};YAHOO.widget.Slider.ANIM_AVAIL=true;YAHOO.extend(YAHOO.widget.Slider,YAHOO.util.DragDrop,{initSlider:function(sType){this.type=sType;this.createEvent("change",this);this.createEvent("slideStart",this);this.createEvent("slideEnd",this);this.isTarget=false;this.animate=YAHOO.widget.Slider.ANIM_AVAIL;this.backgroundEnabled=true;this.tickPause=40;this.enableKeys=true;this.keyIncrement=20;this.moveComplete=true;this.animationDuration=0.2;this.SOURCE_UI_EVENT=1;this.SOURCE_SET_VALUE=2;this.valueChangeSource=0;},initThumb:function(t){var self=this;this.thumb=t;t.cacheBetweenDrags=true;t.onChange=function(){self.handleThumbChange();};if(t._isHoriz&&t.xTicks&&t.xTicks.length){this.tickPause=Math.round(360/t.xTicks.length);}else if(t.yTicks&&t.yTicks.length){this.tickPause=Math.round(360/t.yTicks.length);}
t.onMouseDown=function(){return self.focus();};t.onMouseUp=function(){self.thumbMouseUp();};t.onDrag=function(){self.fireEvents(true);};t.onAvailable=function(){return self.setStartSliderState();};},onAvailable:function(){var Event=YAHOO.util.Event;Event.on(this.id,"keydown",this.handleKeyDown,this,true);Event.on(this.id,"keypress",this.handleKeyPress,this,true);},handleKeyPress:function(e){if(this.enableKeys){var Event=YAHOO.util.Event;var kc=Event.getCharCode(e);switch(kc){case 0x25:case 0x26:case 0x27:case 0x28:case 0x24:case 0x23:Event.preventDefault(e);break;default:}}},handleKeyDown:function(e){if(this.enableKeys){var Event=YAHOO.util.Event;var kc=Event.getCharCode(e),t=this.thumb;var h=this.getXValue(),v=this.getYValue();var horiz=false;var changeValue=true;switch(kc){case 0x25:h-=this.keyIncrement;break;case 0x26:v-=this.keyIncrement;break;case 0x27:h+=this.keyIncrement;break;case 0x28:v+=this.keyIncrement;break;case 0x24:h=t.leftConstraint;v=t.topConstraint;break;case 0x23:h=t.rightConstraint;v=t.bottomConstraint;break;default:changeValue=false;}
if(changeValue){if(t._isRegion){this.setRegionValue(h,v,true);}else{var newVal=(t._isHoriz)?h:v;this.setValue(newVal,true);}
Event.stopEvent(e);}}},setStartSliderState:function(){this.setThumbCenterPoint();this.baselinePos=YAHOO.util.Dom.getXY(this.getEl());this.thumb.startOffset=this.thumb.getOffsetFromParent(this.baselinePos);if(this.thumb._isRegion){if(this.deferredSetRegionValue){this.setRegionValue.apply(this,this.deferredSetRegionValue,true);this.deferredSetRegionValue=null;}else{this.setRegionValue(0,0,true,true);}}else{if(this.deferredSetValue){this.setValue.apply(this,this.deferredSetValue,true);this.deferredSetValue=null;}else{this.setValue(0,true,true);}}},setThumbCenterPoint:function(){var el=this.thumb.getEl();if(el){this.thumbCenterPoint={x:parseInt(el.offsetWidth/2,10),y:parseInt(el.offsetHeight/2,10)};}},lock:function(){this.thumb.lock();this.locked=true;},unlock:function(){this.thumb.unlock();this.locked=false;},thumbMouseUp:function(){if(!this.isLocked()&&!this.moveComplete){this.endMove();}},getThumb:function(){return this.thumb;},focus:function(){this.valueChangeSource=this.SOURCE_UI_EVENT;var el=this.getEl();if(el.focus){try{el.focus();}catch(e){}}
this.verifyOffset();if(this.isLocked()){return false;}else{this.onSlideStart();return true;}},onChange:function(firstOffset,secondOffset){},onSlideStart:function(){},onSlideEnd:function(){},getValue:function(){return this.thumb.getValue();},getXValue:function(){return this.thumb.getXValue();},getYValue:function(){return this.thumb.getYValue();},handleThumbChange:function(){var t=this.thumb;if(t._isRegion){t.onChange(t.getXValue(),t.getYValue());this.fireEvent("change",{x:t.getXValue(),y:t.getYValue()});}else{t.onChange(t.getValue());this.fireEvent("change",t.getValue());}},setValue:function(newOffset,skipAnim,force){this.valueChangeSource=this.SOURCE_SET_VALUE;if(!this.thumb.available){this.deferredSetValue=arguments;return false;}
if(this.isLocked()&&!force){return false;}
if(isNaN(newOffset)){return false;}
var t=this.thumb;var newX,newY;this.verifyOffset(true);if(t._isRegion){return false;}else if(t._isHoriz){this.onSlideStart();newX=t.initPageX+newOffset+this.thumbCenterPoint.x;this.moveThumb(newX,t.initPageY,skipAnim);}else{this.onSlideStart();newY=t.initPageY+newOffset+this.thumbCenterPoint.y;this.moveThumb(t.initPageX,newY,skipAnim);}
return true;},setRegionValue:function(newOffset,newOffset2,skipAnim,force){this.valueChangeSource=this.SOURCE_SET_VALUE;if(!this.thumb.available){this.deferredSetRegionValue=arguments;return false;}
if(this.isLocked()&&!force){return false;}
if(isNaN(newOffset)){return false;}
var t=this.thumb;if(t._isRegion){this.onSlideStart();var newX=t.initPageX+newOffset+this.thumbCenterPoint.x;var newY=t.initPageY+newOffset2+this.thumbCenterPoint.y;this.moveThumb(newX,newY,skipAnim);return true;}
return false;},verifyOffset:function(checkPos){var newPos=YAHOO.util.Dom.getXY(this.getEl());if(newPos[0]!=this.baselinePos[0]||newPos[1]!=this.baselinePos[1]){this.thumb.resetConstraints();this.baselinePos=newPos;return false;}
return true;},moveThumb:function(x,y,skipAnim){var t=this.thumb;var self=this;if(!t.available){return;}
t.setDelta(this.thumbCenterPoint.x,this.thumbCenterPoint.y);var _p=t.getTargetCoord(x,y);var p=[_p.x,_p.y];this.fireEvent("slideStart");if(this.animate&&YAHOO.widget.Slider.ANIM_AVAIL&&t._graduated&&!skipAnim){this.lock();this.curCoord=YAHOO.util.Dom.getXY(this.thumb.getEl());setTimeout(function(){self.moveOneTick(p);},this.tickPause);}else if(this.animate&&YAHOO.widget.Slider.ANIM_AVAIL&&!skipAnim){this.lock();var oAnim=new YAHOO.util.Motion(t.id,{points:{to:p}},this.animationDuration,YAHOO.util.Easing.easeOut);oAnim.onComplete.subscribe(function(){self.endMove();});oAnim.animate();}else{t.setDragElPos(x,y);this.endMove();}},moveOneTick:function(finalCoord){var t=this.thumb,tmp;var nextCoord=null;if(t._isRegion){nextCoord=this._getNextX(this.curCoord,finalCoord);var tmpX=(nextCoord)?nextCoord[0]:this.curCoord[0];nextCoord=this._getNextY([tmpX,this.curCoord[1]],finalCoord);}else if(t._isHoriz){nextCoord=this._getNextX(this.curCoord,finalCoord);}else{nextCoord=this._getNextY(this.curCoord,finalCoord);}
if(nextCoord){this.curCoord=nextCoord;this.thumb.alignElWithMouse(t.getEl(),nextCoord[0],nextCoord[1]);if(!(nextCoord[0]==finalCoord[0]&&nextCoord[1]==finalCoord[1])){var self=this;setTimeout(function(){self.moveOneTick(finalCoord);},this.tickPause);}else{this.endMove();}}else{this.endMove();}},_getNextX:function(curCoord,finalCoord){var t=this.thumb;var thresh;var tmp=[];var nextCoord=null;if(curCoord[0]>finalCoord[0]){thresh=t.tickSize-this.thumbCenterPoint.x;tmp=t.getTargetCoord(curCoord[0]-thresh,curCoord[1]);nextCoord=[tmp.x,tmp.y];}else if(curCoord[0]<finalCoord[0]){thresh=t.tickSize+this.thumbCenterPoint.x;tmp=t.getTargetCoord(curCoord[0]+thresh,curCoord[1]);nextCoord=[tmp.x,tmp.y];}else{}
return nextCoord;},_getNextY:function(curCoord,finalCoord){var t=this.thumb;var thresh;var tmp=[];var nextCoord=null;if(curCoord[1]>finalCoord[1]){thresh=t.tickSize-this.thumbCenterPoint.y;tmp=t.getTargetCoord(curCoord[0],curCoord[1]-thresh);nextCoord=[tmp.x,tmp.y];}else if(curCoord[1]<finalCoord[1]){thresh=t.tickSize+this.thumbCenterPoint.y;tmp=t.getTargetCoord(curCoord[0],curCoord[1]+thresh);nextCoord=[tmp.x,tmp.y];}else{}
return nextCoord;},b4MouseDown:function(e){this.thumb.autoOffset();this.thumb.resetConstraints();},onMouseDown:function(e){if(!this.isLocked()&&this.backgroundEnabled){var x=YAHOO.util.Event.getPageX(e);var y=YAHOO.util.Event.getPageY(e);this.focus();this.moveThumb(x,y);}},onDrag:function(e){if(!this.isLocked()){var x=YAHOO.util.Event.getPageX(e);var y=YAHOO.util.Event.getPageY(e);this.moveThumb(x,y,true);}},endMove:function(){this.unlock();this.moveComplete=true;this.fireEvents();},fireEvents:function(thumbEvent){var t=this.thumb;if(!thumbEvent){t.cachePosition();}
if(!this.isLocked()){if(t._isRegion){var newX=t.getXValue();var newY=t.getYValue();if(newX!=this.previousX||newY!=this.previousY){this.onChange(newX,newY);this.fireEvent("change",{x:newX,y:newY});}
this.previousX=newX;this.previousY=newY;}else{var newVal=t.getValue();if(newVal!=this.previousVal){this.onChange(newVal);this.fireEvent("change",newVal);}
this.previousVal=newVal;}
if(this.moveComplete){this.onSlideEnd();this.fireEvent("slideEnd");this.moveComplete=false;}}},toString:function(){return("Slider ("+this.type+") "+this.id);}});YAHOO.augment(YAHOO.widget.Slider,YAHOO.util.EventProvider);YAHOO.widget.SliderThumb=function(id,sGroup,iLeft,iRight,iUp,iDown,iTickSize){if(id){YAHOO.widget.SliderThumb.superclass.constructor.call(this,id,sGroup);this.parentElId=sGroup;}
this.isTarget=false;this.tickSize=iTickSize;this.maintainOffset=true;this.initSlider(iLeft,iRight,iUp,iDown,iTickSize);this.scroll=false;};YAHOO.extend(YAHOO.widget.SliderThumb,YAHOO.util.DD,{startOffset:null,_isHoriz:false,_prevVal:0,_graduated:false,getOffsetFromParent0:function(parentPos){var myPos=YAHOO.util.Dom.getXY(this.getEl());var ppos=parentPos||YAHOO.util.Dom.getXY(this.parentElId);return[(myPos[0]-ppos[0]),(myPos[1]-ppos[1])];},getOffsetFromParent:function(parentPos){var el=this.getEl();if(!this.deltaOffset){var myPos=YAHOO.util.Dom.getXY(el);var ppos=parentPos||YAHOO.util.Dom.getXY(this.parentElId);var newOffset=[(myPos[0]-ppos[0]),(myPos[1]-ppos[1])];var l=parseInt(YAHOO.util.Dom.getStyle(el,"left"),10);var t=parseInt(YAHOO.util.Dom.getStyle(el,"top"),10);var deltaX=l-newOffset[0];var deltaY=t-newOffset[1];if(isNaN(deltaX)||isNaN(deltaY)){}else{this.deltaOffset=[deltaX,deltaY];}}else{var newLeft=parseInt(YAHOO.util.Dom.getStyle(el,"left"),10);var newTop=parseInt(YAHOO.util.Dom.getStyle(el,"top"),10);newOffset=[newLeft+this.deltaOffset[0],newTop+this.deltaOffset[1]];}
return newOffset;},initSlider:function(iLeft,iRight,iUp,iDown,iTickSize){this.initLeft=iLeft;this.initRight=iRight;this.initUp=iUp;this.initDown=iDown;this.setXConstraint(iLeft,iRight,iTickSize);this.setYConstraint(iUp,iDown,iTickSize);if(iTickSize&&iTickSize>1){this._graduated=true;}
this._isHoriz=(iLeft||iRight);this._isVert=(iUp||iDown);this._isRegion=(this._isHoriz&&this._isVert);},clearTicks:function(){YAHOO.widget.SliderThumb.superclass.clearTicks.call(this);this.tickSize=0;this._graduated=false;},getValue:function(){if(!this.available){return 0;}
var val=(this._isHoriz)?this.getXValue():this.getYValue();return val;},getXValue:function(){if(!this.available){return 0;}
var newOffset=this.getOffsetFromParent();return(newOffset[0]-this.startOffset[0]);},getYValue:function(){if(!this.available){return 0;}
var newOffset=this.getOffsetFromParent();return(newOffset[1]-this.startOffset[1]);},toString:function(){return"SliderThumb "+this.id;},onChange:function(x,y){}});if("undefined"==typeof YAHOO.util.Anim){YAHOO.widget.Slider.ANIM_AVAIL=false;}
YAHOO.register("slider",YAHOO.widget.Slider,{version:"2.3.0",build:"357"});