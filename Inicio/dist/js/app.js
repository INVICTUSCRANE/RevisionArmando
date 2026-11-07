(()=>{var wa=Object.create;var Qt=Object.defineProperty;var $a=Object.getOwnPropertyDescriptor;var Ma=Object.getOwnPropertyNames;var Sa=Object.getPrototypeOf,Pa=Object.prototype.hasOwnProperty;var La=(t,a)=>()=>(a||t((a={exports:{}}).exports,a),a.exports);var ka=(t,a,i,n)=>{if(a&&typeof a=="object"||typeof a=="function")for(let l of Ma(a))!Pa.call(t,l)&&l!==i&&Qt(t,l,{get:()=>a[l],enumerable:!(n=$a(a,l))||n.enumerable});return t};var Ca=(t,a,i)=>(i=t!=null?wa(Sa(t)):{},ka(a||!t||!t.__esModule?Qt(i,"default",{value:t,enumerable:!0}):i,t));var Be=La((At,qe)=>{(function(t,a){typeof At=="object"&&typeof qe<"u"?a(At):typeof define=="function"&&define.amd?define(["exports"],a):a((t=t||self).St={})})(At,(function(t){"use strict";class a{constructor(e,s){this.state={angle:0,area:[],position:{x:0,y:0},hardAngle:0,hardDrawingAngle:0},this.createdDensity=s,this.nowDrawingDensity=this.createdDensity,this.render=e}setDensity(e){this.createdDensity=e,this.nowDrawingDensity=e}setDrawingDensity(e){this.nowDrawingDensity=e}setPosition(e){this.state.position=e}setAngle(e){this.state.angle=e}setArea(e){this.state.area=e}setHardDrawingAngle(e){this.state.hardDrawingAngle=e}setHardAngle(e){this.state.hardAngle=e,this.state.hardDrawingAngle=e}setOrientation(e){this.orientation=e}getDrawingDensity(){return this.nowDrawingDensity}getDensity(){return this.createdDensity}getHardAngle(){return this.state.hardAngle}}class i extends a{constructor(e,s,o){super(e,o),this.image=null,this.isLoad=!1,this.loadingAngle=0,this.image=new Image,this.image.src=s}draw(e){let s=this.render.getContext(),o=this.render.convertToGlobal(this.state.position),d=this.render.getRect().pageWidth,g=this.render.getRect().height;s.save(),s.translate(o.x,o.y),s.beginPath();for(let c of this.state.area)c!==null&&(c=this.render.convertToGlobal(c),s.lineTo(c.x-o.x,c.y-o.y));s.rotate(this.state.angle),s.clip(),this.isLoad?s.drawImage(this.image,0,0,d,g):this.drawLoader(s,{x:0,y:0},d,g),s.restore()}simpleDraw(e){let s=this.render.getRect(),o=this.render.getContext(),d=s.pageWidth,g=s.height,c=e===1?s.left+s.pageWidth:s.left,p=s.top;this.isLoad?o.drawImage(this.image,c,p,d,g):this.drawLoader(o,{x:c,y:p},d,g)}drawLoader(e,s,o,d){e.beginPath(),e.strokeStyle="rgb(200, 200, 200)",e.fillStyle="rgb(255, 255, 255)",e.lineWidth=1,e.rect(s.x+1,s.y+1,o-1,d-1),e.stroke(),e.fill();let g={x:s.x+o/2,y:s.y+d/2};e.beginPath(),e.lineWidth=10,e.arc(g.x,g.y,20,this.loadingAngle,3*Math.PI/2+this.loadingAngle),e.stroke(),e.closePath(),this.loadingAngle+=.07,this.loadingAngle>=2*Math.PI&&(this.loadingAngle=0)}load(){this.isLoad||(this.image.onload=()=>{this.isLoad=!0})}newTemporaryCopy(){return this}getTemporaryCopy(){return this}hideTemporaryCopy(){}}class n{constructor(e,s){this.pages=[],this.currentPageIndex=0,this.currentSpreadIndex=0,this.landscapeSpread=[],this.portraitSpread=[],this.render=s,this.app=e,this.currentPageIndex=0,this.isShowCover=this.app.getSettings().showCover}destroy(){this.pages=[]}createSpread(){this.landscapeSpread=[],this.portraitSpread=[];for(let s=0;s<this.pages.length;s++)this.portraitSpread.push([s]);let e=0;this.isShowCover&&(this.pages[0].setDensity("hard"),this.landscapeSpread.push([e]),e++);for(let s=e;s<this.pages.length;s+=2)s<this.pages.length-1?this.landscapeSpread.push([s,s+1]):(this.landscapeSpread.push([s]),this.pages[s].setDensity("hard"))}getSpread(){return this.render.getOrientation()==="landscape"?this.landscapeSpread:this.portraitSpread}getSpreadIndexByPage(e){let s=this.getSpread();for(let o=0;o<s.length;o++)if(e===s[o][0]||e===s[o][1])return o;return null}getPageCount(){return this.pages.length}getPages(){return this.pages}getPage(e){if(e>=0&&e<this.pages.length)return this.pages[e];throw new Error("Invalid page number")}nextBy(e){let s=this.pages.indexOf(e);return s<this.pages.length-1?this.pages[s+1]:null}prevBy(e){let s=this.pages.indexOf(e);return s>0?this.pages[s-1]:null}getFlippingPage(e){let s=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return e===0?this.pages[s].newTemporaryCopy():this.pages[s-1];{let o=e===0?this.getSpread()[s+1]:this.getSpread()[s-1];return o.length===1||e===0?this.pages[o[0]]:this.pages[o[1]]}}getBottomPage(e){let s=this.currentSpreadIndex;if(this.render.getOrientation()==="portrait")return e===0?this.pages[s+1]:this.pages[s-1];{let o=e===0?this.getSpread()[s+1]:this.getSpread()[s-1];return o.length===1?this.pages[o[0]]:e===0?this.pages[o[1]]:this.pages[o[0]]}}showNext(){this.currentSpreadIndex<this.getSpread().length&&(this.currentSpreadIndex++,this.showSpread())}showPrev(){this.currentSpreadIndex>0&&(this.currentSpreadIndex--,this.showSpread())}getCurrentPageIndex(){return this.currentPageIndex}show(e=null){if(e===null&&(e=this.currentPageIndex),e<0||e>=this.pages.length)return;let s=this.getSpreadIndexByPage(e);s!==null&&(this.currentSpreadIndex=s,this.showSpread())}getCurrentSpreadIndex(){return this.currentSpreadIndex}setCurrentSpreadIndex(e){if(!(e>=0&&e<this.getSpread().length))throw new Error("Invalid page");this.currentSpreadIndex=e}showSpread(){let e=this.getSpread()[this.currentSpreadIndex];e.length===2?(this.render.setLeftPage(this.pages[e[0]]),this.render.setRightPage(this.pages[e[1]])):this.render.getOrientation()==="landscape"&&e[0]===this.pages.length-1?(this.render.setLeftPage(this.pages[e[0]]),this.render.setRightPage(null)):(this.render.setLeftPage(null),this.render.setRightPage(this.pages[e[0]])),this.currentPageIndex=e[0],this.app.updatePageIndex(this.currentPageIndex)}}class l extends n{constructor(e,s,o){super(e,s),this.imagesHref=o}load(){for(let e of this.imagesHref){let s=new i(this.render,e,"soft");s.load(),this.pages.push(s)}this.createSpread()}}class r{static GetDistanceBetweenTwoPoint(e,s){return e===null||s===null?1/0:Math.sqrt(Math.pow(s.x-e.x,2)+Math.pow(s.y-e.y,2))}static GetSegmentLength(e){return r.GetDistanceBetweenTwoPoint(e[0],e[1])}static GetAngleBetweenTwoLine(e,s){let o=e[0].y-e[1].y,d=s[0].y-s[1].y,g=e[1].x-e[0].x,c=s[1].x-s[0].x;return Math.acos((o*d+g*c)/(Math.sqrt(o*o+g*g)*Math.sqrt(d*d+c*c)))}static PointInRect(e,s){return s===null?null:s.x>=e.left&&s.x<=e.width+e.left&&s.y>=e.top&&s.y<=e.top+e.height?s:null}static GetRotatedPoint(e,s,o){return{x:e.x*Math.cos(o)+e.y*Math.sin(o)+s.x,y:e.y*Math.cos(o)-e.x*Math.sin(o)+s.y}}static LimitPointToCircle(e,s,o){if(r.GetDistanceBetweenTwoPoint(e,o)<=s)return o;let d=e.x,g=e.y,c=o.x,p=o.y,u=Math.sqrt(Math.pow(s,2)*Math.pow(d-c,2)/(Math.pow(d-c,2)+Math.pow(g-p,2)))+d;o.x<0&&(u*=-1);let w=(u-d)*(g-p)/(d-c)+g;return d-c+g===0&&(w=s),{x:u,y:w}}static GetIntersectBetweenTwoSegment(e,s,o){return r.PointInRect(e,r.GetIntersectBeetwenTwoLine(s,o))}static GetIntersectBeetwenTwoLine(e,s){let o=e[0].y-e[1].y,d=s[0].y-s[1].y,g=e[1].x-e[0].x,c=s[1].x-s[0].x,p=e[0].x*e[1].y-e[1].x*e[0].y,u=s[0].x*s[1].y-s[1].x*s[0].y,w=o*u-d*p,C=g*u-c*p,L=-(p*c-u*g)/(o*c-d*g),U=-(o*u-d*p)/(o*c-d*g);if(isFinite(L)&&isFinite(U))return{x:L,y:U};if(Math.abs(w-C)<.1)throw new Error("Segment included");return null}static GetCordsFromTwoPoint(e,s){let o=Math.abs(e.x-s.x),d=Math.abs(e.y-s.y),g=Math.max(o,d),c=[e];function p(u,w,C,L,U){return w>u?u+U*(C/L):w<u?u-U*(C/L):u}for(let u=1;u<=g;u+=1)c.push({x:p(e.x,s.x,o,g,u),y:p(e.y,s.y,d,g,u)});return c}}class h extends a{constructor(e,s,o){super(e,o),this.copiedElement=null,this.temporaryCopy=null,this.isLoad=!1,this.element=s,this.element.classList.add("stf__item"),this.element.classList.add("--"+o)}newTemporaryCopy(){return this.nowDrawingDensity==="hard"?this:(this.temporaryCopy===null&&(this.copiedElement=this.element.cloneNode(!0),this.element.parentElement.appendChild(this.copiedElement),this.temporaryCopy=new h(this.render,this.copiedElement,this.nowDrawingDensity)),this.getTemporaryCopy())}getTemporaryCopy(){return this.temporaryCopy}hideTemporaryCopy(){this.temporaryCopy!==null&&(this.copiedElement.remove(),this.copiedElement=null,this.temporaryCopy=null)}draw(e){let s=e||this.nowDrawingDensity,o=this.render.convertToGlobal(this.state.position),d=this.render.getRect().pageWidth,g=this.render.getRect().height;this.element.classList.remove("--simple");let c=`
            display: block;
            z-index: ${this.element.style.zIndex};
            left: 0;
            top: 0;
            width: ${d}px;
            height: ${g}px;
        `;s==="hard"?this.drawHard(c):this.drawSoft(o,c)}drawHard(e=""){let s=this.render.getRect().left+this.render.getRect().width/2,o=this.state.hardDrawingAngle,d=e+`
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
                clip-path: none;
                -webkit-clip-path: none;
            `+(this.orientation===0?`transform-origin: ${this.render.getRect().pageWidth}px 0; 
                   transform: translate3d(0, 0, 0) rotateY(${o}deg);`:`transform-origin: 0 0; 
                   transform: translate3d(${s}px, 0, 0) rotateY(${o}deg);`);this.element.style.cssText=d}drawSoft(e,s=""){let o="polygon( ";for(let g of this.state.area)if(g!==null){let c=this.render.getDirection()===1?{x:-g.x+this.state.position.x,y:g.y-this.state.position.y}:{x:g.x-this.state.position.x,y:g.y-this.state.position.y};c=r.GetRotatedPoint(c,{x:0,y:0},this.state.angle),o+=c.x+"px "+c.y+"px, "}o=o.slice(0,-2),o+=")";let d=s+`transform-origin: 0 0; clip-path: ${o}; -webkit-clip-path: ${o};`+(this.render.isSafari()&&this.state.angle===0?`transform: translate(${e.x}px, ${e.y}px);`:`transform: translate3d(${e.x}px, ${e.y}px, 0) rotate(${this.state.angle}rad);`);this.element.style.cssText=d}simpleDraw(e){let s=this.render.getRect(),o=s.pageWidth,d=s.height,g=e===1?s.left+s.pageWidth:s.left,c=s.top;this.element.classList.add("--simple"),this.element.style.cssText=`
            position: absolute; 
            display: block; 
            height: ${d}px; 
            left: ${g}px; 
            top: ${c}px; 
            width: ${o}px; 
            z-index: ${this.render.getSettings().startZIndex+1};`}getElement(){return this.element}load(){this.isLoad=!0}setOrientation(e){super.setOrientation(e),this.element.classList.remove("--left","--right"),this.element.classList.add(e===1?"--right":"--left")}setDrawingDensity(e){this.element.classList.remove("--soft","--hard"),this.element.classList.add("--"+e),super.setDrawingDensity(e)}}class m extends n{constructor(e,s,o,d){super(e,s),this.element=o,this.pagesElement=d}load(){for(let e of this.pagesElement){let s=new h(this.render,e,e.dataset.density==="hard"?"hard":"soft");s.load(),this.pages.push(s)}this.createSpread()}}class b{constructor(e,s,o,d){this.direction=e,this.corner=s,this.topIntersectPoint=null,this.sideIntersectPoint=null,this.bottomIntersectPoint=null,this.pageWidth=parseInt(o,10),this.pageHeight=parseInt(d,10)}calc(e){try{return this.position=this.calcAngleAndPosition(e),this.calculateIntersectPoint(this.position),!0}catch{return!1}}getFlippingClipArea(){let e=[],s=!1;return e.push(this.rect.topLeft),e.push(this.topIntersectPoint),this.sideIntersectPoint===null?s=!0:(e.push(this.sideIntersectPoint),this.bottomIntersectPoint===null&&(s=!1)),e.push(this.bottomIntersectPoint),(s||this.corner==="bottom")&&e.push(this.rect.bottomLeft),e}getBottomClipArea(){let e=[];return e.push(this.topIntersectPoint),this.corner==="top"?e.push({x:this.pageWidth,y:0}):(this.topIntersectPoint!==null&&e.push({x:this.pageWidth,y:0}),e.push({x:this.pageWidth,y:this.pageHeight})),this.sideIntersectPoint!==null?r.GetDistanceBetweenTwoPoint(this.sideIntersectPoint,this.topIntersectPoint)>=10&&e.push(this.sideIntersectPoint):this.corner==="top"&&e.push({x:this.pageWidth,y:this.pageHeight}),e.push(this.bottomIntersectPoint),e.push(this.topIntersectPoint),e}getAngle(){return this.direction===0?-this.angle:this.angle}getRect(){return this.rect}getPosition(){return this.position}getActiveCorner(){return this.direction===0?this.rect.topLeft:this.rect.topRight}getDirection(){return this.direction}getFlippingProgress(){return Math.abs((this.position.x-this.pageWidth)/(2*this.pageWidth)*100)}getCorner(){return this.corner}getBottomPagePosition(){return this.direction===1?{x:this.pageWidth,y:0}:{x:0,y:0}}getShadowStartPoint(){return this.corner==="top"?this.topIntersectPoint:this.sideIntersectPoint!==null?this.sideIntersectPoint:this.topIntersectPoint}getShadowAngle(){let e=r.GetAngleBetweenTwoLine(this.getSegmentToShadowLine(),[{x:0,y:0},{x:this.pageWidth,y:0}]);return this.direction===0?e:Math.PI-e}calcAngleAndPosition(e){let s=e;if(this.updateAngleAndGeometry(s),s=this.corner==="top"?this.checkPositionAtCenterLine(s,{x:0,y:0},{x:0,y:this.pageHeight}):this.checkPositionAtCenterLine(s,{x:0,y:this.pageHeight},{x:0,y:0}),Math.abs(s.x-this.pageWidth)<1&&Math.abs(s.y)<1)throw new Error("Point is too small");return s}updateAngleAndGeometry(e){this.angle=this.calculateAngle(e),this.rect=this.getPageRect(e)}calculateAngle(e){let s=this.pageWidth-e.x+1,o=this.corner==="bottom"?this.pageHeight-e.y:e.y,d=2*Math.acos(s/Math.sqrt(o*o+s*s));o<0&&(d=-d);let g=Math.PI-d;if(!isFinite(d)||g>=0&&g<.003)throw new Error("The G point is too small");return this.corner==="bottom"&&(d=-d),d}getPageRect(e){return this.corner==="top"?this.getRectFromBasePoint([{x:0,y:0},{x:this.pageWidth,y:0},{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}],e):this.getRectFromBasePoint([{x:0,y:-this.pageHeight},{x:this.pageWidth,y:-this.pageHeight},{x:0,y:0},{x:this.pageWidth,y:0}],e)}getRectFromBasePoint(e,s){return{topLeft:this.getRotatedPoint(e[0],s),topRight:this.getRotatedPoint(e[1],s),bottomLeft:this.getRotatedPoint(e[2],s),bottomRight:this.getRotatedPoint(e[3],s)}}getRotatedPoint(e,s){return{x:e.x*Math.cos(this.angle)+e.y*Math.sin(this.angle)+s.x,y:e.y*Math.cos(this.angle)-e.x*Math.sin(this.angle)+s.y}}calculateIntersectPoint(e){let s={left:-1,top:-1,width:this.pageWidth+2,height:this.pageHeight+2};this.corner==="top"?(this.topIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[e,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[e,this.rect.bottomLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}])):(this.topIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[this.rect.topLeft,this.rect.topRight],[{x:0,y:0},{x:this.pageWidth,y:0}]),this.sideIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[e,this.rect.topLeft],[{x:this.pageWidth,y:0},{x:this.pageWidth,y:this.pageHeight}]),this.bottomIntersectPoint=r.GetIntersectBetweenTwoSegment(s,[this.rect.bottomLeft,this.rect.bottomRight],[{x:0,y:this.pageHeight},{x:this.pageWidth,y:this.pageHeight}]))}checkPositionAtCenterLine(e,s,o){let d=e,g=r.LimitPointToCircle(s,this.pageWidth,d);d!==g&&(d=g,this.updateAngleAndGeometry(d));let c=Math.sqrt(Math.pow(this.pageWidth,2)+Math.pow(this.pageHeight,2)),p=this.rect.bottomRight,u=this.rect.topLeft;if(this.corner==="bottom"&&(p=this.rect.topRight,u=this.rect.bottomLeft),p.x<=0){let w=r.LimitPointToCircle(o,c,u);w!==d&&(d=w,this.updateAngleAndGeometry(d))}return d}getSegmentToShadowLine(){let e=this.getShadowStartPoint();return[e,e!==this.sideIntersectPoint&&this.sideIntersectPoint!==null?this.sideIntersectPoint:this.bottomIntersectPoint]}}class v{constructor(e,s){this.flippingPage=null,this.bottomPage=null,this.calc=null,this.state="read",this.render=e,this.app=s}fold(e){this.setState("user_fold"),this.calc===null&&this.start(e),this.do(this.render.convertToPage(e))}flip(e){if(this.app.getSettings().disableFlipByClick&&!this.isPointOnCorners(e)||(this.calc!==null&&this.render.finishAnimation(),!this.start(e)))return;let s=this.getBoundsRect();this.setState("flipping");let o=s.height/10,d=this.calc.getCorner()==="bottom"?s.height-o:o,g=this.calc.getCorner()==="bottom"?s.height:0;this.calc.calc({x:s.pageWidth-o,y:d}),this.animateFlippingTo({x:s.pageWidth-o,y:d},{x:-s.pageWidth,y:g},!0)}start(e){this.reset();let s=this.render.convertToBook(e),o=this.getBoundsRect(),d=this.getDirectionByPoint(s),g=s.y>=o.height/2?"bottom":"top";if(!this.checkDirection(d))return!1;try{if(this.flippingPage=this.app.getPageCollection().getFlippingPage(d),this.bottomPage=this.app.getPageCollection().getBottomPage(d),this.render.getOrientation()==="landscape")if(d===1){let c=this.app.getPageCollection().nextBy(this.flippingPage);c!==null&&this.flippingPage.getDensity()!==c.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),c.setDrawingDensity("hard"))}else{let c=this.app.getPageCollection().prevBy(this.flippingPage);c!==null&&this.flippingPage.getDensity()!==c.getDensity()&&(this.flippingPage.setDrawingDensity("hard"),c.setDrawingDensity("hard"))}return this.render.setDirection(d),this.calc=new b(d,g,o.pageWidth.toString(10),o.height.toString(10)),!0}catch{return!1}}do(e){if(this.calc!==null&&this.calc.calc(e)){let s=this.calc.getFlippingProgress();this.bottomPage.setArea(this.calc.getBottomClipArea()),this.bottomPage.setPosition(this.calc.getBottomPagePosition()),this.bottomPage.setAngle(0),this.bottomPage.setHardAngle(0),this.flippingPage.setArea(this.calc.getFlippingClipArea()),this.flippingPage.setPosition(this.calc.getActiveCorner()),this.flippingPage.setAngle(this.calc.getAngle()),this.calc.getDirection()===0?this.flippingPage.setHardAngle(90*(200-2*s)/100):this.flippingPage.setHardAngle(-90*(200-2*s)/100),this.render.setPageRect(this.calc.getRect()),this.render.setBottomPage(this.bottomPage),this.render.setFlippingPage(this.flippingPage),this.render.setShadowData(this.calc.getShadowStartPoint(),this.calc.getShadowAngle(),s,this.calc.getDirection())}}flipToPage(e,s){let o=this.app.getPageCollection().getCurrentSpreadIndex(),d=this.app.getPageCollection().getSpreadIndexByPage(e);try{d>o&&(this.app.getPageCollection().setCurrentSpreadIndex(d-1),this.flipNext(s)),d<o&&(this.app.getPageCollection().setCurrentSpreadIndex(d+1),this.flipPrev(s))}catch{}}flipNext(e){this.flip({x:this.render.getRect().left+2*this.render.getRect().pageWidth-10,y:e==="top"?1:this.render.getRect().height-2})}flipPrev(e){this.flip({x:10,y:e==="top"?1:this.render.getRect().height-2})}stopMove(){if(this.calc===null)return;let e=this.calc.getPosition(),s=this.getBoundsRect(),o=this.calc.getCorner()==="bottom"?s.height:0;e.x<=0?this.animateFlippingTo(e,{x:-s.pageWidth,y:o},!0):this.animateFlippingTo(e,{x:s.pageWidth,y:o},!1)}showCorner(e){if(!this.checkState("read","fold_corner"))return;let s=this.getBoundsRect(),o=s.pageWidth;if(this.isPointOnCorners(e))if(this.calc===null){if(!this.start(e))return;this.setState("fold_corner"),this.calc.calc({x:o-1,y:1});let d=50,g=this.calc.getCorner()==="bottom"?s.height-1:1,c=this.calc.getCorner()==="bottom"?s.height-d:d;this.animateFlippingTo({x:o-1,y:g},{x:o-d,y:c},!1,!1)}else this.do(this.render.convertToPage(e));else this.setState("read"),this.render.finishAnimation(),this.stopMove()}animateFlippingTo(e,s,o,d=!0){let g=r.GetCordsFromTwoPoint(e,s),c=[];for(let u of g)c.push(()=>this.do(u));let p=this.getAnimationDuration(g.length);this.render.startAnimation(c,p,()=>{this.calc&&(o&&(this.calc.getDirection()===1?this.app.turnToPrevPage():this.app.turnToNextPage()),d&&(this.render.setBottomPage(null),this.render.setFlippingPage(null),this.render.clearShadow(),this.setState("read"),this.reset()))})}getCalculation(){return this.calc}getState(){return this.state}setState(e){this.state!==e&&(this.app.updateState(e),this.state=e)}getDirectionByPoint(e){let s=this.getBoundsRect();if(this.render.getOrientation()==="portrait"){if(e.x-s.pageWidth<=s.width/5)return 1}else if(e.x<s.width/2)return 1;return 0}getAnimationDuration(e){let s=this.app.getSettings().flippingTime;return e>=1e3?s:e/1e3*s}checkDirection(e){return e===0?this.app.getCurrentPageIndex()<this.app.getPageCount()-1:this.app.getCurrentPageIndex()>=1}reset(){this.calc=null,this.flippingPage=null,this.bottomPage=null}getBoundsRect(){return this.render.getRect()}checkState(...e){for(let s of e)if(this.state===s)return!0;return!1}isPointOnCorners(e){let s=this.getBoundsRect(),o=s.pageWidth,d=Math.sqrt(Math.pow(o,2)+Math.pow(s.height,2))/5,g=this.render.convertToBook(e);return g.x>0&&g.y>0&&g.x<s.width&&g.y<s.height&&(g.x<d||g.x>s.width-d)&&(g.y<d||g.y>s.height-d)}}class M{constructor(e,s){this.leftPage=null,this.rightPage=null,this.flippingPage=null,this.bottomPage=null,this.direction=null,this.orientation=null,this.shadow=null,this.animation=null,this.pageRect=null,this.boundsRect=null,this.timer=0,this.safari=!1,this.setting=s,this.app=e;let o=new RegExp("Version\\/[\\d\\.]+.*Safari/");this.safari=o.exec(window.navigator.userAgent)!==null}render(e){if(this.animation!==null){let s=Math.round((e-this.animation.startedAt)/this.animation.durationFrame);s<this.animation.frames.length?this.animation.frames[s]():(this.animation.onAnimateEnd(),this.animation=null)}this.timer=e,this.drawFrame()}start(){this.update();let e=s=>{this.render(s),requestAnimationFrame(e)};requestAnimationFrame(e)}startAnimation(e,s,o){this.finishAnimation(),this.animation={frames:e,duration:s,durationFrame:s/e.length,onAnimateEnd:o,startedAt:this.timer}}finishAnimation(){this.animation!==null&&(this.animation.frames[this.animation.frames.length-1](),this.animation.onAnimateEnd!==null&&this.animation.onAnimateEnd()),this.animation=null}update(){this.boundsRect=null;let e=this.calculateBoundsRect();this.orientation!==e&&(this.orientation=e,this.app.updateOrientation(e))}calculateBoundsRect(){let e="landscape",s=this.getBlockWidth(),o=s/2,d=this.getBlockHeight()/2,g=this.setting.width/this.setting.height,c=this.setting.width,p=this.setting.height,u=o-c;return this.setting.size==="stretch"?(s<2*this.setting.minWidth&&this.app.getSettings().usePortrait&&(e="portrait"),c=e==="portrait"?this.getBlockWidth():this.getBlockWidth()/2,c>this.setting.maxWidth&&(c=this.setting.maxWidth),p=c/g,p>this.getBlockHeight()&&(p=this.getBlockHeight(),c=p*g),u=e==="portrait"?o-c/2-c:o-c):s<2*c&&this.app.getSettings().usePortrait&&(e="portrait",u=o-c/2-c),this.boundsRect={left:u,top:d-p/2,width:2*c,height:p,pageWidth:c},e}setShadowData(e,s,o,d){if(!this.app.getSettings().drawShadow)return;let g=100*this.getSettings().maxShadowOpacity;this.shadow={pos:e,angle:s,width:3*this.getRect().pageWidth/4*o/100,opacity:(100-o)*g/100/100,direction:d,progress:2*o}}clearShadow(){this.shadow=null}getBlockWidth(){return this.app.getUI().getDistElement().offsetWidth}getBlockHeight(){return this.app.getUI().getDistElement().offsetHeight}getDirection(){return this.direction}getRect(){return this.boundsRect===null&&this.calculateBoundsRect(),this.boundsRect}getSettings(){return this.app.getSettings()}getOrientation(){return this.orientation}setPageRect(e){this.pageRect=e}setDirection(e){this.direction=e}setRightPage(e){e!==null&&e.setOrientation(1),this.rightPage=e}setLeftPage(e){e!==null&&e.setOrientation(0),this.leftPage=e}setBottomPage(e){e!==null&&e.setOrientation(this.direction===1?0:1),this.bottomPage=e}setFlippingPage(e){e!==null&&e.setOrientation(this.direction===0&&this.orientation!=="portrait"?0:1),this.flippingPage=e}convertToBook(e){let s=this.getRect();return{x:e.x-s.left,y:e.y-s.top}}isSafari(){return this.safari}convertToPage(e,s){s||(s=this.direction);let o=this.getRect();return{x:s===0?e.x-o.left-o.width/2:o.width/2-e.x+o.left,y:e.y-o.top}}convertToGlobal(e,s){if(s||(s=this.direction),e==null)return null;let o=this.getRect();return{x:s===0?e.x+o.left+o.width/2:o.width/2-e.x+o.left,y:e.y+o.top}}convertRectToGlobal(e,s){return s||(s=this.direction),{topLeft:this.convertToGlobal(e.topLeft,s),topRight:this.convertToGlobal(e.topRight,s),bottomLeft:this.convertToGlobal(e.bottomLeft,s),bottomRight:this.convertToGlobal(e.bottomRight,s)}}}class O extends M{constructor(e,s,o){super(e,s),this.canvas=o,this.ctx=o.getContext("2d")}getContext(){return this.ctx}reload(){}drawFrame(){this.clear(),this.orientation!=="portrait"&&this.leftPage!=null&&this.leftPage.simpleDraw(0),this.rightPage!=null&&this.rightPage.simpleDraw(1),this.bottomPage!=null&&this.bottomPage.draw(),this.drawBookShadow(),this.flippingPage!=null&&this.flippingPage.draw(),this.shadow!=null&&(this.drawOuterShadow(),this.drawInnerShadow());let e=this.getRect();this.orientation==="portrait"&&(this.ctx.beginPath(),this.ctx.rect(e.left+e.pageWidth,e.top,e.width,e.height),this.ctx.clip())}drawBookShadow(){let e=this.getRect();this.ctx.save(),this.ctx.beginPath();let s=e.width/20;this.ctx.rect(e.left,e.top,e.width,e.height);let o={x:e.left+e.width/2-s/2,y:0};this.ctx.translate(o.x,o.y);let d=this.ctx.createLinearGradient(0,0,s,0);d.addColorStop(0,"rgba(0, 0, 0, 0)"),d.addColorStop(.4,"rgba(0, 0, 0, 0.2)"),d.addColorStop(.49,"rgba(0, 0, 0, 0.1)"),d.addColorStop(.5,"rgba(0, 0, 0, 0.5)"),d.addColorStop(.51,"rgba(0, 0, 0, 0.4)"),d.addColorStop(1,"rgba(0, 0, 0, 0)"),this.ctx.clip(),this.ctx.fillStyle=d,this.ctx.fillRect(0,0,s,2*e.height),this.ctx.restore()}drawOuterShadow(){let e=this.getRect();this.ctx.save(),this.ctx.beginPath(),this.ctx.rect(e.left,e.top,e.width,e.height);let s=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y});this.ctx.translate(s.x,s.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);let o=this.ctx.createLinearGradient(0,0,this.shadow.width,0);this.shadow.direction===0?(this.ctx.translate(0,-100),o.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),o.addColorStop(1,"rgba(0, 0, 0, 0)")):(this.ctx.translate(-this.shadow.width,-100),o.addColorStop(0,"rgba(0, 0, 0, 0)"),o.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")")),this.ctx.clip(),this.ctx.fillStyle=o,this.ctx.fillRect(0,0,this.shadow.width,2*e.height),this.ctx.restore()}drawInnerShadow(){let e=this.getRect();this.ctx.save(),this.ctx.beginPath();let s=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),o=this.convertRectToGlobal(this.pageRect);this.ctx.moveTo(o.topLeft.x,o.topLeft.y),this.ctx.lineTo(o.topRight.x,o.topRight.y),this.ctx.lineTo(o.bottomRight.x,o.bottomRight.y),this.ctx.lineTo(o.bottomLeft.x,o.bottomLeft.y),this.ctx.translate(s.x,s.y),this.ctx.rotate(Math.PI+this.shadow.angle+Math.PI/2);let d=3*this.shadow.width/4,g=this.ctx.createLinearGradient(0,0,d,0);this.shadow.direction===0?(this.ctx.translate(-d,-100),g.addColorStop(1,"rgba(0, 0, 0, "+this.shadow.opacity+")"),g.addColorStop(.9,"rgba(0, 0, 0, 0.05)"),g.addColorStop(.7,"rgba(0, 0, 0, "+this.shadow.opacity+")"),g.addColorStop(0,"rgba(0, 0, 0, 0)")):(this.ctx.translate(0,-100),g.addColorStop(0,"rgba(0, 0, 0, "+this.shadow.opacity+")"),g.addColorStop(.1,"rgba(0, 0, 0, 0.05)"),g.addColorStop(.3,"rgba(0, 0, 0, "+this.shadow.opacity+")"),g.addColorStop(1,"rgba(0, 0, 0, 0)")),this.ctx.clip(),this.ctx.fillStyle=g,this.ctx.fillRect(0,0,d,2*e.height),this.ctx.restore()}clear(){this.ctx.fillStyle="white",this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)}}class D{constructor(e,s,o){this.touchPoint=null,this.swipeTimeout=250,this.onResize=()=>{this.update()},this.onMouseDown=g=>{if(this.checkTarget(g.target)){let c=this.getMousePos(g.clientX,g.clientY);this.app.startUserTouch(c),g.preventDefault()}},this.onTouchStart=g=>{if(this.checkTarget(g.target)&&g.changedTouches.length>0){let c=g.changedTouches[0],p=this.getMousePos(c.clientX,c.clientY);this.touchPoint={point:p,time:Date.now()},setTimeout(()=>{this.touchPoint!==null&&this.app.startUserTouch(p)},this.swipeTimeout),this.app.getSettings().mobileScrollSupport||g.preventDefault()}},this.onMouseUp=g=>{let c=this.getMousePos(g.clientX,g.clientY);this.app.userStop(c)},this.onMouseMove=g=>{let c=this.getMousePos(g.clientX,g.clientY);this.app.userMove(c,!1)},this.onTouchMove=g=>{if(g.changedTouches.length>0){let c=g.changedTouches[0],p=this.getMousePos(c.clientX,c.clientY);this.app.getSettings().mobileScrollSupport?(this.touchPoint!==null&&(Math.abs(this.touchPoint.point.x-p.x)>10||this.app.getState()!=="read")&&g.cancelable&&this.app.userMove(p,!0),this.app.getState()!=="read"&&g.preventDefault()):this.app.userMove(p,!0)}},this.onTouchEnd=g=>{if(g.changedTouches.length>0){let c=g.changedTouches[0],p=this.getMousePos(c.clientX,c.clientY),u=!1;if(this.touchPoint!==null){let w=p.x-this.touchPoint.point.x,C=Math.abs(p.y-this.touchPoint.point.y);Math.abs(w)>this.swipeDistance&&C<2*this.swipeDistance&&Date.now()-this.touchPoint.time<this.swipeTimeout&&(w>0?this.app.flipPrev(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"):this.app.flipNext(this.touchPoint.point.y<this.app.getRender().getRect().height/2?"top":"bottom"),u=!0),this.touchPoint=null}this.app.userStop(p,u)}},this.parentElement=e,e.classList.add("stf__parent"),e.insertAdjacentHTML("afterbegin",'<div class="stf__wrapper"></div>'),this.wrapper=e.querySelector(".stf__wrapper"),this.app=s;let d=this.app.getSettings().usePortrait?1:2;e.style.minWidth=o.minWidth*d+"px",e.style.minHeight=o.minHeight+"px",o.size==="fixed"&&(e.style.minWidth=o.width*d+"px",e.style.minHeight=o.height+"px"),o.autoSize&&(e.style.width="100%",e.style.maxWidth=2*o.maxWidth+"px"),e.style.display="block",window.addEventListener("resize",this.onResize,!1),this.swipeDistance=o.swipeDistance}destroy(){this.app.getSettings().useMouseEvents&&this.removeHandlers(),this.distElement.remove(),this.wrapper.remove()}getDistElement(){return this.distElement}getWrapper(){return this.wrapper}setOrientationStyle(e){this.wrapper.classList.remove("--portrait","--landscape"),e==="portrait"?(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/this.app.getSettings().width*100+"%"),this.wrapper.classList.add("--portrait")):(this.app.getSettings().autoSize&&(this.wrapper.style.paddingBottom=this.app.getSettings().height/(2*this.app.getSettings().width)*100+"%"),this.wrapper.classList.add("--landscape")),this.update()}removeHandlers(){window.removeEventListener("resize",this.onResize),this.distElement.removeEventListener("mousedown",this.onMouseDown),this.distElement.removeEventListener("touchstart",this.onTouchStart),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("touchmove",this.onTouchMove),window.removeEventListener("mouseup",this.onMouseUp),window.removeEventListener("touchend",this.onTouchEnd)}setHandlers(){window.addEventListener("resize",this.onResize,!1),this.app.getSettings().useMouseEvents&&(this.distElement.addEventListener("mousedown",this.onMouseDown),this.distElement.addEventListener("touchstart",this.onTouchStart),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("touchmove",this.onTouchMove,{passive:!this.app.getSettings().mobileScrollSupport}),window.addEventListener("mouseup",this.onMouseUp),window.addEventListener("touchend",this.onTouchEnd))}getMousePos(e,s){let o=this.distElement.getBoundingClientRect();return{x:e-o.left,y:s-o.top}}checkTarget(e){return!this.app.getSettings().clickEventForward||!["a","button"].includes(e.tagName.toLowerCase())}}class E extends D{constructor(e,s,o,d){super(e,s,o),this.wrapper.insertAdjacentHTML("afterbegin",'<div class="stf__block"></div>'),this.distElement=e.querySelector(".stf__block"),this.items=d;for(let g of d)this.distElement.appendChild(g);this.setHandlers()}clear(){for(let e of this.items)this.parentElement.appendChild(e)}updateItems(e){this.removeHandlers(),this.distElement.innerHTML="";for(let s of e)this.distElement.appendChild(s);this.items=e,this.setHandlers()}update(){this.app.getRender().update()}}class S extends D{constructor(e,s,o){super(e,s,o),this.wrapper.innerHTML='<canvas class="stf__canvas"></canvas>',this.canvas=e.querySelectorAll("canvas")[0],this.distElement=this.canvas,this.resizeCanvas(),this.setHandlers()}resizeCanvas(){let e=getComputedStyle(this.canvas),s=parseInt(e.getPropertyValue("width"),10),o=parseInt(e.getPropertyValue("height"),10);this.canvas.width=s,this.canvas.height=o}getCanvas(){return this.canvas}update(){this.resizeCanvas(),this.app.getRender().update()}}class A extends M{constructor(e,s,o){super(e,s),this.outerShadow=null,this.innerShadow=null,this.hardShadow=null,this.hardInnerShadow=null,this.element=o,this.createShadows()}createShadows(){this.element.insertAdjacentHTML("beforeend",`<div class="stf__outerShadow"></div>
             <div class="stf__innerShadow"></div>
             <div class="stf__hardShadow"></div>
             <div class="stf__hardInnerShadow"></div>`),this.outerShadow=this.element.querySelector(".stf__outerShadow"),this.innerShadow=this.element.querySelector(".stf__innerShadow"),this.hardShadow=this.element.querySelector(".stf__hardShadow"),this.hardInnerShadow=this.element.querySelector(".stf__hardInnerShadow")}clearShadow(){super.clearShadow(),this.outerShadow.style.cssText="display: none",this.innerShadow.style.cssText="display: none",this.hardShadow.style.cssText="display: none",this.hardInnerShadow.style.cssText="display: none"}reload(){this.element.querySelector(".stf__outerShadow")||this.createShadows()}drawHardInnerShadow(){let e=this.getRect(),s=this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress,o=(100-s)*(2.5*e.pageWidth)/100+20;o>e.pageWidth&&(o=e.pageWidth);let d=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+5).toString(10)};
            width: ${o}px;
            height: ${e.height}px;
            background: linear-gradient(to right,
                rgba(0, 0, 0, ${this.shadow.opacity*s/100}) 5%,
                rgba(0, 0, 0, 0) 100%);
            left: ${e.left+e.width/2}px;
            transform-origin: 0 0;
        `;d+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0);":"transform: translate3d(0, 0, 0) rotateY(180deg);",this.hardInnerShadow.style.cssText=d}drawHardOuterShadow(){let e=this.getRect(),s=(100-(this.shadow.progress>100?200-this.shadow.progress:this.shadow.progress))*(2.5*e.pageWidth)/100+20;s>e.pageWidth&&(s=e.pageWidth);let o=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+4).toString(10)};
            width: ${s}px;
            height: ${e.height}px;
            background: linear-gradient(to left, rgba(0, 0, 0, ${this.shadow.opacity}) 5%, rgba(0, 0, 0, 0) 100%);
            left: ${e.left+e.width/2}px;
            transform-origin: 0 0;
        `;o+=this.getDirection()===0&&this.shadow.progress>100||this.getDirection()===1&&this.shadow.progress<=100?"transform: translate3d(0, 0, 0) rotateY(180deg);":"transform: translate3d(0, 0, 0);",this.hardShadow.style.cssText=o}drawInnerShadow(){let e=this.getRect(),s=3*this.shadow.width/4,o=this.getDirection()===0?s:0,d=this.getDirection()===0?"to left":"to right",g=this.convertToGlobal(this.shadow.pos),c=this.shadow.angle+3*Math.PI/2,p=[this.pageRect.topLeft,this.pageRect.topRight,this.pageRect.bottomRight,this.pageRect.bottomLeft],u="polygon( ";for(let C of p){let L=this.getDirection()===1?{x:-C.x+this.shadow.pos.x,y:C.y-this.shadow.pos.y}:{x:C.x-this.shadow.pos.x,y:C.y-this.shadow.pos.y};L=r.GetRotatedPoint(L,{x:o,y:100},c),u+=L.x+"px "+L.y+"px, "}u=u.slice(0,-2),u+=")";let w=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${s}px;
            height: ${2*e.height}px;
            background: linear-gradient(${d},
                rgba(0, 0, 0, ${this.shadow.opacity}) 5%,
                rgba(0, 0, 0, 0.05) 15%,
                rgba(0, 0, 0, ${this.shadow.opacity}) 35%,
                rgba(0, 0, 0, 0) 100%);
            transform-origin: ${o}px 100px;
            transform: translate3d(${g.x-o}px, ${g.y-100}px, 0) rotate(${c}rad);
            clip-path: ${u};
            -webkit-clip-path: ${u};
        `;this.innerShadow.style.cssText=w}drawOuterShadow(){let e=this.getRect(),s=this.convertToGlobal({x:this.shadow.pos.x,y:this.shadow.pos.y}),o=this.shadow.angle+3*Math.PI/2,d=this.getDirection()===1?this.shadow.width:0,g=this.getDirection()===0?"to right":"to left",c=[{x:0,y:0},{x:e.pageWidth,y:0},{x:e.pageWidth,y:e.height},{x:0,y:e.height}],p="polygon( ";for(let w of c)if(w!==null){let C=this.getDirection()===1?{x:-w.x+this.shadow.pos.x,y:w.y-this.shadow.pos.y}:{x:w.x-this.shadow.pos.x,y:w.y-this.shadow.pos.y};C=r.GetRotatedPoint(C,{x:d,y:100},o),p+=C.x+"px "+C.y+"px, "}p=p.slice(0,-2),p+=")";let u=`
            display: block;
            z-index: ${(this.getSettings().startZIndex+10).toString(10)};
            width: ${this.shadow.width}px;
            height: ${2*e.height}px;
            background: linear-gradient(${g}, rgba(0, 0, 0, ${this.shadow.opacity}), rgba(0, 0, 0, 0));
            transform-origin: ${d}px 100px;
            transform: translate3d(${s.x-d}px, ${s.y-100}px, 0) rotate(${o}rad);
            clip-path: ${p};
            -webkit-clip-path: ${p};
        `;this.outerShadow.style.cssText=u}drawLeftPage(){this.orientation!=="portrait"&&this.leftPage!==null&&(this.direction===1&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.leftPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.leftPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.leftPage.draw(this.flippingPage.getDrawingDensity())):this.leftPage.simpleDraw(0))}drawRightPage(){this.rightPage!==null&&(this.direction===0&&this.flippingPage!==null&&this.flippingPage.getDrawingDensity()==="hard"?(this.rightPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.rightPage.setHardDrawingAngle(180+this.flippingPage.getHardAngle()),this.rightPage.draw(this.flippingPage.getDrawingDensity())):this.rightPage.simpleDraw(1))}drawBottomPage(){if(this.bottomPage===null)return;let e=this.flippingPage!=null?this.flippingPage.getDrawingDensity():null;this.orientation==="portrait"&&this.direction===1||(this.bottomPage.getElement().style.zIndex=(this.getSettings().startZIndex+3).toString(10),this.bottomPage.draw(e))}drawFrame(){this.clear(),this.drawLeftPage(),this.drawRightPage(),this.drawBottomPage(),this.flippingPage!=null&&(this.flippingPage.getElement().style.zIndex=(this.getSettings().startZIndex+5).toString(10),this.flippingPage.draw()),this.shadow!=null&&this.flippingPage!==null&&(this.flippingPage.getDrawingDensity()==="soft"?(this.drawOuterShadow(),this.drawInnerShadow()):(this.drawHardOuterShadow(),this.drawHardInnerShadow()))}clear(){for(let e of this.app.getPageCollection().getPages())e!==this.leftPage&&e!==this.rightPage&&e!==this.flippingPage&&e!==this.bottomPage&&(e.getElement().style.cssText="display: none"),e.getTemporaryCopy()!==this.flippingPage&&e.hideTemporaryCopy()}update(){super.update(),this.rightPage!==null&&this.rightPage.setOrientation(1),this.leftPage!==null&&this.leftPage.setOrientation(0)}}class R{constructor(){this._default={startPage:0,size:"fixed",width:0,height:0,minWidth:0,maxWidth:0,minHeight:0,maxHeight:0,drawShadow:!0,flippingTime:1e3,usePortrait:!0,startZIndex:0,autoSize:!0,maxShadowOpacity:1,showCover:!1,mobileScrollSupport:!0,swipeDistance:30,clickEventForward:!0,useMouseEvents:!0,showPageCorners:!0,disableFlipByClick:!1}}getSettings(e){let s=this._default;if(Object.assign(s,e),s.size!=="stretch"&&s.size!=="fixed")throw new Error('Invalid size type. Available only "fixed" and "stretch" value');if(s.width<=0||s.height<=0)throw new Error("Invalid width or height");if(s.flippingTime<=0)throw new Error("Invalid flipping time");return s.size==="stretch"?(s.minWidth<=0&&(s.minWidth=100),s.maxWidth<s.minWidth&&(s.maxWidth=2e3),s.minHeight<=0&&(s.minHeight=100),s.maxHeight<s.minHeight&&(s.maxHeight=2e3)):(s.minWidth=s.width,s.maxWidth=s.width,s.minHeight=s.height,s.maxHeight=s.height),s}}(function(x,e){e===void 0&&(e={});var s=e.insertAt;if(x&&typeof document<"u"){var o=document.head||document.getElementsByTagName("head")[0],d=document.createElement("style");d.type="text/css",s==="top"&&o.firstChild?o.insertBefore(d,o.firstChild):o.appendChild(d),d.styleSheet?d.styleSheet.cssText=x:d.appendChild(document.createTextNode(x))}})(`.stf__parent {
  position: relative;
  display: block;
  box-sizing: border-box;
  transform: translateZ(0);

  -ms-touch-action: pan-y;
  touch-action: pan-y;
}

.sft__wrapper {
  position: relative;
  width: 100%;
  box-sizing: border-box;
}

.stf__parent canvas {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
}

.stf__block {
  position: absolute;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  perspective: 2000px;
}

.stf__item {
  display: none;
  position: absolute;
  transform-style: preserve-3d;
}

.stf__outerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__innerShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardShadow {
  position: absolute;
  left: 0;
  top: 0;
}

.stf__hardInnerShadow {
  position: absolute;
  left: 0;
  top: 0;
}`),t.PageFlip=class extends class{constructor(){this.events=new Map}on(x,e){return this.events.has(x)?this.events.get(x).push(e):this.events.set(x,[e]),this}off(x){this.events.delete(x)}trigger(x,e,s=null){if(this.events.has(x))for(let o of this.events.get(x))o({data:s,object:e})}}{constructor(x,e){super(),this.isUserTouch=!1,this.isUserMove=!1,this.setting=null,this.pages=null,this.setting=new R().getSettings(e),this.block=x}destroy(){this.ui.destroy(),this.block.remove()}update(){this.render.update(),this.pages.show()}loadFromImages(x){this.ui=new S(this.block,this,this.setting);let e=this.ui.getCanvas();this.render=new O(this,this.setting,e),this.flipController=new v(this.render,this),this.pages=new l(this,this.render,x),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}loadFromHTML(x){this.ui=new E(this.block,this,this.setting,x),this.render=new A(this,this.setting,this.ui.getDistElement()),this.flipController=new v(this.render,this),this.pages=new m(this,this.render,this.ui.getDistElement(),x),this.pages.load(),this.render.start(),this.pages.show(this.setting.startPage),setTimeout(()=>{this.ui.update(),this.trigger("init",this,{page:this.setting.startPage,mode:this.render.getOrientation()})},1)}updateFromImages(x){let e=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new l(this,this.render,x),this.pages.load(),this.pages.show(e),this.trigger("update",this,{page:e,mode:this.render.getOrientation()})}updateFromHtml(x){let e=this.pages.getCurrentPageIndex();this.pages.destroy(),this.pages=new m(this,this.render,this.ui.getDistElement(),x),this.pages.load(),this.ui.updateItems(x),this.render.reload(),this.pages.show(e),this.trigger("update",this,{page:e,mode:this.render.getOrientation()})}clear(){this.pages.destroy(),this.ui.clear()}turnToPrevPage(){this.pages.showPrev()}turnToNextPage(){this.pages.showNext()}turnToPage(x){this.pages.show(x)}flipNext(x="top"){this.flipController.flipNext(x)}flipPrev(x="top"){this.flipController.flipPrev(x)}flip(x,e="top"){this.flipController.flipToPage(x,e)}updateState(x){this.trigger("changeState",this,x)}updatePageIndex(x){this.trigger("flip",this,x)}updateOrientation(x){this.ui.setOrientationStyle(x),this.update(),this.trigger("changeOrientation",this,x)}getPageCount(){return this.pages.getPageCount()}getCurrentPageIndex(){return this.pages.getCurrentPageIndex()}getPage(x){return this.pages.getPage(x)}getRender(){return this.render}getFlipController(){return this.flipController}getOrientation(){return this.render.getOrientation()}getBoundsRect(){return this.render.getRect()}getSettings(){return this.setting}getUI(){return this.ui}getState(){return this.flipController.getState()}getPageCollection(){return this.pages}startUserTouch(x){this.mousePosition=x,this.isUserTouch=!0,this.isUserMove=!1}userMove(x,e){this.isUserTouch||e||!this.setting.showPageCorners?this.isUserTouch&&r.GetDistanceBetweenTwoPoint(this.mousePosition,x)>5&&(this.isUserMove=!0,this.flipController.fold(x)):this.flipController.showCorner(x)}userStop(x,e=!1){this.isUserTouch&&(this.isUserTouch=!1,e||(this.isUserMove?this.flipController.stopMove():this.flipController.flip(x)))}},Object.defineProperty(t,"__esModule",{value:!0})}))});var Ea=/swiftshader|llvmpipe|softpipe|software|basic render/i;function Aa(){try{let t=document.createElement("canvas").getContext("webgl");if(!t)return"none";let a=t.getExtension("WEBGL_debug_renderer_info"),i=a?t.getParameter(a.UNMASKED_RENDERER_WEBGL):"";return t.getExtension("WEBGL_lose_context")?.loseContext(),String(i)}catch{return""}}function Ia(){if(new URLSearchParams(location.search).has("ligero"))return!0;let t=navigator.deviceMemory!==void 0&&navigator.deviceMemory<=2,a=Aa();return t||a==="none"||Ea.test(a)}function te(){let t=Ia();return document.documentElement.classList.toggle("is-lite",t),t}var y=(t,a=document)=>a.querySelector(t),$=(t,a=document)=>[...a.querySelectorAll(t)],f=t=>String(t).replace(/[&<>"']/g,a=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[a]);function J(t){let a=document.createElement("template");return a.innerHTML=t.trim(),a.content.firstElementChild}var W=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;function Y(t,a){t.classList.remove(a),t.offsetWidth,t.classList.add(a)}var Rt=()=>document.body.dataset.root||".",Ta=()=>Rt()!==".",q=t=>`${Rt()}/assets/img/${t}`,I=t=>t==="index.html"?`${Rt()}/index.html`:Ta()?t:`pages/${t}`,ft=()=>document.body.dataset.page||"inicio";var F={rescate:"https://www.tympsa.com.mx/wp-content/uploads/2021/10/gruacG1.jpg",wheelLift:"https://cdn.dealerspike.com/imglib/v1/800x600/imglib/Assets/Inventory/A2/1A/A21AD3DC-CF6E-4999-9BE3-E45C7FF5EB6D.jpg",plataforma:"https://media.cylex-polska.pl/companies/1147/0017/images/POMOC-DROGOWA-WYNAJEM-AUTOLAWETY-WROCLAW_903704_large.jpg",underlift:"https://reedcitytowing.com/img/towing-clare-mi-l.jpg",accesorio1:"https://cdn.snsimg.carview.co.jp/minkara/note/000/006/074/814/6074814/p4.jpg?ct=84fb7e3ebcf3",accesorio2:"https://www.fiault.com/gallery/options/huit-cales-de-blocages-reglables-sur-le-plancher-4-tp-4-vl-large.jpeg",accesorio3:"https://img.zips.com/i/public/0007649_in-the-ditch-individual-speed-chock_900.jpeg",accesorio4:"https://cdn.fastpixel.io/fp/ret_img%2Bv_9884%2Bw_1182%2Bh_788%2Bq_glossy%2Bto_webp/knobhilltowing.com%2Fwp-content%2Fuploads%2F2025%2F06%2Fimage_4748454fa0be45f593c5a6ce7f908751.jpeg"},ee={"hero-1":{file:"inicio/hero-1.jpg",alt:"Gr\xFAa de rescate trabajando en carretera",fallback:F.rescate},"hero-2":{file:"inicio/hero-2.jpg",alt:"Gr\xFAa wheel lift remolcando un auto",fallback:F.wheelLift},"hero-3":{file:"inicio/hero-3.jpg",alt:"Gr\xFAa de plataforma con un auto arriba",fallback:F.plataforma},"linea-plataformas":{file:"lineas/plataformas.jpg",alt:"Gr\xFAa de plataforma",fallback:F.plataforma},"linea-rescate":{file:"lineas/rescate.jpg",alt:"Gr\xFAa de rescate con pluma",fallback:F.rescate},"linea-wheel-lift":{file:"lineas/wheel-lift.jpg",alt:"Gr\xFAa wheel lift",fallback:F.wheelLift},"linea-underlift":{file:"lineas/underlift.jpg",alt:"Gr\xFAa underlift",fallback:F.underlift},"acc-cadena-grado-80":{file:"accesorios/cadena-grado-80.jpg",alt:"Cadena grado 80",fallback:F.accesorio1},"acc-gancho-arrastre":{file:"accesorios/gancho-arrastre.jpg",alt:"Gancho de arrastre",fallback:F.accesorio2},"acc-malacate-electrico":{file:"accesorios/malacate-electrico.jpg",alt:"Malacate el\xE9ctrico",fallback:F.accesorio3},"acc-barra-luces-led":{file:"accesorios/barra-luces-led.jpg",alt:"Barra de luces LED",fallback:F.accesorio4},"acc-eslinga-remolque":{file:"accesorios/eslinga-remolque.jpg",alt:"Eslinga de remolque",fallback:F.accesorio1},"acc-cunas-rueda":{file:"accesorios/cunas-rueda.jpg",alt:"Cu\xF1as de rueda",fallback:F.accesorio2},"acc-cadena-seguridad":{file:"accesorios/cadena-seguridad.jpg",alt:"Cadena de seguridad",fallback:F.accesorio3},"acc-kit-senalizacion":{file:"accesorios/kit-senalizacion.jpg",alt:"Kit de se\xF1alizaci\xF3n",fallback:F.accesorio4},"pagina-nosotros":{file:"paginas/nosotros.jpg",alt:"",fallback:F.rescate},"pagina-reparaciones":{file:"paginas/reparaciones.jpg",alt:"",fallback:F.underlift},"pagina-contacto":{file:"paginas/contacto.jpg",alt:"",fallback:F.plataforma},...Object.fromEntries([2006,2009,2012,2015,2018,2021,2024,2026].map(t=>[`historia-${t}`,{file:`historia/${t}.jpg`,alt:`Industrias Invictus Crane en ${t}`,fallback:`historia/${t}.svg`,localFallback:!0}]))};var ae=t=>{let a=ee[t];return a?{src:q(`fotos/${a.file}`),fallback:a.fallback?a.localFallback?q(a.fallback):a.fallback:"",alt:a.alt}:null};function Z(t,{alt:a}={}){let i=ae(t);return i?`src="${i.src}" data-fallback-src="${i.fallback}" alt="${f(a??i.alt)}"`:'alt=""'}function se(t){let a=t.dataset.fallbackSrc;a?(t.removeAttribute("data-fallback-src"),t.src=a):t.classList.add("is-missing")}function ie(){document.addEventListener("error",t=>{t.target.tagName==="IMG"&&se(t.target)},!0)}function oe(){$("img[data-photo]").forEach(t=>{let a=ae(t.dataset.photo);a&&(t.dataset.fallbackSrc=a.fallback,t.hasAttribute("alt")||(t.alt=a.alt),t.src=a.src)}),$("img").forEach(t=>{t.complete&&t.getAttribute("src")&&!t.naturalWidth&&se(t)})}function st(t,a){try{let i=localStorage.getItem(t);return i===null?a:JSON.parse(i)}catch(i){return console.warn(`No se pudo leer el dato local "${t}".`,i),a}}function dt(t,a){try{return localStorage.setItem(t,JSON.stringify(a)),!0}catch(i){return console.error(`No se pudo guardar el dato local "${t}".`,i),!1}}function vt(t){try{localStorage.removeItem(t)}catch{}}function Ra(t){let a=t.querySelector(":scope > .toast-stack");return a||(a=J('<div class="toast-stack" aria-live="polite"></div>'),t.append(a)),a}function B(t,{action:a,duration:i=3200,tone:n="default",thumb:l=""}={}){let h=J(`
        <div class="toast" data-tone="${n}">
            ${l||`<span class="toast-icon">${n==="success"?"\u2713":n==="error"?"!":"i"}</span>`}
            <span class="min-w-0">${f(t)}</span>
            ${a?`<button type="button" class="toast-action">${f(a.label)}</button>`:""}
        </div>`);a&&h.querySelector("button").addEventListener("click",()=>{a.onClick(),m()}),Ra(document.fullscreenElement||document.body).append(h);function m(){h.classList.add("is-leaving"),h.addEventListener("animationend",()=>h.remove(),{once:!0})}setTimeout(m,i)}var Ht="inv_us",wt="inv_u",ht=()=>st(wt,null),ne=t=>[...t].map(a=>a.toString(16).padStart(2,"0")).join("");async function re(t,a){if(!window.crypto?.subtle)throw new Error("Web Crypto no est\xE1 disponible en este contexto.");let i=new TextEncoder,n=await crypto.subtle.importKey("raw",i.encode(t),"PBKDF2",!1,["deriveBits"]),l=await crypto.subtle.deriveBits({name:"PBKDF2",salt:i.encode(a),iterations:12e4,hash:"SHA-256"},n,256);return ne(new Uint8Array(l))}function Ha(){let t=new Uint8Array(16);return crypto.getRandomValues(t),ne(t)}var le=t=>({nombre:t.nombre,apellidos:t.apellidos||"",correo:t.correo}),Da=()=>new URLSearchParams(location.search).get("next")||"accesorios.html",ce=()=>setTimeout(()=>{location.href=Da()},900);async function _a(t){let a=Object.fromEntries(new FormData(t)),i=st(Ht,[]),n=i.findIndex(h=>h.correo?.toLowerCase()===a.correo.toLowerCase());if(n>=0&&i[n].passwordHash)return B("Ese correo ya tiene una cuenta",{tone:"error"});if(a.password.length<8)return B("La contrase\xF1a debe tener al menos 8 caracteres",{tone:"error"});let l=Ha(),r={nombre:a.nombre,apellidos:a.apellidos||"",correo:a.correo,telefono:a.telefono,passwordSalt:l,passwordHash:await re(a.password,l)};if(n>=0?i[n]=r:i.push(r),!dt(Ht,i)||!dt(wt,le(r)))return B("El navegador bloque\xF3 el almacenamiento local.",{tone:"error"});B("\xA1Cuenta creada!",{tone:"success"}),ce()}async function Fa(t){let a=Object.fromEntries(new FormData(t)),i=st(Ht,[]).find(n=>n.correo?.toLowerCase()===a.correo.toLowerCase());if(!i)return B("No encontramos esa cuenta. Crea una primero.",{tone:"error"});if(!i.passwordSalt||!i.passwordHash)return B("Esta cuenta antigua no tiene contrase\xF1a guardada. Reg\xEDstrate nuevamente.",{tone:"error"});if(await re(a.password,i.passwordSalt)!==i.passwordHash)return t.classList.remove("animate-shake"),t.offsetWidth,t.classList.add("animate-shake"),B("La contrase\xF1a es incorrecta.",{tone:"error"});dt(wt,le(i)),B("Sesi\xF3n iniciada",{tone:"success"}),ce()}function de(){let t=$("[data-auth-tab]"),a=y("#authTabIndicator"),i=r=>{t.forEach((h,m)=>{let b=h.dataset.authTab===r;h.setAttribute("aria-selected",String(b)),y(`#${h.getAttribute("aria-controls")}`).hidden=!b,b&&a&&(a.style.transform=`translateX(${m*100}%)`)})};t.forEach(r=>r.addEventListener("click",()=>i(r.dataset.authTab))),i(location.hash==="#login"?"login":"register");let n=ht();if(n){y("#authForms").hidden=!0;let r=y("#authWelcome");r.hidden=!1,y("[data-user-name]",r).textContent=`Hola, ${n.nombre} ${n.apellidos||""}`,y("[data-user-email]",r).textContent=n.correo,y("#logoutBtn").addEventListener("click",()=>{vt(wt),location.reload()})}let l=r=>async h=>{h.preventDefault();let m=y("button[type=submit]",h.target);m.disabled=!0;try{await r(h.target)}catch(b){console.error(b),B("No se pudo validar la cuenta. Abre el proyecto con localhost o HTTPS.",{tone:"error"})}finally{m.disabled=!1}};y("#registerForm").addEventListener("submit",l(_a)),y("#loginForm").addEventListener("submit",l(Fa))}var H=(t,{viewBox:a="0 0 24 24",fill:i=!0}={})=>`<svg viewBox="${a}" aria-hidden="true" class="size-full" ${i?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'}>${t}</svg>`,P={facebook:H('<path d="M14 8h2.5V4.5H14C11.5 4.5 10 6 10 8.5v2H7.5V14H10v6.5h3.5V14H16l.5-3.5h-3V9c0-.6.4-1 1.5-1z"/>'),instagram:H('<path fill-rule="evenodd" d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm5 2.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>'),tiktok:H('<path d="M16 3c.3 2 1.6 3.4 3.5 3.6v2.8c-1.3 0-2.5-.4-3.5-1.1V14a5 5 0 1 1-5-5v2.8a2.2 2.2 0 1 0 2.2 2.2V3z"/>'),whatsapp:H('<path d="M16 3.2A12.6 12.6 0 0 0 5.2 22.3L3.5 28.8l6.7-1.7A12.7 12.7 0 1 0 16 3.2zm0 22.9c-1.9 0-3.7-.5-5.3-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.4 10.4 0 1 1 16 26.1zm5.7-7.8c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.2-.7.1a8.4 8.4 0 0 1-2.5-1.5 9.3 9.3 0 0 1-1.7-2.1c-.2-.3 0-.5.1-.7l.5-.5.3-.6c.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.2 1.2-1.2 2.9 1.2 3.3 1.4 3.5 2.4 3.7 5.8 5.1c.8.3 1.4.5 1.9.6.8.2 1.5.2 2 .1.6-.1 1.8-.7 2-1.4s.3-1.3.2-1.4-.3-.3-.6-.5z"/>',{viewBox:"0 0 32 32"}),cart:H('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>',{fill:!1}),user:H('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',{fill:!1}),close:H('<path d="M6 6l12 12M18 6 6 18"/>',{fill:!1}),menu:H('<path d="M4 7h16M4 12h16M4 17h16"/>',{fill:!1}),chevronLeft:H('<path d="m15 5-7 7 7 7"/>',{fill:!1}),chevronRight:H('<path d="m9 5 7 7-7 7"/>',{fill:!1}),chevronDown:H('<path d="m6 9 6 6 6-6"/>',{fill:!1}),arrowRight:H('<path d="M5 12h14m-6-6 6 6-6 6"/>',{fill:!1}),plus:H('<path d="M12 5v14M5 12h14"/>',{fill:!1}),minus:H('<path d="M5 12h14"/>',{fill:!1}),trash:H('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',{fill:!1}),expand:H('<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',{fill:!1}),list:H('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',{fill:!1}),check:H('<path d="m5 12 5 5L20 7"/>',{fill:!1}),bag:H('<path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',{fill:!1}),pin:H('<path d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',{fill:!1}),route:H('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>',{fill:!1})},V=t=>H(t.replace(/<(path|rect|circle) /g,'<$1 pathLength="1" '),{fill:!1}),lt={weight:V('<path d="M9 8.5a3 3 0 1 1 6 0"/><path d="M6.8 8.5h10.4l2.8 11.5H4z"/><path d="M10 12.5h4M12 12.5V17"/>'),length:V('<path d="M3 7v10M21 7v10"/><path d="M6 12h12"/><path d="M8.5 9.5 6 12l2.5 2.5M15.5 9.5 18 12l-2.5 2.5"/>'),winch:V('<rect x="2.5" y="5" width="10" height="9" rx="2"/><path d="M5.8 5v9M9.2 5v9"/><path d="M12.5 7H19v6"/><path d="M19 13v2a2.2 2.2 0 1 1-2.2 2.2"/><path d="M2.5 18h10"/>'),boom:V('<path d="M3 20h12"/><path d="M5 20v-3h7v3"/><path d="M8 17 19 6"/><path d="M19 6v7"/><path d="M19 13v1.5a1.8 1.8 0 1 1-1.8 1.8"/><path d="M10.5 17 14 11"/>'),reach:V('<path d="M4 20 18 6"/><path d="M12 5h7v7"/><path d="M4 14v6h6"/>'),wheel:V('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3"/><path d="M12 3.5V9M12 15v5.5M3.5 12H9M15 12h5.5"/>'),tow:V('<path d="M3 16.5V13l2.4-4.5h7.8l3.6 4.5H21v3.5"/><path d="M5.5 12.8h10.3"/><circle cx="7.2" cy="16.8" r="2"/><circle cx="16.8" cy="16.8" r="2"/>'),lift:V('<path d="M2.5 18.5h11l3-5h5"/><path d="M4 15h7"/><path d="M12 3.5v8M8.8 6.7 12 3.5l3.2 3.2"/>'),extension:V('<rect x="2.5" y="9" width="7" height="6" rx="1"/><rect x="9.5" y="10.3" width="6" height="3.4" rx=".8"/><path d="M15.5 12h6M18.8 9.3 21.5 12l-2.7 2.7"/>'),flatbed:V('<path d="M2 14.5h12.5"/><path d="M3.5 14.5 6 10.5h8.5v4"/><path d="M14.5 14.5V8.5h4.2l3 3.6v2.4"/><circle cx="6.5" cy="17" r="2"/><circle cx="17.5" cy="17" r="2"/>'),chain:V('<path d="M10.6 7.2 12.2 5.6a3.8 3.8 0 0 1 5.4 5.4L16 12.6"/><path d="M13.4 16.8 11.8 18.4a3.8 3.8 0 0 1-5.4-5.4L8 11.4"/><path d="M9.5 14.5l5-5"/>'),cone:V('<path d="M9.8 4h4.4l4.3 15H5.5z"/><path d="M8.4 9h7.2M7 14h10"/><path d="M3 19.5h18"/>'),tag:V('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),cart:V('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>')};var he=[{id:"plataformas",label:"Plataformas",href:"plataformas.html"},{id:"rescate",label:"Rescate",href:"rescate.html"},{id:"wheel-lift",label:"Wheel Lift",href:"wheel-lift.html"},{id:"underlift",label:"Underlift",href:"underlift.html"}],Dt=[{id:"inicio",label:"Inicio",href:"index.html"},{id:"nosotros",label:"Nosotros",href:"nosotros.html"},{id:"equipos",label:"Equipos",children:he},{id:"accesorios",label:"Accesorios",href:"accesorios.html"},{id:"catalogo",label:"Cat\xE1logo",href:"catalogo.html"},{id:"reparaciones",label:"Reparaciones",href:"reparaciones.html"},{id:"contacto",label:"Contacto",href:"contacto.html"}],pe=[{label:"Inicio",href:"index.html"},{label:"Nosotros",href:"nosotros.html"},...he,{label:"Accesorios",href:"accesorios.html"},{label:"Cat\xE1logo",href:"catalogo.html"},{label:"Reparaciones",href:"reparaciones.html"},{label:"Contacto",href:"contacto.html"},{label:"Mi cuenta",href:"cuenta.html"}],$t=[{icon:"facebook",label:"Facebook",href:"https://www.facebook.com/"},{icon:"instagram",label:"Instagram",href:"https://www.instagram.com/"},{icon:"tiktok",label:"TikTok",href:"https://www.tiktok.com/"}];var Oa=t=>t.id===ft()||t.children?.some(a=>a.id===ft());function za(t){let a=Oa(t);return t.children?`
        <div class="group relative">
            <button type="button" class="nav-link ${a?"is-active":""} flex items-center gap-1" aria-haspopup="true">
                ${t.label}<span class="size-4 transition-transform duration-300 group-hover:rotate-180 group-focus-within:rotate-180">${P.chevronDown}</span>
            </button>
            <div class="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 translate-y-3 pt-3 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                <div class="dropdown-panel">
                    ${t.children.map((i,n)=>`
                        <a href="${I(i.href)}" style="--i:${n}" class="dropdown-link ${i.id===ft()?"is-active":""}">
                            <span class="dropdown-led"></span>${i.label}
                        </a>`).join("")}
                </div>
            </div>
        </div>`:`<a href="${I(t.href)}" class="nav-link ${a?"is-active":""}" ${a?'aria-current="page"':""}>${t.label}</a>`}function Na(){return Dt.flatMap(t=>t.children??[t]).map((t,a)=>`<a href="${I(t.href)}" style="--i:${a}" class="mobile-link ${t.id===ft()?"is-active":""}">${t.label}</a>`).join("")}var ge=(t="size-9",a="size-[1.1rem]")=>$t.map(i=>`
    <a href="${i.href}" target="_blank" rel="noopener" aria-label="${i.label}" title="${i.label}" class="social-btn is-${i.icon} ${t}"><span class="${a}">${P[i.icon]}</span></a>`).join("");function ue(){let t=ht(),a=t?`Hola, ${f(t.nombre)}`:"Iniciar sesi\xF3n / Registrarse",i=J(`
        <header id="siteHeader" class="site-header">
            <div class="mx-auto flex h-full max-w-[96rem] items-center gap-4 px-4 sm:px-6 lg:px-8">
                <a href="${I("index.html")}" class="header-logo" aria-label="Industrias Invictus Crane - Inicio">
                    <img src="${q("logo-invictus.png")}" alt="Industrias Invictus Crane" width="1320" height="318">
                </a>
                <nav class="ml-3 hidden items-center gap-0.5 xl:flex 2xl:ml-6" aria-label="Principal">
                    ${Dt.map(za).join("")}
                </nav>
                <div class="ml-auto flex items-center gap-2">
                    <div class="header-social hidden items-center gap-1.5 sm:flex" role="group" aria-label="Redes sociales">${ge()}</div>
                    <span class="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden="true"></span>
                    <a href="${I("cuenta.html")}" class="account-btn" title="${a}">
                        <span class="size-5">${P.user}</span><span class="hidden max-w-48 truncate 2xl:inline">${a}</span>
                    </a>
                    <button type="button" class="cart-btn" data-cart-open aria-label="Abrir carrito de compra">
                        <span class="size-5">${P.cart}</span>
                        <span class="cart-badge" data-cart-count="0">0</span>
                    </button>
                    <button type="button" id="menuToggle" class="menu-toggle xl:hidden" aria-label="Men\xFA" aria-expanded="false" aria-controls="mobileMenu">
                        <span class="size-6">${P.menu}</span>
                    </button>
                </div>
            </div>
            <div class="header-led" aria-hidden="true"><span id="scrollProgress"></span></div>
        </header>`),n=J(`
        <div id="mobileMenu" class="mobile-menu" aria-hidden="true">
            <div data-ambient data-sparks="6" data-dots="10" class="absolute inset-0 -z-10"></div>
            <nav class="flex flex-col gap-1" aria-label="Men\xFA m\xF3vil">${Na()}</nav>
            <a href="${I("cuenta.html")}" class="mobile-link truncate !text-2xl" style="--i:11">${a}</a>
            <div class="mt-6 flex gap-2">${ge("size-11","size-5")}</div>
        </div>`);document.body.prepend(i,n),Wa(i,n)}function Wa(t,a){let i=y("#scrollProgress",t),n=0,l=0,r=()=>{n=document.documentElement.scrollHeight-innerHeight},h=()=>{l=0,t.classList.toggle("is-scrolled",scrollY>40),i.style.transform=`scaleX(${n>0?Math.min(1,scrollY/n):0})`},m=()=>{l||(l=requestAnimationFrame(h))};new ResizeObserver(()=>{r(),m()}).observe(document.body),addEventListener("resize",r,{passive:!0}),addEventListener("scroll",m,{passive:!0}),r(),h();let b=y("#menuToggle",t),v=M=>{a.classList.toggle("is-open",M),a.setAttribute("aria-hidden",String(!M)),b.setAttribute("aria-expanded",String(M)),b.innerHTML=`<span class="size-6">${M?P.close:P.menu}</span>`,document.documentElement.classList.toggle("overflow-hidden",M)};b.addEventListener("click",()=>v(!a.classList.contains("is-open"))),$("a",a).forEach(M=>M.addEventListener("click",()=>v(!1))),addEventListener("keydown",M=>M.key==="Escape"&&v(!1))}var qa="520000000000",j=(t="")=>`https://wa.me/${qa}${t?`?text=${encodeURIComponent(t)}`:""}`,Mt=(t,a)=>j(`Hola, quiero cotizar la gr\xFAa ${t} (${a})`);function me(){let t=J(`
        <footer class="relative isolate overflow-hidden bg-ink-950 text-ink-300">
            <div class="led-strip h-0.5"></div>
            <div data-ambient data-sparks="6" data-dots="10" class="absolute inset-0 -z-10"></div>
            <div class="pointer-events-none absolute -right-40 -top-40 -z-10 size-[30rem] rounded-full bg-brand-600/15 blur-3xl"></div>
            <div class="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div class="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
                    <div data-reveal>
                        <img src="${q("logo-invictus.png")}" alt="Industrias Invictus Crane" width="1320" height="318" loading="lazy" class="h-14 w-auto rounded-lg [animation:logo-glow_4s_ease-in-out_infinite]">
                        <p class="mt-4 max-w-md leading-relaxed">Industrias Invictus Crane es una empresa orgullosamente mexicana dedicada al dise\xF1o y fabricaci\xF3n de gr\xFAas de arrastre y salvamento.</p>
                        <p class="mt-3 max-w-md leading-relaxed">Nuestro compromiso es ofrecer equipos de alto desempe\xF1o, componentes certificados y un servicio profesional a cada cliente.</p>
                        <h4 class="footer-title mt-8 !mb-3">S\xEDguenos</h4>
                        <div class="flex flex-wrap gap-2.5">
                            ${$t.map(i=>`
                                <a href="${i.href}" target="_blank" rel="noopener" class="footer-social is-${i.icon}">
                                    <span class="footer-social-icon"><span class="size-5">${P[i.icon]}</span></span>${i.label}
                                </a>`).join("")}
                        </div>
                    </div>
                    <nav data-reveal style="--reveal-delay:120ms" aria-label="Mapa del sitio">
                        <h4 class="footer-title">Mapa del sitio</h4>
                        <ul class="grid grid-cols-2 gap-x-6 gap-y-2.5">
                            ${pe.map(i=>`<li><a class="footer-link" href="${I(i.href)}">${i.label}</a></li>`).join("")}
                        </ul>
                    </nav>
                    <div data-reveal style="--reveal-delay:240ms">
                        <h4 class="footer-title">Hablemos</h4>
                        <a href="${j()}" target="_blank" rel="noopener" class="btn btn-primary">
                            <span class="size-5">${P.whatsapp}</span> Escr\xEDbenos por WhatsApp
                        </a>
                        <img src="${q("logo-comunicaciones.png")}" alt="Comunicaciones - Secretar\xEDa de Infraestructura, Comunicaciones y Transportes" loading="lazy" class="mt-8 w-full max-w-xs drop-shadow-[0_0_12px_rgb(255_255_255/0.08)]">
                    </div>
                </div>
            </div>
            <p class="border-t border-neon/10 py-6 text-center font-display text-sm uppercase tracking-[0.3em] text-neon/80 [text-shadow:0_0_10px_rgb(61_255_180/.5)]">Industrias Invictus Crane - 2026</p>
        </footer>
        `),a=J(`
        <a class="wa-float" target="_blank" rel="noopener" href="${j()}" aria-label="WhatsApp">
            <span class="size-7">${P.whatsapp}</span>
        </a>`);document.body.append(t,a)}var Ba=new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN",maximumFractionDigits:0}),z=t=>Ba.format(t).replace(/\s?MXN/,"");function _t(t){let a=/^([\d.,]+)\s*(.*)$/.exec(t);return a?{number:a[1],unit:a[2]}:{number:"",unit:t}}function Ft(t){let a=t.map(_t),i=h=>Number(h.number.replace(/,/g,"")),n=[...a].sort((h,m)=>i(h)-i(m)),[l,r]=[n[0],n[n.length-1]];return!l.number||l.unit!==r.unit?t.join(" \xB7 "):l.number===r.number?`${l.number} ${l.unit}`:`${l.number} \u2013 ${r.number} ${l.unit}`}var G={plataformas:{id:"plataformas",name:"Plataformas",page:"plataformas.html",icon:"flatbed",tagline:"Plataformas de aluminio y acero para auxilio vial, veh\xEDculos utilitarios y carga pesada.",photo:"linea-plataformas",specLabels:["Capacidad de plataforma","Longitud","Capacidad de winch"],specIcons:["weight","length","winch"],models:[{model:"IP-22",description:"Plataforma de aluminio ligera para auxilio vial urbano.",specs:["5 toneladas","19 pies","9,000 lbs"]},{model:"IP-30",description:"Plataforma reforzada para veh\xEDculos utilitarios.",specs:["8 toneladas","21 pies","12,000 lbs"]},{model:"IP-40",description:"Plataforma de acero para carga media.",specs:["12 toneladas","24 pies","15,000 lbs"]},{model:"IP-55",description:"Plataforma pesada con inclinaci\xF3n hidr\xE1ulica.",specs:["18 toneladas","26 pies","20,000 lbs"]}]},rescate:{id:"rescate",name:"Rescate",page:"rescate.html",icon:"boom",tagline:"Gr\xFAas con pluma telesc\xF3pica para rescate carretero y salvamento pesado.",photo:"linea-rescate",specLabels:["Capacidad de pluma","Alcance de pluma","Capacidad de winch"],specIcons:["boom","reach","winch"],models:[{model:"IR-25",description:"Gr\xFAa de rescate compacta para maniobras en espacios reducidos.",specs:["25 toneladas","5.5 m","12,000 lbs"]},{model:"IR-35",description:"Pluma telesc\xF3pica para rescate carretero.",specs:["35 toneladas","6.5 m","16,000 lbs"]},{model:"IR-50",description:"Rescate pesado con doble winch.",specs:["50 toneladas","7.5 m","25,000 lbs"]},{model:"IR-75",description:"Serie pesada para salvamento extremo.",specs:["75 toneladas","9 m","35,000 lbs"]}]},"wheel-lift":{id:"wheel-lift",name:"Wheel Lift",page:"wheel-lift.html",icon:"wheel",tagline:"Wheel lift para autos, SUV y camionetas, de uso ligero a comercial.",photo:"linea-wheel-lift",specLabels:["Capacidad wheel lift","Peso remolcable","Capacidad de winch"],specIcons:["wheel","tow","winch"],models:[{model:"WL-35",description:"Wheel lift ligero para autos y SUV.",specs:["3,500 lbs","2.5 toneladas","8,000 lbs"]},{model:"WL-50",description:"Wheel lift de uso comercial.",specs:["5,000 lbs","4 toneladas","10,000 lbs"]},{model:"WL-70",description:"Wheel lift reforzado para camionetas pesadas.",specs:["7,000 lbs","6 toneladas","12,000 lbs"]}]},underlift:{id:"underlift",name:"Underlift",page:"underlift.html",icon:"lift",tagline:"Underlift para arrastrar sin da\xF1ar el veh\xEDculo, de unidades medianas a autobuses y tractocamiones.",photo:"linea-underlift",specLabels:["Capacidad underlift","Extensi\xF3n","Capacidad de winch"],specIcons:["lift","extension","winch"],models:[{model:"UL-40",description:"Underlift para arrastre sin da\xF1ar el veh\xEDculo.",specs:["4 toneladas","1.8 m","10,000 lbs"]},{model:"UL-60",description:"Underlift para unidades de carga media.",specs:["6 toneladas","2.2 m","14,000 lbs"]},{model:"UL-85",description:"Underlift pesado para autobuses y tractocamiones.",specs:["8.5 toneladas","2.8 m","20,000 lbs"]}]}},it=["plataformas","rescate","wheel-lift","underlift"],St=[{id:"amarre",name:"Amarre y arrastre",icon:"chain",tagline:"Cadenas, ganchos y eslingas para asegurar cada maniobra."},{id:"equipo",name:"Malacates y luces",icon:"winch",tagline:"Equipo que se instala en la gr\xFAa para jalar y para ser visto."},{id:"seguridad",name:"Seguridad vial",icon:"cone",tagline:"Lo necesario para trabajar con seguridad a pie de carretera."}],tt=[{id:"cadena-grado-80",category:"amarre",name:"Cadena grado 80",description:'Cadena de amarre de 3/8" para carga pesada.',price:1850},{id:"gancho-arrastre",category:"amarre",name:"Gancho de arrastre",description:"Gancho forjado con seguro, 10 ton.",price:980},{id:"malacate-electrico",category:"equipo",name:"Malacate el\xE9ctrico",description:"Malacate 12V de 9,000 lbs con control.",price:12400},{id:"barra-luces-led",category:"equipo",name:"Barra de luces LED",description:'Barra \xE1mbar de emergencia, 48".',price:3200},{id:"eslinga-remolque",category:"amarre",name:"Eslinga de remolque",description:"Eslinga de poli\xE9ster de 8 m, 5 ton.",price:760},{id:"cunas-rueda",category:"seguridad",name:"Cu\xF1as de rueda",description:"Par de cu\xF1as antideslizantes.",price:540},{id:"cadena-seguridad",category:"amarre",name:"Cadena de seguridad",description:"Juego de 2 cadenas con ganchos.",price:1450},{id:"kit-senalizacion",category:"seguridad",name:"Kit de se\xF1alizaci\xF3n",description:"Conos, banderas y tri\xE1ngulos.",price:890}].map(t=>({...t,photo:`acc-${t.id}`})),pt=t=>tt.find(a=>a.id===t);var Pt="inv_cart",fe="inv_c",Va=99,Ot=new EventTarget;function ja(){let t=st(fe,null);if(!Array.isArray(t))return null;vt(fe);let a=new Map;return t.filter(i=>tt[i]).forEach(i=>{let{id:n}=tt[i];a.set(n,(a.get(n)||0)+1)}),[...a].map(([i,n])=>({id:i,qty:n}))}function zt(t){return Array.isArray(t)?t.filter(a=>pt(a?.id)&&Number.isInteger(a.qty)&&a.qty>0).map(a=>({id:a.id,qty:Math.min(a.qty,Va)})):[]}var et=zt(st(Pt,null)??ja());function Lt(t,a={}){et=zt(t),dt(Pt,et),Ot.dispatchEvent(new CustomEvent("change",{detail:a}))}function Ua(){return et.map(t=>{let a=pt(t.id);return{...a,qty:t.qty,subtotal:a.price*t.qty}})}function gt(){let t=Ua();return{items:t,count:t.reduce((a,i)=>a+i.qty,0),total:t.reduce((a,i)=>a+i.subtotal,0)}}function xe(t,a=1){if(!pt(t))return;let i=et.find(n=>n.id===t);Lt(i?et.map(n=>n.id===t?{...n,qty:n.qty+a}:n):[...et,{id:t,qty:a}],{type:"add",id:t})}function be(t,a){Lt(a<=0?et.filter(i=>i.id!==t):et.map(i=>i.id===t?{...i,qty:a}:i),{type:"update",id:t})}var ye=t=>Lt(et.filter(a=>a.id!==t),{type:"remove",id:t}),Nt=()=>Lt([],{type:"clear"});function ve(t){Ot.addEventListener("change",a=>t(gt(),a.detail))}addEventListener("storage",t=>{t.key===Pt&&(et=zt(st(Pt,[])),Ot.dispatchEvent(new CustomEvent("change",{detail:{type:"sync"}})))});var we=["var(--color-neon)","var(--color-brand-400)","var(--color-amber-400)","#ffffff"];function $e(t,a,{count:i=14,reach:n=70}={}){let l=document.fullscreenElement||document.body,r=document.createElement("div");r.className="burst",r.setAttribute("aria-hidden","true"),r.style.left=`${t}px`,r.style.top=`${a}px`,r.innerHTML='<span class="burst-ring"></span><span class="burst-ring" style="--d:.15s"></span>'+Array.from({length:i},(h,m)=>{let b=360/i*m+Math.random()*14,v=n*(.7+Math.random()*.6);return`<span class="burst-dot" style="--a:${b.toFixed(0)}deg;--r:${v.toFixed(0)}px;--c:${we[m%we.length]};--d:${(Math.random()*.12).toFixed(2)}s"></span>`}).join(""),l.append(r),setTimeout(()=>r.remove(),1100)}function Me(t,a,i){if(!t||!a)return Promise.resolve();let n=t.getBoundingClientRect(),l=a.getBoundingClientRect(),r=document.createElement("div");r.className="fly-chip",r.setAttribute("aria-hidden","true"),r.innerHTML=`${i}<b>+1</b>`,Object.assign(r.style,{left:`${n.left+n.width/2-32}px`,top:`${n.top+n.height/2-32}px`}),(document.fullscreenElement||document.body).append(r);let h=l.left+l.width/2-(n.left+n.width/2),m=l.top+l.height/2-(n.top+n.height/2),b=Math.min(160,Math.abs(m)*.35+70);return r.animate([{transform:"translate(0, 0) scale(.4)",opacity:0},{transform:"translate(0, -16px) scale(1.1)",opacity:1,offset:.16},{transform:`translate(${h*.5}px, ${Math.min(m,0)*.5-b}px) scale(.85) rotate(-10deg)`,opacity:1,offset:.6},{transform:`translate(${h}px, ${m}px) scale(.25) rotate(8deg)`,opacity:.6}],{duration:950,easing:"cubic-bezier(.45,0,.25,1)"}).finished.then(()=>{r.remove(),Y(a,"is-pinged")})}var Ga=1800,Wt=(t,a="toast-thumb")=>`<span class="${a} photo-slot"><img ${Z(t.photo,{alt:""})}></span>`;function Xa(){return document.fullscreenElement?.querySelector("[data-cart-open]")||y("#siteHeader [data-cart-open]")}function Ya(t){var n,l;let a=y("[data-add-label]",t),i=y(".page-btn-icon",t);(n=t.dataset).label??(n.label=a?.textContent??""),(l=t.dataset).icon??(l.icon=i?.innerHTML??""),Y(t,"is-added"),a&&(a.textContent="\xA1Agregado!"),i&&(i.innerHTML=P.check),clearTimeout(Number(t.dataset.resetTimer)),t.dataset.resetTimer=String(setTimeout(()=>{t.classList.remove("is-added"),a&&(a.textContent=t.dataset.label),i&&(i.innerHTML=t.dataset.icon)},Ga))}function Se(t,a){Ya(t);let i=Xa();if(W())return;let n=t.getBoundingClientRect();$e(n.left+n.width/2,n.top+n.height/2),Me(t,i,Wt(a,"fly-chip-thumb"))}var N,X="cart",Za=()=>J(`
    <div id="cartDrawer" class="cart-drawer" aria-hidden="true">
        <div class="cart-shade" data-cart-close></div>
        <aside class="cart-panel" role="dialog" aria-modal="true" aria-labelledby="cartTitle">
            <header class="flex items-center justify-between border-b border-ink-100 px-6 py-5">
                <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600" data-cart-step-label>Paso 1 de 2</p>
                    <h2 id="cartTitle" class="font-display text-3xl font-bold uppercase text-ink-900">Tu carrito</h2>
                </div>
                <button type="button" class="grid size-11 place-items-center rounded-full text-ink-500 transition hover:rotate-90 hover:bg-ink-100 hover:text-ink-900" data-cart-close aria-label="Cerrar carrito">
                    <span class="size-6">${P.close}</span>
                </button>
            </header>
            <div class="flex-1 overflow-y-auto overscroll-contain" data-cart-body></div>
            <footer class="border-t border-ink-100 bg-ink-50/80 px-6 py-5" data-cart-footer></footer>
        </aside>
    </div>`),Ka=()=>`
    <div class="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <div class="relative grid size-28 place-items-center rounded-full bg-brand-50 text-brand-600">
            <span class="size-14 animate-float">${P.bag}</span>
            <span class="absolute inset-0 animate-ping-slow rounded-full border-2 border-brand-200"></span>
        </div>
        <p class="font-display text-2xl font-semibold uppercase text-ink-800">Tu carrito est\xE1 vac\xEDo.</p>
        <p class="text-ink-500">Explora nuestros accesorios y agrega lo que necesites para tu equipo.</p>
        <a href="${I("accesorios.html")}" class="btn btn-primary mt-2">Ver accesorios <span class="size-5">${P.arrowRight}</span></a>
    </div>`,Ja=(t,a)=>`
    <li class="cart-line" data-line="${t.id}" style="--i:${a}">
        <div class="photo-slot size-20 shrink-0 rounded-xl ring-1 ring-ink-100">
            <img ${Z(t.photo,{alt:""})} loading="lazy">
        </div>
        <div class="min-w-0 flex-1">
            <p class="truncate font-display text-lg font-semibold uppercase leading-tight text-ink-900">${f(t.name)}</p>
            <p class="text-sm text-ink-500">${z(t.price)} MXN c/u</p>
            <div class="mt-2 flex items-center justify-between gap-3">
                <div class="qty-stepper" role="group" aria-label="Cantidad de ${f(t.name)}">
                    <button type="button" data-qty="-1" aria-label="Quitar uno"><span class="size-4">${P.minus}</span></button>
                    <output aria-live="polite">${t.qty}</output>
                    <button type="button" data-qty="1" aria-label="Agregar uno"><span class="size-4">${P.plus}</span></button>
                </div>
                <p class="font-display text-lg font-bold text-ink-900" data-line-subtotal>${z(t.subtotal)}</p>
            </div>
        </div>
        <button type="button" class="self-start rounded-full p-2 text-ink-400 transition hover:bg-red-50 hover:text-red-600" data-remove aria-label="Quitar ${f(t.name)}">
            <span class="block size-5">${P.trash}</span>
        </button>
    </li>`;function Qa(t,a){return{body:`<ul class="flex flex-col gap-3 p-6 ${a?"is-animated":""}">${t.items.map(Ja).join("")}</ul>`,footer:`
            <dl class="space-y-1 text-ink-600">
                <div class="flex justify-between"><dt>Art\xEDculos</dt><dd>${t.count}</dd></div>
                <div class="flex items-end justify-between text-ink-900"><dt class="font-semibold">Total</dt>
                    <dd class="font-display text-3xl font-bold" data-cart-total>${z(t.total)} <small class="text-sm font-medium text-ink-500">MXN</small></dd></div>
            </dl>
            <p class="mt-1 text-right text-xs text-ink-500">IVA incluido</p>
            <button type="button" class="btn btn-primary mt-4 w-full" data-checkout>Finalizar compra <span class="size-5">${P.arrowRight}</span></button>
            <div class="mt-2 grid grid-cols-2 gap-2">
                <button type="button" class="btn btn-ghost-dark" data-cart-close>Seguir comprando</button>
                <button type="button" class="btn btn-ghost-dark hover:!border-red-300 hover:!text-red-600" data-clear>Vaciar carrito</button>
            </div>`}}function ts(t,a){return{body:`
            <form id="checkoutForm" class="flex flex-col gap-5 p-6 animate-fade-up">
                <div class="rounded-2xl bg-brand-50 p-4 text-sm text-brand-900">
                    Revisa tu pedido. Lo enviaremos por WhatsApp para confirmar existencias y forma de pago.
                    El pago con Mercado Pago se conecta con el backend.
                </div>
                <label class="field"><span>Nombre</span><input name="nombre" required value="${f(`${a.nombre} ${a.apellidos||""}`.trim())}"></label>
                <label class="field"><span>Correo</span><input name="correo" type="email" required value="${f(a.correo)}"></label>
                <label class="field"><span>Ciudad de entrega</span><input name="ciudad" required placeholder="Ej. Monterrey, N.L."></label>
                <label class="field"><span>Notas (opcional)</span><textarea name="notas" rows="2"></textarea></label>
                <ul class="divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white">
                    ${t.items.map(i=>`<li class="flex justify-between gap-3 px-4 py-3 text-sm"><span>${i.qty} \xD7 ${f(i.name)}</span><b>${z(i.subtotal)}</b></li>`).join("")}
                </ul>
            </form>`,footer:`
            <div class="flex items-end justify-between"><span class="font-semibold text-ink-900">Total</span>
                <span class="font-display text-3xl font-bold text-ink-900">${z(t.total)} <small class="text-sm text-ink-500">MXN</small></span></div>
            <button type="submit" form="checkoutForm" class="btn btn-primary mt-4 w-full"><span class="size-5">${P.whatsapp}</span> Enviar pedido por WhatsApp</button>
            <button type="button" class="btn btn-ghost-dark mt-2 w-full" data-back>\u2190 Volver al carrito</button>`}}var es=t=>({body:`
        <div class="flex h-full flex-col items-center justify-center gap-4 px-8 py-16 text-center">
            <svg viewBox="0 0 52 52" class="size-28 text-brand-600" aria-hidden="true">
                <circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" stroke-width="3" class="draw-circle"/>
                <path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="draw-check"/>
            </svg>
            <p class="font-display text-3xl font-bold uppercase text-ink-900 animate-fade-up">\xA1Pedido enviado!</p>
            <p class="text-ink-500 animate-fade-up [animation-delay:150ms]">Folio <b class="text-ink-900">${t}</b>. Te contactaremos por WhatsApp para confirmar tu compra.</p>
        </div>`,footer:'<button type="button" class="btn btn-primary w-full" data-cart-close>Listo</button>'});function kt(t=gt(),{animate:a=!1}={}){let i=ht();X==="checkout"&&(!t.count||!i)&&(X="cart");let n=X==="success"?es(N.dataset.orderId):X==="checkout"?ts(t,i):t.count?Qa(t,a):{body:Ka(),footer:""};y("[data-cart-body]",N).innerHTML=n.body;let l=y("[data-cart-footer]",N);l.innerHTML=n.footer,l.hidden=!n.footer,y("#cartTitle",N).textContent=X==="checkout"?"Confirmar pedido":X==="success"?"Gracias":"Tu carrito",y("[data-cart-step-label]",N).textContent=X==="checkout"?"Paso 2 de 2":X==="success"?"Compra":"Paso 1 de 2"}function Pe(t,a){$("[data-cart-count]").forEach(i=>{i.textContent=t,i.dataset.cartCount=t}),a&&setTimeout(()=>{$("[data-cart-count]").forEach(i=>Y(i,"animate-bump")),$(".cart-btn[data-cart-open]").forEach(i=>Y(i,"animate-wiggle"))},W()?0:850)}function qt(){document.fullscreenElement&&document.exitFullscreen(),kt(gt(),{animate:!0}),N.classList.add("is-open"),N.setAttribute("aria-hidden","false"),document.documentElement.classList.add("overflow-hidden"),setTimeout(()=>y("[data-cart-close]:not(.cart-shade)",N)?.focus(),350)}function Le(){N.classList.remove("is-open"),N.setAttribute("aria-hidden","true"),document.documentElement.classList.remove("overflow-hidden"),X==="success"&&(X="cart")}function as(){if(!ht()){let t=location.pathname.split("/").pop()||"index.html";B("Necesitas una cuenta para comprar. Te llevamos a crearla\u2026"),setTimeout(()=>{location.href=`${I("cuenta.html")}?next=${encodeURIComponent(t)}#registro`},1500);return}X="checkout",kt()}function ss(t){let a=Object.fromEntries(new FormData(t)),i=gt(),n=`INV-${Date.now().toString(36).toUpperCase().slice(-6)}`,l=[`Pedido ${n} - Accesorios Invictus Crane`,...i.items.map(r=>`\u2022 ${r.qty} \xD7 ${r.name} \u2014 ${z(r.subtotal)} MXN`),`Total: ${z(i.total)} MXN (IVA incluido)`,`Nombre: ${a.nombre}`,`Correo: ${a.correo}`,`Ciudad: ${a.ciudad}`,a.notas?`Notas: ${a.notas}`:""].filter(Boolean).join(`
`);window.open(j(l),"_blank","noopener"),N.dataset.orderId=n,X="success",Nt()}function is(t){let a=t.target;if(a.closest("[data-cart-close]"))return Le();if(a.closest("[data-checkout]"))return as();if(a.closest("[data-back]"))return X="cart",kt();if(a.closest("[data-clear]"))return Nt(),B("Carrito vac\xEDo");let i=a.closest("[data-line]");if(!i)return;let n=i.dataset.line,l=Number(y("output",i).textContent),r=a.closest("[data-qty]")?.dataset.qty;r&&be(n,l+Number(r)),a.closest("[data-remove]")&&(i.classList.add("is-removing"),i.addEventListener("animationend",()=>ye(n),{once:!0}))}function os(t){let a=t.target.closest("[data-add-to-cart]");if(a){let i=pt(a.dataset.addToCart);if(!i)return;Se(a,i),xe(i.id),B(`${i.name} agregado al carrito`,{tone:"success",thumb:Wt(i),action:{label:"Ver carrito",onClick:qt}});return}t.target.closest("[data-cart-open]")&&(t.preventDefault(),qt())}function ke(){N=Za(),document.body.append(N),N.addEventListener("click",is),N.addEventListener("submit",t=>{t.preventDefault(),ss(t.target)}),document.addEventListener("click",os),addEventListener("keydown",t=>t.key==="Escape"&&N.classList.contains("is-open")&&Le()),ve((t,a)=>{Pe(t.count,a.type==="add"),N.classList.contains("is-open")&&kt(t)}),Pe(gt().count,!1),location.hash==="#carrito"&&qt()}var ns={flag:'<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',shield:'<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',wrench:'<path d="M14.5 5.5a4 4 0 0 0 4.9 4.9L21 12l-8.5 8.5a2.1 2.1 0 0 1-3-3L18 9"/><path d="M14.5 5.5 12.6 3.6A4 4 0 0 0 7 9.2"/>',tag:'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3.5h2.6l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1l1.9-7.3H6.2"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>'},Ce={gruas:{kicker:"Cat\xE1logo de equipos",tags:()=>it.map(t=>G[t].name),features:[["flag","Ingenier\xEDa mexicana"],["shield","Componentes certificados"],["wrench","Soporte profesional"]],art:()=>ds,label:{text:"INVICTUS",x:118,y:93}},accesorios:{kicker:"Cat\xE1logo de accesorios",tags:()=>["Cadenas","Ganchos","Malacates","Se\xF1alizaci\xF3n"],features:[["cart","Compra en l\xEDnea"],["tag","Precios con IVA incluido"],["chat","Atenci\xF3n por WhatsApp"]],art:()=>hs(),label:{text:"ACCESORIOS",x:246,y:90}}},rs=t=>`
    <ul class="cover-features">${t.map(([a,i])=>`
        <li><span class="cover-feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ns[a]}</svg></span>${f(i)}</li>`).join("")}
    </ul>`,Bt=()=>`
    <span class="cover-stitch" aria-hidden="true"></span>
    <span class="cover-corner is-tl" aria-hidden="true"></span><span class="cover-corner is-tr" aria-hidden="true"></span>
    <span class="cover-corner is-bl" aria-hidden="true"></span><span class="cover-corner is-br" aria-hidden="true"></span>`;function ls(t){let a=[...`EDICI\xD3N ${t} \u2726 INVICTUS CRANE \u2726 HECHO EN M\xC9XICO \u2726 `],i=360/a.length;return`
        <span class="cover-seal" aria-hidden="true">
            <span class="cover-seal-ring">${a.map((n,l)=>`<i style="--r:${(l*i).toFixed(1)}deg">${n===" "?"&nbsp;":f(n)}</i>`).join("")}</span>
            <b>${t}</b>
        </span>`}var cs=({text:t,x:a,y:i})=>`<span class="ill-label" style="left:${(a/320*100).toFixed(1)}%;top:${(i/150*100).toFixed(1)}%">${f(t)}</span>`;function Ct({kind:t,year:a,title:i,action:n,titleTag:l="h2"}){let r=Ce[t]??Ce.gruas;return`
        <div class="cover-sheet cover-front" data-cover="${t}">
            ${Bt()}
            <div class="cover-top"><span>Industrias Invictus Crane</span><span>N.\xBA ${String(a).slice(-2)}</span></div>
            <img class="cover-logo" src="${q("logo-invictus.png")}" alt="Industrias Invictus Crane">
            <div class="cover-art" aria-hidden="true">
                <div class="cover-plot">${r.art()}${cs(r.label)}</div>
                <span class="cover-scan"></span>
                ${ls(a)}
            </div>
            <p class="cover-kicker">${f(r.kicker)}</p>
            <${l} class="cover-title">${f(i)}</${l}>
            <ul class="cover-tags">${r.tags().map(h=>`<li>${f(h)}</li>`).join("")}</ul>
            ${rs(r.features)}
            ${n}
            <div class="cover-hazard" aria-hidden="true"></div>
        </div>`}var Ae=`
    <path class="ill-line" style="--d:0" pathLength="1" d="M4 134H316"/>
    <g class="ill-dim"><path d="M8 144H304"/><path d="M8 140v8M304 140v8M82 142v4M156 142v4M230 142v4"/></g>`,ds=`
    <svg class="cover-illustration" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        ${Ae}
        <path class="ill-line" style="--d:100" pathLength="1" d="M34 104H60a18 18 0 0 1 36 0a18 18 0 0 1 36 0H244a18 18 0 0 1 36 0H302"/>
        <path class="ill-line" style="--d:200" pathLength="1" d="M40 104V80a4 4 0 0 1 4-4H200V104"/>
        <rect class="ill-line" style="--d:350" pathLength="1" x="47" y="82" width="28" height="13" rx="2"/>
        <rect class="ill-line" style="--d:400" pathLength="1" x="160" y="82" width="34" height="13" rx="2"/>
        <path class="ill-line" style="--d:450" pathLength="1" d="M68 88h4M187 88h4"/>
        <path class="ill-line" style="--d:250" pathLength="1" d="M206 104V56a6 6 0 0 1 6-6h40l22 26h18a6 6 0 0 1 6 6v22"/>
        <path class="ill-line" style="--d:420" pathLength="1" d="M214 56h36l16 20h-52z"/>
        <path class="ill-line" style="--d:500" pathLength="1" d="M246 86h6M298 92h6v10h-6M270 58h5v10"/>
        <circle class="ill-line" style="--d:520" pathLength="1" cx="291" cy="86" r="3"/>
        <path class="ill-line" style="--d:300" pathLength="1" d="M202 104V38M199 38h6"/>
        <rect class="ill-line" style="--d:550" pathLength="1" x="219" y="43" width="32" height="7" rx="2"/>
        <g class="ill-beacons" stroke="none"><circle cx="227" cy="46.5" r="2.4"/><circle cx="235" cy="46.5" r="2.4"/><circle cx="243" cy="46.5" r="2.4"/></g>
        <path class="ill-line" style="--d:600" pathLength="1" d="M150 70 34 20l6 8 116 50z"/>
        <path class="ill-line" style="--d:700" pathLength="1" d="M112 58 52 32"/>
        <path class="ill-line" style="--d:650" pathLength="1" d="M142 76l10-11 12 11"/>
        <path class="ill-line is-thick" style="--d:750" pathLength="1" d="M182 76 142 60"/>
        <path class="ill-line" style="--d:780" pathLength="1" d="M142 60 104 45"/>
        <path class="ill-line" style="--d:450" pathLength="1" d="M40 97H24l-5 6H8M9 103v6M15 103v6"/>
        <g class="ill-wheels">
            <circle class="ill-line" style="--d:300" pathLength="1" cx="78" cy="118" r="15"/><circle class="ill-line" style="--d:380" pathLength="1" cx="114" cy="118" r="15"/><circle class="ill-line" style="--d:460" pathLength="1" cx="262" cy="118" r="15"/>
            <circle class="ill-line" style="--d:600" pathLength="1" cx="78" cy="118" r="5"/><circle class="ill-line" style="--d:650" pathLength="1" cx="114" cy="118" r="5"/><circle class="ill-line" style="--d:700" pathLength="1" cx="262" cy="118" r="5"/>
        </g>
        <circle class="ill-line" style="--d:900" pathLength="1" cx="36" cy="24" r="4"/>
        <circle class="ill-target" cx="36" cy="24" r="9"/>
        <g class="ill-swing">
            <path class="ill-line" style="--d:1000" pathLength="1" d="M36 28v46"/>
            <path class="ill-line is-thick" style="--d:1150" pathLength="1" d="M36 74v8a6.5 6.5 0 1 1-6.5 6.5l-2.5-3"/>
        </g>
    </svg>`;function Ee(t,a,i,n,l){let r=Math.PI*2/l,h=(b,v)=>`${(t+b*Math.cos(v)).toFixed(1)} ${(a+b*Math.sin(v)).toFixed(1)}`;return`${Array.from({length:l},(b,v)=>{let M=v*r;return`${v?"L":"M"}${h(n,M)}L${h(i,M+r*.14)}L${h(i,M+r*.36)}L${h(n,M+r*.5)}`}).join("")}Z`}var hs=()=>`
    <svg class="cover-illustration" viewBox="0 0 320 150" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        ${Ae}
        <g class="ill-spin">
            <path class="ill-line" style="--d:100" pathLength="1" d="${Ee(66,72,36,29,12)}"/>
            <circle class="ill-line" style="--d:300" pathLength="1" cx="66" cy="72" r="11"/>
            <path class="ill-line" style="--d:400" pathLength="1" d="M66 47v14M66 83v14M41 72h14M77 72h14"/>
        </g>
        <g class="ill-spin is-reverse">
            <path class="ill-line" style="--d:250" pathLength="1" d="${Ee(113,112,22,17,9)}"/>
            <circle class="ill-line" style="--d:450" pathLength="1" cx="113" cy="112" r="6"/>
        </g>
        <path class="ill-line" style="--d:150" pathLength="1" d="M140 6H200M150 6v-2M190 6v-2"/>
        <g class="ill-swing is-chain">
            <rect class="ill-line" style="--d:300" pathLength="1" x="163" y="7" width="14" height="24" rx="7"/>
            <rect class="ill-line" style="--d:400" pathLength="1" x="167.5" y="25" width="5" height="22" rx="2.5"/>
            <rect class="ill-line" style="--d:500" pathLength="1" x="163" y="41" width="14" height="24" rx="7"/>
            <rect class="ill-line" style="--d:600" pathLength="1" x="167.5" y="59" width="5" height="20" rx="2.5"/>
            <circle class="ill-line" style="--d:700" pathLength="1" cx="170" cy="85" r="6"/>
            <path class="ill-line is-thick" style="--d:850" pathLength="1" d="M170 91v12a14 14 0 1 1-14 14l-4-6"/>
        </g>
        <rect class="ill-line" style="--d:300" pathLength="1" x="204" y="52" width="84" height="15" rx="5"/>
        <path class="ill-line" style="--d:500" pathLength="1" d="M214 67v7M278 67v7M208 74h76"/>
        <g class="ill-beacons" stroke="none"><circle cx="217" cy="59.5" r="3.3"/><circle cx="231.5" cy="59.5" r="3.3"/><circle cx="246" cy="59.5" r="3.3"/><circle cx="260.5" cy="59.5" r="3.3"/><circle cx="275" cy="59.5" r="3.3"/></g>
        <path class="ill-line" style="--d:450" pathLength="1" d="M226 134 262 100h14l30 34"/>
        <path class="ill-line" style="--d:650" pathLength="1" d="M240 134l26-26M254 134l20-20M268 134l12-12"/>
    </svg>`;var ps=t=>t%2===0?"page--left":"page--right",K=t=>String(t).padStart(2,"0"),Ie=`
    <svg class="page-blueprint" viewBox="40 150 670 430" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round">
        <rect x="58" y="436" width="410" height="84" rx="6"/><path d="M468 250H628L686 382V520H468Z"/><path d="M510 294H600L638 392H510Z"/>
        <rect x="270" y="400" width="140" height="36"/><path d="M152 178H232L384 402H276Z"/><path d="M154 182V348"/>
        <path d="M154 348C118 348 118 400 156 400C186 400 196 372 190 354"/>
        <circle cx="168" cy="512" r="52"/><circle cx="310" cy="512" r="52"/><circle cx="575" cy="512" r="52"/>
        <circle cx="168" cy="512" r="21"/><circle cx="310" cy="512" r="21"/><circle cx="575" cy="512" r="21"/>
    </svg>`,gs=t=>`
    <span class="page-decor" aria-hidden="true">
        <i class="page-marks"></i><i class="page-ruler"></i>
        <i class="page-serial">Industrias Invictus Crane \xB7 Cat\xE1logo 2026 \xB7 Hoja ${K(t)}</i>
    </span>`,us=(t,a)=>t.map(i=>`
    <button type="button" class="page-tab${i.slot===a?" is-active":""}" style="--slot:${i.slot};--count:${t.length}" data-go="${i.page}" aria-label="Ir a la secci\xF3n ${f(i.label)}" title="${f(i.label)}">
        <b>${K(i.slot+1)}</b><span>${f(i.label)}</span>
    </button>`).join("");function ut(t,a,i,n="",{tabs:l=[],activeSlot:r=null}={}){return`
        <div class="page page--sheet ${ps(t)} ${n}" data-density="soft" data-page-number="${t}">
            <div class="page-sheet">
                ${gs(t)}
                ${Ie}
                ${us(l,r)}
                <header class="page-head">
                    <img src="${q("logo-invictus.png")}" alt="" class="page-head-logo">
                    <span>${f(a)}</span>
                </header>
                <div class="page-content">${i}</div>
                <footer class="page-foot">
                    <button type="button" class="page-foot-index" data-go="2">\xCDndice</button>
                    <span class="page-foot-rule"></span>
                    <span class="page-foot-num">${K(t)}</span>
                </footer>
            </div>
        </div>`}function Vt({kind:t,year:a,title:i}){return`
        <div class="page page--cover page--right" data-density="hard" data-page-number="1">
            ${Ct({kind:t,year:a,title:i,action:'<button type="button" class="cover-open" data-go="2">Abrir cat\xE1logo \u25B6</button>'})}
        </div>`}function Te(t){return`
        <div class="page page--cover page--left" data-density="hard" data-page-number="${t}">
            <div class="cover-sheet">
                ${Ie}
                ${Bt()}
                <img class="cover-logo" src="${q("logo-invictus.png")}" alt="Industrias Invictus Crane">
                <h2 class="cover-title">Gracias por hojear<br>nuestro cat\xE1logo</h2>
                <p class="cover-subtitle">INDUSTRIAS INVICTUS CRANE \xB7 2026</p>
                <div class="cover-actions">
                    <a class="cover-open" target="_blank" rel="noopener" href="${j("Hola, vi el cat\xE1logo y quiero informaci\xF3n")}">Escribir por WhatsApp</a>
                    <button type="button" class="cover-open is-ghost" data-go="1">Volver a la portada</button>
                </div>
                <div class="cover-hazard" aria-hidden="true"></div>
            </div>
        </div>`}var Re=t=>ut(t,"Notas",`
    <h3 class="page-title">Notas</h3>
    <div class="notes-lines" aria-hidden="true"></div>`);function Et(t,a,{tabs:i=[],hint:n=""}={}){let l=0;return ut(t,"Contenido",`
        <h3 class="page-title">\xCDndice</h3>
        ${n?`<p class="page-hint">${f(n)}</p>`:""}
        <div class="index-cats${a.length<=2?" is-roomy":""}">
            ${a.map(r=>`
                <section class="index-cat" style="--i:${l++}">
                    <button type="button" class="index-cat-head" data-go="${r.page}">
                        <span class="index-cat-num">${K(r.index+1)}</span>
                        <span class="index-cat-icon">${lt[r.icon]}</span>
                        <span class="index-cat-name"><b>${f(r.title)}</b><small>${f(r.meta)}</small></span>
                        <span class="index-cat-page">${K(r.page)}</span>
                    </button>
                    <div class="index-cat-items">
                        ${r.entries.map(h=>`
                            <button type="button" class="index-item" data-go="${h.page}">
                                <span><b>${f(h.name)}</b><small>${f(h.detail)}</small></span><i>${K(h.page)}</i>
                            </button>`).join("")}
                    </div>
                </section>`).join("")}
        </div>`,"page--index",{tabs:i})}var mt=(t,a,i,n)=>ut(t,a,`
    <h3 class="page-title">${f(i)}</h3>
    <div class="page-prose">${n}</div>`),He=(t,a,i,n="")=>`
    <figure class="product-photo">
        <span class="product-photo-frame photo-slot"><img ${Z(t,{alt:a})} loading="lazy"></span>
        <figcaption>${f(i)}</figcaption>
        ${n}
    </figure>`,De=(t,a)=>`<span class="product-chip"><b>${K(t.index+1)}</b>${f(a)}</span>`;function jt(t,{index:a,kicker:i,title:n,tagline:l,icon:r,photo:h="",facts:m,entries:b,link:v=null,tabs:M=[]}){let O=b.some(S=>S.photo),D=h?`
        <figure class="divider-photo">
            <span class="product-photo-frame photo-slot"><img ${Z(h,{alt:`Fotograf\xEDa de la l\xEDnea ${n}`})} loading="lazy"></span>
        </figure>`:"",E=b.map(S=>O?`
        <button type="button" class="divider-thumb" data-go="${S.page}">
            <span class="divider-thumb-photo photo-slot"><img ${Z(S.photo,{alt:""})} loading="lazy"></span>
            <span class="divider-thumb-copy"><b>${f(S.name)}</b><small>${f(S.detail)}</small></span><i>${K(S.page)}</i>
        </button>`:`
        <button type="button" class="divider-item" data-go="${S.page}"><b>${f(S.name)}</b><small>${f(S.detail)}</small><i>${K(S.page)}</i></button>`).join("");return ut(t,`Secci\xF3n ${K(a+1)}`,`
        <div class="divider${O?" has-thumbs":""}">
            <span class="divider-num" aria-hidden="true">${K(a+1)}</span>
            <div class="divider-head">
                ${h?"":`<span class="divider-emblem">${lt[r]}</span>`}
                <div>
                    <p class="divider-kicker"><b>${K(a+1)}</b>${f(i)}</p>
                    <h3 class="divider-title">${f(n)}</h3>
                </div>
            </div>
            <p class="divider-tagline">${f(l)}</p>
            ${D}
            <ul class="divider-facts">${m.map((S,A)=>`
                <li style="--i:${A}"><i class="spec-row-icon">${lt[S.icon]}</i><span><small>${f(S.label)}</small><b>${f(S.value)}</b></span></li>`).join("")}
            </ul>
            <p class="divider-list-title"><span>${O?"Productos de esta categor\xEDa":"Modelos de esta l\xEDnea"}</span>${v?`<a class="divider-link" href="${v.href}">${f(v.label)} \u2192</a>`:""}</p>
            <div class="divider-list">${E}</div>
        </div>`,"page--divider",{tabs:M,activeSlot:a})}function _e(t,a,i,n){let l=a.specLabels.map((r,h)=>`
        <li class="spec-row has-icon" style="--i:${h}"><i class="spec-row-icon">${lt[a.specIcons[h]]}</i><span>${f(r)}</span><b>${f(i.specs[h])}</b></li>`).join("");return ut(t,a.name,`
        <div class="product-layout">
            ${He(a.photo,`Fotograf\xEDa de gr\xFAa ${i.model}`,`Imagen ilustrativa \xB7 Modelo ${i.model}`)}
            ${De(n,a.name)}
            <h3 class="product-name">${f(i.model)}</h3>
            <p class="product-desc">${f(i.description)}</p>
            <ul class="spec-list">${l}</ul>
            <div class="page-actions">
                <a class="page-btn is-primary" target="_blank" rel="noopener" href="${Mt(i.model,a.name)}">Cotizar por WhatsApp</a>
                <a class="page-btn is-link" href="${I(a.page)}">Ver m\xE1s de ${f(a.name)} \u2192</a>
            </div>
        </div>`,"page--product",{tabs:n.tabs,activeSlot:n.index})}function Fe(t,a,i){let n=`<span class="price-tag"><small>Precio</small>${z(a.price)}<small>MXN \xB7 IVA incluido</small></span>`;return ut(t,i.category.name,`
        <div class="product-layout">
            ${He(a.photo,`Fotograf\xEDa de ${a.name}`,`Imagen ilustrativa \xB7 ${a.name}`,n)}
            ${De(i,i.category.name)}
            <h3 class="product-name is-long">${f(a.name)}</h3>
            <p class="product-desc">${f(a.description)}</p>
            <ul class="spec-list">
                <li class="spec-row"><span>Precio</span><b>${z(a.price)} MXN</b></li>
                <li class="spec-row"><span>Impuestos</span><b>IVA incluido</b></li>
            </ul>
            <div class="page-actions">
                <button type="button" class="page-btn is-primary is-cart" data-add-to-cart="${a.id}"><span class="page-btn-icon">${P.cart}</span><span data-add-label>Agregar al carrito</span></button>
                <a class="page-btn" target="_blank" rel="noopener" href="${j(`Hola, tengo una duda sobre el accesorio ${a.name}`)}">Preguntar por WhatsApp</a>
                <button type="button" class="page-btn is-link" data-cart-open>Ver mi carrito \u2192</button>
            </div>
        </div>`,"page--product page--accessory",{tabs:i.tabs,activeSlot:i.index})}var xt=t=>`<div class="page-actions">${t}</div>`,Ut=(t,a,i)=>`${t} ${t===1?a:i}`;function Oe(t,a){return a%2===1&&t.push(Re(a++)),t.push(Te(a)),t}function Gt(t=4){let a=t;return it.map((i,n)=>{let l=G[i];return{index:n,line:l,page:a++,entries:l.models.map(r=>({item:r,page:a++}))}})}function Xt(t=4){let a=t;return St.map((i,n)=>({index:n,category:i,page:a++,entries:tt.filter(l=>l.category===i.id).map(l=>({item:l,page:a++}))}))}function ze(t){let a=t.map(i=>({slot:i.index,label:i.line?.name??i.category.name,page:i.page}));return t.forEach(i=>{i.tabs=a}),a}function Ne(){let t=Gt(),a=ze(t),i=h=>({index:h.index,title:h.line.name,icon:h.line.icon,page:h.page,meta:`${Ut(h.entries.length,"modelo","modelos")} \xB7 ${Ft(h.line.models.map(m=>m.specs[0]))}`,entries:h.entries.map(m=>({name:m.item.model,detail:m.item.specs[0],page:m.page}))}),n=[Vt({kind:"gruas",year:2026,title:"Gr\xFAas de arrastre y salvamento"})],l=Math.ceil(t.length/2);n.push(Et(2,t.slice(0,l).map(i),{tabs:a,hint:"Elige una l\xEDnea o un modelo para ir directo a su hoja"}),Et(3,t.slice(l).map(i),{tabs:a,hint:"Cada l\xEDnea empieza con su hoja de presentaci\xF3n y sigue con sus modelos"})),t.forEach(h=>{let{line:m}=h;n.push(jt(h.page,{index:h.index,kicker:"L\xEDnea de equipos",title:m.name,tagline:m.tagline,icon:m.icon,photo:m.photo,facts:m.specLabels.map((b,v)=>({icon:m.specIcons[v],label:b,value:Ft(m.models.map(M=>M.specs[v]))})),entries:h.entries.map(b=>({name:b.item.model,detail:b.item.specs[0],page:b.page})),link:{href:I(m.page),label:`Ver la l\xEDnea ${m.name}`},tabs:a})),h.entries.forEach(b=>n.push(_e(b.page,m,b.item,h)))});let r=t.at(-1).entries.at(-1).page+1;return n.push(mt(r++,"Nosotros","Industrias Invictus Crane",`
        <p>Somos una empresa orgullosamente mexicana dedicada al dise\xF1o y fabricaci\xF3n de gr\xFAas de arrastre y salvamento.</p>
        <p>Nuestro compromiso es ofrecer equipos de alto desempe\xF1o, componentes certificados y un servicio profesional a cada cliente.</p>
        ${xt(`<a class="page-btn is-primary" href="${I("nosotros.html")}">Conocer m\xE1s de nosotros</a><a class="page-btn" href="${I("reparaciones.html")}">Solicitar una reparaci\xF3n</a>`)}`)),n.push(mt(r++,"Cotizaciones","Cotiza tu equipo",`
        <p>Los equipos se cotizan por WhatsApp. Cu\xE9ntanos qu\xE9 necesitas y te ayudamos a elegir el modelo adecuado.</p>
        ${xt(`<a class="page-btn is-primary" target="_blank" rel="noopener" href="${j("Hola, quiero cotizar una gr\xFAa")}">Cotizar por WhatsApp</a><a class="page-btn" href="${I("contacto.html")}">Ir a contacto</a><a class="page-btn is-link" href="${I("accesorios.html")}">Ver accesorios en l\xEDnea \u2192</a>`)}`)),Oe(n,r)}function We(){let t=Xt(),a=ze(t),i=[Vt({kind:"accesorios",year:2026,title:"Accesorios para gr\xFAas"})];i.push(Et(2,t.map(l=>({index:l.index,title:l.category.name,icon:l.category.icon,page:l.page,meta:Ut(l.entries.length,"accesorio","accesorios"),entries:l.entries.map(r=>({name:r.item.name,detail:`${z(r.item.price)} MXN`,page:r.page}))})),{tabs:a,hint:"Elige una categor\xEDa o un accesorio para ir directo a su hoja"})),i.push(mt(3,"Tienda en l\xEDnea","C\xF3mo comprar",`
        <ol class="steps-list">
            <li><b>Crea tu cuenta.</b> Es necesaria para comprar accesorios.</li>
            <li><b>Elige tus accesorios.</b> En la ficha del producto pulsa \xABAgregar al carrito\xBB.</li>
            <li><b>Revisa tu carrito</b> y finaliza tu compra. Todos los precios incluyen IVA.</li>
        </ol>
        ${xt(`<a class="page-btn is-primary" href="${I("cuenta.html")}?next=accesorios.html#registro">Crear mi cuenta</a>`)}`)),t.forEach(l=>{let{category:r}=l,h=l.entries.map(m=>m.item.price);i.push(jt(l.page,{index:l.index,kicker:"Categor\xEDa de accesorios",title:r.name,tagline:r.tagline,icon:r.icon,facts:[{icon:r.icon,label:"Productos",value:Ut(l.entries.length,"accesorio","accesorios")},{icon:"tag",label:"Precios",value:h.length>1?`${z(Math.min(...h))} \u2013 ${z(Math.max(...h))}`:z(h[0])},{icon:"cart",label:"Compra",value:"En l\xEDnea \xB7 IVA incluido"}],entries:l.entries.map(m=>({name:m.item.name,detail:`${z(m.item.price)} MXN`,page:m.page,photo:m.item.photo})),tabs:a})),l.entries.forEach(m=>i.push(Fe(m.page,m.item,l)))});let n=t.at(-1).entries.at(-1).page+1;return i.push(mt(n++,"Ayuda","\xBFNo ves lo que buscas?",`
        <p>Escr\xEDbenos y te ayudamos a encontrar el accesorio adecuado para tu equipo.</p>
        ${xt(`<a class="page-btn is-primary" target="_blank" rel="noopener" href="${j("Hola, busco un accesorio que no veo en el cat\xE1logo")}">Escribir por WhatsApp</a><a class="page-btn" href="${I("catalogo.html")}">Ver cat\xE1logo de gr\xFAas</a>`)}`)),i.push(mt(n++,"Tu compra","Tu carrito",`
        <p>Aqu\xED puedes revisar los accesorios que agregaste y terminar tu compra.</p>
        ${xt('<button type="button" class="page-btn is-primary" data-cart-open>Abrir mi carrito</button><button type="button" class="page-btn" data-go="2">Volver al \xEDndice</button>')}`)),Oe(i,n)}var je=Ca(Be(),1);var Ve="a, button, input, label, select, textarea, [data-go]",ct=null;function ms({cart:t}){let a=(i,n,l,r="")=>`<button type="button" class="book-tool ${r}" data-book="${i}" aria-label="${l}" title="${l}"><span class="size-5">${P[n]}</span><span class="hidden lg:inline">${l}</span></button>`;return`
        <div class="book-toolbar">
            ${a("prev","chevronLeft","Anterior")}
            ${a("index","list","\xCDndice")}
            <div class="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-2">
                <span class="book-counter" aria-live="polite" data-book-counter></span>
                <input type="range" min="1" value="1" class="book-slider" data-book-slider aria-label="Ir a la p\xE1gina">
            </div>
            ${t?`<button type="button" class="book-tool is-cart" data-cart-open aria-label="Ver mi carrito" title="Ver mi carrito"><span class="relative size-5">${P.cart}<span class="book-cart-badge" data-cart-count="0">0</span></span><span class="hidden lg:inline">Carrito</span></button>`:""}
            ${a("fullscreen","expand","Pantalla completa","hidden sm:inline-flex")}
            ${a("next","chevronRight","Siguiente")}
        </div>`}function Ue(t,a,{cart:i=!1}={}){t.classList.add("book"),t.innerHTML=`
        <div class="book-stage">
            <button type="button" class="book-arrow is-prev" data-book="prev" aria-label="P\xE1gina anterior"><span class="size-7">${P.chevronLeft}</span></button>
            <div class="book-frame">
                <div class="book-glow" aria-hidden="true"></div>
                <div class="book-edges" aria-hidden="true"><i class="book-edge is-left"></i><i class="book-edge is-right"></i></div>
                <div class="book-pages">${a.join("")}</div>
                <div class="book-spine" aria-hidden="true"></div>
                <div class="book-zone is-prev" aria-hidden="true"><span>\u2039</span></div>
                <div class="book-zone is-next" aria-hidden="true"><span>\u203A</span></div>
            </div>
            <button type="button" class="book-arrow is-next" data-book="next" aria-label="P\xE1gina siguiente"><span class="size-7">${P.chevronRight}</span></button>
        </div>
        ${ms({cart:i})}`;let n=y(".book-frame",t);n.tabIndex=-1;let l=y(".book-pages",t),r=a.length,h=new je.PageFlip(l,{width:560,height:740,size:"stretch",minWidth:300,maxWidth:1e3,minHeight:396,maxHeight:1322,showCover:!0,maxShadowOpacity:.6,flippingTime:W()?300:900,useMouseEvents:!1});h.loadFromHTML($(".page",l));let m=y(".stf__block",l),b=y("[data-book-counter]",t),v=y("[data-book-slider]",t);v&&(v.max=r);let M=()=>h.getOrientation()==="portrait",O=()=>h.getCurrentPageIndex(),D=()=>O()===0,E=()=>O()>=r-1;function S(){let c=h.getBoundsRect(),p=M()||D()||E(),u=M()||D();return{rect:c,single:p,x:c.left+(p&&u?c.pageWidth:0),width:p?c.pageWidth:c.pageWidth*2}}function A(){let c=O(),{rect:p,single:u,x:w,width:C}=S(),L=0;M()||(L=D()?-p.pageWidth/2:E()?p.pageWidth/2:0),n.style.setProperty("--book-shift",`${L}px`),t.classList.toggle("is-closed",!M()&&(D()||E())),t.classList.toggle("is-spread",!u),n.style.setProperty("--vis-x",`${w}px`),n.style.setProperty("--vis-w",`${C}px`),n.style.setProperty("--bk-y",`${p.top}px`),n.style.setProperty("--bk-h",`${p.height}px`),n.style.setProperty("--page-w",`${p.pageWidth}px`),n.style.setProperty("--spine-x",`${p.left+p.pageWidth}px`);let U=M()?0:c,Q=M()?0:Math.max(0,r-c-2);n.style.setProperty("--edge-left",`${Math.min(14,Math.ceil(U/2))}px`),n.style.setProperty("--edge-right",`${Math.min(14,Math.ceil(Q/2))}px`),n.classList.toggle("has-left-page",!M()&&c>0),n.classList.toggle("has-right-page",!M()&&c<r-1)}function R(){let c=O(),p=c+1,u=!M()&&c>0&&c<r-1,w=L=>String(L).padStart(2,"0");b.textContent=c===0?"Portada":c>=r-1?"Contraportada":u?`P\xE1ginas ${w(p-(p%2===1?1:0))}\u2013${w(p+(p%2===0?1:0))} de ${r}`:`P\xE1gina ${w(p)} de ${r}`,v&&(v.value=p),$("[data-book=prev]",t).forEach(L=>{L.disabled=c===0}),$("[data-book=next]",t).forEach(L=>{L.disabled=c>=r-1}),$(".page",l).forEach(L=>L.classList.remove("is-visible")),(M()?[c]:c%2===0&&c>0?[c-1,c]:[c,c+1]).forEach(L=>y(`.page[data-page-number="${L+1}"]`,l)?.classList.add("is-visible"))}let x=c=>{let p=Math.max(0,Math.min(r-1,c-1));p!==O()&&(W()?h.turnToPage(p):h.flip(p))},e=()=>h.flipNext("bottom"),s=()=>h.flipPrev("bottom");function o(c){let{rect:p}=S(),u=c-m.getBoundingClientRect().left-p.left;return M()?u<p.pageWidth*1.3?"prev":"next":u<p.pageWidth?"prev":"next"}let d=c=>c==="prev"?!D():!E();h.on("flip",()=>{A(),R()}),h.on("changeOrientation",()=>{A(),R()}),h.on("init",()=>{A(),R()}),h.on("changeState",c=>t.classList.toggle("is-flipping",c.data!=="read")),addEventListener("resize",()=>requestAnimationFrame(A)),l.addEventListener("click",c=>{if(c.target.closest(Ve)||!c.target.closest(".page"))return;let p=o(c.clientX);d(p)&&(p==="prev"?s():e())}),l.addEventListener("pointermove",c=>{if(c.pointerType!=="mouse")return;let p=c.target.closest(Ve)||!c.target.closest(".page")?"":o(c.clientX);n.dataset.zone=p&&d(p)?p:""}),l.addEventListener("pointerleave",()=>{n.dataset.zone=""}),t.addEventListener("click",c=>{let p=c.target.closest("[data-go]");if(p)return l.contains(p)&&n.focus({preventScroll:!0}),x(Number(p.dataset.go));let u=c.target.closest("[data-book]")?.dataset.book;u==="next"?e():u==="prev"?s():u==="index"?x(2):u==="fullscreen"&&fs(t)}),v?.addEventListener("change",()=>x(Number(v.value))),v?.addEventListener("input",()=>{b.textContent=`Ir a la p\xE1gina ${v.value} de ${r}`}),new IntersectionObserver(([c])=>{c.isIntersecting?ct=g:ct===g&&(ct=null)},{threshold:.6}).observe(n);let g={next:e,prev:s,goToNumber:x,root:t};return requestAnimationFrame(()=>{A(),R()}),g}function fs(t){document.fullscreenElement?document.exitFullscreen():t.requestFullscreen?.()}addEventListener("keydown",t=>{!ct||/input|textarea|select/i.test(t.target.tagName)||(t.key==="ArrowRight"&&(t.preventDefault(),ct.next()),t.key==="ArrowLeft"&&(t.preventDefault(),ct.prev()),t.key==="Home"&&ct.goToNumber(1))});var xs={gruas:{pages:Ne,options:{}},accesorios:{pages:We,options:{cart:!0}}};function Ge(){$("[data-catalog]").forEach(t=>{let a=xs[t.dataset.catalog];Ue(t,a.pages(),a.options)})}function Xe(){$("[data-reveal-stagger]").forEach(a=>{let i=Number(a.dataset.revealStagger)||90;$(":scope > *",a).forEach((n,l)=>{n.hasAttribute("data-reveal")||n.setAttribute("data-reveal",a.dataset.revealVariant||"up"),n.style.setProperty("--reveal-delay",`${l*i}ms`)})});let t=new IntersectionObserver(a=>a.forEach(i=>{i.isIntersecting&&(i.target.classList.add("is-revealed"),t.unobserve(i.target))}),{rootMargin:"0px 0px 12% 0px"});$("[data-reveal]").forEach(a=>t.observe(a))}function Ye(){let t=new IntersectionObserver(a=>a.forEach(i=>{if(!i.isIntersecting)return;let n=i.target,l=Number(n.dataset.countTo),r=performance.now(),h=m=>{let b=Math.min(1,(m-r)/1400);n.textContent=Math.round(l*(1-(1-b)**3)).toLocaleString("es-MX"),b<1&&requestAnimationFrame(h)};requestAnimationFrame(h),t.unobserve(n)}),{threshold:.6});$("[data-count-to]").forEach(a=>t.observe(a))}var bs=6500;function Ze(){let t=y("[data-hero]");if(!t)return;let a=$("[data-slide]",t),i=y("[data-hero-dots]",t),n=y("[data-hero-counter]",t),l=E=>String(E).padStart(2,"0"),r=0,h;i.innerHTML=a.map((E,S)=>`<button type="button" class="hero-dot" aria-label="Ver diapositiva ${S+1}"><i></i></button>`).join("");let m=$("button",i);function b(E){r=(E+a.length)%a.length,a.forEach((S,A)=>{S.classList.toggle("is-active",A===r),S.setAttribute("aria-hidden",String(A!==r))}),m.forEach((S,A)=>S.classList.toggle("is-active",A===r)),n&&(n.textContent=`${l(r+1)} / ${l(a.length)}`),v()}function v(){clearInterval(h),h=setInterval(()=>b(r+1),bs)}m.forEach((E,S)=>E.addEventListener("click",()=>b(S))),y("[data-hero-prev]",t).addEventListener("click",()=>b(r-1)),y("[data-hero-next]",t).addEventListener("click",()=>b(r+1)),t.addEventListener("mouseenter",()=>clearInterval(h)),t.addEventListener("mouseleave",()=>{Y(m[r],"is-active"),v()});let M=null;t.addEventListener("touchstart",E=>{M=E.touches[0].clientX},{passive:!0}),t.addEventListener("touchend",E=>{if(M===null)return;let S=E.changedTouches[0].clientX-M;Math.abs(S)>50&&b(r+(S<0?1:-1)),M=null},{passive:!0});let O=$(".hero-photo",t),D=0;t.addEventListener("pointermove",E=>{D||(D=requestAnimationFrame(()=>{D=0;let S=t.getBoundingClientRect(),A=((E.clientX-S.left)/S.width-.5).toFixed(3),R=((E.clientY-S.top)/S.height-.5).toFixed(3);O.forEach(x=>{x.style.setProperty("--mx",A),x.style.setProperty("--my",R)})}))}),b(0)}var bt=1200,at=300,ta=300,It=5,Ke=ta*It,T={weld:420,hoist:600,qc:790},k={x:T.weld,y:252,l1:72,l2:62},Je="M146 272 V214 Q146 206 154 206 H184 L208 234 Q218 238 218 248 V272Z",ys=1120,Qe={plataformas:{outline:"M-12 240 H142 V250 H-12Z M134 240 V222 H142 V240",parts:`
            <path class="fx-body" d="M-12 240 H142 V250 H-12Z"/>
            <rect class="fx-stripes" x="-12" y="250" width="154" height="5"/>
            <path class="fx-steel-thin" d="M10 255 V262 M64 255 V262 M118 255 V262"/>
            <path class="fx-steel" d="M134 240 V222 H142 V240 M-12 250 L-24 262"/>`},rescate:{outline:"M0 230 H140 V262 H0Z M112 230 L20 186",parts:`
            <path class="fx-body" d="M0 230 H140 V262 H0Z"/>
            <path class="fx-line" d="M46 230 V256 M94 230 V256"/>
            <rect class="fx-stripes" x="0" y="256" width="140" height="6"/>
            <path class="fx-steel is-thick" d="M112 230 L20 186"/>
            <path class="fx-steel" d="M112 230 L96 212 M4 262 V278 M-6 278 H14"/>
            <path class="fx-steel-thin" d="M20 186 V214"/>
            <path class="fx-steel" d="M20 214 a5 5 0 1 0 5 5"/>
            <circle class="fx-joint" cx="20" cy="186" r="3.5"/>`},"wheel-lift":{outline:"M0 226 H138 V256 H0Z M128 226 V204 H138 V226 M4 262 L-12 272 H-46",parts:`
            <path class="fx-body" d="M0 226 H138 V256 H0Z"/>
            <path class="fx-line" d="M46 226 V256 M92 226 V256"/>
            <path class="fx-steel-thin" d="M18 241 H28 M64 241 H74 M110 241 H120"/>
            <path class="fx-steel" d="M128 226 V204 H138 V226"/>
            <rect class="fx-stripes" x="0" y="256" width="138" height="6"/>
            <path class="fx-steel-thin" d="M22 262 L-2 272"/>
            <path class="fx-steel is-thick" d="M4 262 L-12 272 H-46"/>
            <path class="fx-steel" d="M-46 264 V280 M-52 272 V254 H-40 M-40 272 V260"/>`},underlift:{outline:"M0 236 H140 V262 H0Z M60 236 V218 H120 V236 M2 270 H-36",parts:`
            <path class="fx-body" d="M0 236 H140 V262 H0Z M60 236 V218 H120 V236"/>
            <rect class="fx-stripes" x="0" y="256" width="140" height="6"/>
            <path class="fx-steel" d="M40 236 L28 204 H8 M28 204 V226"/>
            <path class="fx-steel is-thick" d="M2 270 H-36 L-44 262 M-50 257 H-30"/>`}},Yt=(t,a=16)=>`
    <g class="fx-wheel" data-cx="${t}">
        <circle cx="${t}" cy="${at-a}" r="${a}" class="fx-tire"/>
        <circle cx="${t}" cy="${at-a}" r="${a*.55}" class="fx-rim"/>
        <path d="M${t-a*.55} ${at-a}H${t+a*.55}M${t} ${at-a-a*.55}V${at-a+a*.55}" class="fx-spoke"/>
    </g>`,vs=t=>`
    <g class="fx-truck">
        ${t.map(a=>`<path class="fx-blueprint t-variant" data-variant="${a}" d="${Je} ${Qe[a].outline}"/>`).join("")}
        <rect class="fx-chassis" x="2" y="262" width="216" height="10" rx="2"/>
        <g class="p-cab">
            <path class="fx-cab" d="${Je}"/>
            <path class="fx-glass" d="M154 214 H182 L200 234 H154Z"/>
            <path class="fx-line" d="M152 240 H214 M182 240 V268"/>
        </g>
        <g class="p-bed">
            ${t.map(a=>`<g class="t-variant" data-variant="${a}">${Qe[a].parts}</g>`).join("")}
        </g>
        <g class="p-final">
            <rect class="fx-lightbar" x="155" y="199" width="26" height="7" rx="3"/>
            <rect class="fx-headlight" x="212" y="242" width="6" height="6" rx="1.5"/>
            <text x="151" y="259" class="fx-brand">INVICTUS</text>
        </g>
        ${Yt(34)}${Yt(68)}${Yt(188)}
        <g class="p-badge">
            <rect x="44" y="158" width="134" height="24" rx="12" class="fx-badge"/>
            <text x="111" y="175" class="fx-badge-text" data-badge>\u2713 APROBADA</text>
        </g>
    </g>`,ws=`
    <g class="fx-far">
        <text x="40" y="146" class="fx-sign">ACCESORIOS</text>
        <path d="M30 300 V152 M250 300 V152 M30 152 H250 M30 200 H250 M30 248 H250"/>
        <path d="M52 152 V166 a8 8 0 1 0 8 8 M80 152 V170 a8 8 0 1 0 8 8 M108 152 V164 a8 8 0 1 0 8 8"/>
        <path d="M140 152 v4 M136 160 h8 v8 h-8z M136 172 h8 v8 h-8z M136 184 h8 v8 h-8z"/>
        <rect x="164" y="186" width="34" height="10" rx="4" class="fx-amber"/><rect x="206" y="186" width="34" height="10" rx="4" class="fx-amber"/>
        <rect x="46" y="218" width="44" height="26" rx="4"/><circle cx="68" cy="231" r="8"/>
        <rect x="104" y="218" width="44" height="26" rx="4"/><circle cx="126" cy="231" r="8"/>
        <circle cx="180" cy="232" r="12" class="fx-amber-line"/><circle cx="214" cy="232" r="12" class="fx-amber-line"/>
        <circle cx="66" cy="278" r="18"/><circle cx="66" cy="278" r="8"/><circle cx="112" cy="278" r="18"/><circle cx="112" cy="278" r="8"/>
        <rect x="150" y="262" width="80" height="34" rx="3"/><path d="M150 276 H230"/>
    </g>`,Zt=(t,a)=>`
    <g class="fx-station" transform="translate(${t} 98)">
        <rect x="-62" y="-15" width="124" height="24" rx="5" class="fx-chip"/>
        <text y="2" class="fx-chip-text">${a}</text>
        <path class="fx-chip-line" d="M0 9 V26"/>
    </g>`,$s=`
    <g class="fx-hoist">
        <path class="fx-steel-thin" d="M${T.hoist-90} 124 H${T.hoist+90} M${T.hoist-80} 124 V114 M${T.hoist+80} 124 V114"/>
        <rect class="fx-body" x="${T.hoist-14}" y="124" width="28" height="12" rx="2"/>
        <rect data-hoist-cable class="fx-cable" x="${T.hoist-1}" y="136" width="2" height="100"/>
        <g data-hoist-hook>
            <path class="fx-steel" d="M${T.hoist} 0 v8 a6 6 0 1 1 -6 6"/>
            <path class="fx-part" d="M${T.hoist-28} 30 L${T.hoist-12} 8 H${T.hoist+12} L${T.hoist+28} 30"/>
        </g>
    </g>`,Ms=`
    <g class="fx-qc">
        <path class="fx-steel-thin" d="M${T.qc-26} 300 V160 H${T.qc+26} V300"/>
        <rect class="fx-qc-light" x="${T.qc-10}" y="154" width="20" height="6" rx="3"/>
        <line class="fx-scan" x1="${T.qc}" y1="164" x2="${T.qc}" y2="298"/>
    </g>`,Ss=`
    <g class="fx-dispatch">
        <path class="fx-steel-thin" d="M960 300 V142 H1180 V300"/>
        <path class="fx-led-strip" d="M972 136 H1168"/>
        <text x="1070" y="126" class="fx-sign is-neon">LISTA PARA ENTREGA</text>
    </g>`,Ps=`
    <g class="fx-robot">
        <path class="fx-body" d="M${k.x-22} 300 L${k.x-14} ${k.y+16} H${k.x+14} L${k.x+22} 300Z"/>
        <path data-arm class="fx-arm" d=""/>
        <circle data-joint="0" cx="${k.x}" cy="${k.y}" r="7" class="fx-joint"/>
        <circle data-joint="1" r="6" class="fx-joint"/>
        <circle data-torch r="4" class="fx-torch"/>
    </g>`;function Ls(t){let a=Array.from({length:36},()=>'<circle r="1.6" class="fx-spark" opacity="0"/>').join(""),i=Array.from({length:25},(n,l)=>`<g class="fx-roller" data-cx="${l*50+10}"><circle cx="${l*50+10}" cy="314" r="9"/><path d="M${l*50+3} 314 H${l*50+17}"/></g>`).join("");return`
    <svg class="assembly-scene" viewBox="0 0 ${bt} 360" preserveAspectRatio="xMidYMax slice" role="img" aria-label="L\xEDnea de ensamble de gr\xFAas Invictus: soldadura, montaje y control de calidad">
        <defs>
            <pattern id="fxHazard" width="10" height="6" patternUnits="userSpaceOnUse" patternTransform="skewX(-35)">
                <rect width="5" height="6" fill="#ffb938"/><rect x="5" width="5" height="6" fill="#141515"/>
            </pattern>
        </defs>
        ${ws}
        ${Zt(T.weld,"01 \xB7 SOLDADURA")}${Zt(T.hoist,"02 \xB7 MONTAJE")}${Zt(T.qc,"03 \xB7 CALIDAD")}
        ${$s}
        ${Ss}
        ${Ps}
        <g data-trucks>${Array.from({length:It},()=>vs(t)).join("")}</g>
        ${Ms}
        <g data-sparks>${a}</g>
        <rect class="fx-belt" x="0" y="${at}" width="${bt}" height="30"/>
        <path class="fx-belt-edge" d="M0 ${at} H${bt}"/>
        <path data-belt class="fx-belt-marks" d="M0 ${at+6} H${bt}"/>
        <g data-rollers>${i}</g>
        <rect class="fx-floor" x="0" y="330" width="${bt}" height="30"/>
    </svg>`}function ks(t,a){let i=t-k.x,n=a-k.y,l=k.l1+k.l2-1,r=Math.min(Math.hypot(i,n),l),h=Math.atan2(n,i);i=Math.cos(h)*r,n=Math.sin(h)*r;let m=(r**2-k.l1**2-k.l2**2)/(2*k.l1*k.l2),b=Math.acos(Math.max(-1,Math.min(1,m))),v=h-Math.atan2(k.l2*Math.sin(b),k.l1+k.l2*Math.cos(b));return{ex:k.x+Math.cos(v)*k.l1,ey:k.y+Math.sin(v)*k.l1,tx:k.x+i,ty:k.y+n}}function Cs(t){let a=t.dataset.line?[t.dataset.line]:it;t.innerHTML=Ls(a);let i=t.firstElementChild,n=[...i.querySelectorAll(".fx-truck")].map(p=>({node:p,wheels:[...p.querySelectorAll(".fx-wheel")],badge:p.querySelector("[data-badge]"),badgeGroup:p.querySelector(".p-badge"),badgeLevel:-1,seq:-1})),l=[...i.querySelectorAll(".fx-roller")],r=[...i.querySelectorAll(".fx-spark")].map(p=>({node:p,life:0,x:0,y:0,vx:0,vy:0})),h=i.querySelector("[data-belt]"),m=i.querySelector("[data-arm]"),b=i.querySelector('[data-joint="1"]'),v=i.querySelector("[data-torch]"),M=i.querySelector("[data-hoist-cable]"),O=i.querySelector("[data-hoist-hook]");function D(p,u){let w=ks(p,u);return m.setAttribute("d",`M${k.x} ${k.y} L${w.ex.toFixed(1)} ${w.ey.toFixed(1)} L${w.tx.toFixed(1)} ${w.ty.toFixed(1)}`),b.setAttribute("cx",w.ex.toFixed(1)),b.setAttribute("cy",w.ey.toFixed(1)),v.setAttribute("cx",w.tx.toFixed(1)),v.setAttribute("cy",w.ty.toFixed(1)),w}function E(p,u){p.seq=u;let w=G[a[u%a.length]],C=w.models[Math.floor(u/a.length)%w.models.length];p.node.dataset.type=w.id,p.node.querySelectorAll(".t-variant").forEach(L=>L.classList.toggle("is-shown",L.dataset.variant===w.id)),p.badge.textContent=`\u2713 ${C.model} \xB7 APROBADA`}function S(p){n.forEach((u,w)=>{let C=w*ta+p,L=Math.floor(C/Ke)*It+(It-1-w);L!==u.seq&&E(u,L);let U=C%Ke-260,Q=U+110;u.node.setAttribute("transform",`translate(${U.toFixed(1)} 0)`),u.node.classList.toggle("s1",Q>T.weld),u.node.classList.toggle("s2",Q>T.hoist),u.node.classList.toggle("s3",Q>T.qc);let yt=Math.max(0,Math.min(1,(Q-T.qc)/40,(ys-Q)/60)),rt=Math.round(yt*20)/20;rt!==u.badgeLevel&&(u.badgeLevel=rt,u.badgeGroup.style.opacity=String(rt),u.badgeGroup.setAttribute("transform",`translate(0 ${((1-rt)*8).toFixed(1)})`));let _=p/16*57.3%360;u.wheels.forEach(Jt=>Jt.setAttribute("transform",`rotate(${_.toFixed(1)} ${Jt.dataset.cx} ${at-16})`))})}if(W()){S(170),D(k.x+60,k.y-30);return}let A={x:.5,cx:0,cy:0,active:!1};matchMedia("(pointer: fine)").matches&&(t.addEventListener("pointermove",p=>{let u=t.getBoundingClientRect();A.x=(p.clientX-u.left)/u.width,A.cx=p.clientX,A.cy=p.clientY,A.active=!0}),t.addEventListener("pointerleave",()=>{A.active=!1}));let R={distance:0,speed:1.2,tx:k.x+60,ty:k.y-20},x=0,e=0;function s(p,u){let w=r.find(C=>C.life<=0);w&&Object.assign(w,{x:p,y:u,vx:(Math.random()-.5)*4,vy:-Math.random()*3-.5,life:1})}function o(p){let u=x?Math.min((p-x)/16.67,3):1;x=p;let w=A.active?.3+A.x*3.4:1.3+Math.sin(p/3e3)*.8;R.speed+=(w-R.speed)*.05*u,R.distance+=R.speed*u;let C=R.distance;S(C),h.style.strokeDashoffset=String((-C%64).toFixed(1));let L=C/9*57.3%360;l.forEach(_=>_.setAttribute("transform",`rotate(${L.toFixed(1)} ${_.dataset.cx} 314)`));let U=k.x+70+Math.sin(p/420)*26,Q=228+Math.sin(p/260)*10;if(A.active){let _=new DOMPoint(A.cx,A.cy).matrixTransform(i.getScreenCTM().inverse());U=_.x,Q=Math.min(_.y,290)}R.tx+=(U-R.tx)*.12*u,R.ty+=(Q-R.ty)*.12*u;let yt=D(R.tx,R.ty);Math.random()<.55*u&&s(yt.tx,yt.ty),r.forEach(_=>{_.life<=0||(_.life-=.03*u,_.vy+=.18*u,_.x+=_.vx*u,_.y+=_.vy*u,_.node.setAttribute("cx",_.x.toFixed(1)),_.node.setAttribute("cy",_.y.toFixed(1)),_.node.setAttribute("opacity",Math.max(0,_.life).toFixed(2)))});let rt=54+(Math.sin(p/900)+1)*24;M.setAttribute("height",rt.toFixed(1)),O.setAttribute("transform",`translate(0 ${(136+rt).toFixed(1)})`),e=requestAnimationFrame(o)}let d=()=>{e||(x=0,e=requestAnimationFrame(o))},g=()=>{cancelAnimationFrame(e),e=0},c=!1;new IntersectionObserver(([p])=>{c=p.isIntersecting,t.classList.toggle("is-playing",c),c&&!document.hidden?d():g()}).observe(t),document.addEventListener("visibilitychange",()=>c&&!document.hidden?d():g()),S(0),D(R.tx,R.ty)}function ea(){$('[data-scene="assembly"]').forEach(Cs)}function Tt(t,a=.2){new IntersectionObserver(([i])=>{t.classList.toggle("is-playing",i.isIntersecting),i.isIntersecting&&t.classList.add("has-played")},{threshold:a}).observe(t)}var ot=(t,a)=>t+Math.random()*(a-t);function Es(t,a){let i=Math.max(4,Math.floor(a/48)-1);return Array.from({length:t},(n,l)=>{let r=`left:${Math.round(ot(1,30))*48}px;top:${Math.round(ot(1,i))*48}px;--dur:${ot(3,7).toFixed(1)}s;--delay:${ot(0,6).toFixed(1)}s`;return`<span class="grid-dot${l%5===4?" is-violet":""}" style="${r}"></span>`}).join("")}var aa=["","is-gold","","","is-violet",""];function As(t,a){return Array.from({length:t},(i,n)=>{let l=`left:${ot(0,100).toFixed(1)}%;--dur:${ot(8,16).toFixed(1)}s;--delay:${ot(0,12).toFixed(1)}s;--drift:${ot(-60,60).toFixed(0)}px;--rise:${a}px`;return`<span class="ambient-spark ${aa[n%aa.length]}" style="${l}"></span>`}).join("")}function sa(){let t=W();$("[data-ambient]").forEach(a=>{a.setAttribute("aria-hidden","true");let i=Math.max(400,a.offsetHeight+40),n=Number(a.dataset.dots??14),l=t||document.documentElement.classList.contains("is-lite")?0:Number(a.dataset.sparks??10),r=a.dataset.ambient.includes("light")?'<div class="ambient-blob"></div><div class="ambient-blob is-b"></div>':"";a.innerHTML=`<div class="ambient-aura"></div>${r}<div class="grid-floor"></div><div class="grid-scan"></div>${Es(n,i)}${As(l,i)}`,Tt(a)})}var Is=()=>Object.values(G).reduce((t,a)=>t+a.models.length,0),ia=t=>t.map(a=>({number:a.index+1,name:a.line?.name??a.category.name,page:a.page})),Ts={gruas:{title:"Gr\xFAas de arrastre y salvamento",spine:"Cat\xE1logo de gr\xFAas",index:()=>ia(Gt()),chips:()=>[`${it.length} l\xEDneas de equipo`,`${Is()} modelos`]},accesorios:{title:"Accesorios para gr\xFAas",spine:"Cat\xE1logo de accesorios",index:()=>ia(Xt()),chips:()=>[`${St.length} categor\xEDas \xB7 ${tt.length} accesorios`,"Pedido por WhatsApp"]}},oa=t=>String(t).padStart(2,"0"),Rs=(t,{title:a,spine:i,index:n})=>`
    <span class="book3d-body">
        <span class="book3d-back"></span>
        <span class="book3d-spine">
            <img src="${q("logo-invictus.png")}" alt="">
            <i></i><span>${f(i)}</span><i></i>
            <b>2026</b>
        </span>
        <span class="book3d-edge"></span>
        <span class="book3d-bottom"></span>
        <span class="book3d-ribbon"></span>
        <span class="book3d-inside">
            <img src="${q("logo-invictus.png")}" alt="">
            <span class="book3d-inside-title">\xCDndice</span>
            ${n().map(l=>`<span class="book3d-inside-row"><em>${oa(l.number)}</em><span>${f(l.name)}</span><i></i><b>${oa(l.page)}</b></span>`).join("")}
            <span class="book3d-glow"></span>
        </span>
        <span class="book3d-cover">
            <span class="book3d-front page--right">
                ${Ct({kind:t,year:2026,title:a,action:'<span class="cover-open">Abrir cat\xE1logo \u25B6</span>',titleTag:"span"})}
            </span>
            <span class="book3d-endpaper"></span>
        </span>
    </span>`,Hs=t=>`
    <span class="book-orbit" aria-hidden="true"><i></i></span>
    <span class="book-motes" aria-hidden="true">${Array.from({length:6},(a,i)=>`<i style="--i:${i}"></i>`).join("")}</span>
    ${t.map((a,i)=>`<span class="book-chip ${i?"is-b":"is-a"}" aria-hidden="true"><i></i>${f(a)}</span>`).join("")}`,ra=()=>document.documentElement.classList.contains("is-lite");function na(t){if(t.classList.contains("is-opening"))return;if(W()){location.href=t.href;return}if(ra()){let i=document.createElement("div");i.className="book-curtain",document.body.append(i),requestAnimationFrame(()=>i.classList.add("is-visible")),setTimeout(()=>{location.href=t.href},380);return}t.classList.add("is-opening"),t.closest(".book-stand")?.classList.add("is-launching");let a=document.createElement("div");a.className="book-curtain",document.body.append(a),setTimeout(()=>a.classList.add("is-visible"),520),setTimeout(()=>{location.href=t.href},880)}function Ds(t,a){if(!matchMedia("(pointer: fine)").matches||W()||ra())return;let i=0;t.addEventListener("pointermove",n=>{cancelAnimationFrame(i),i=requestAnimationFrame(()=>{let l=t.getBoundingClientRect();a.style.setProperty("--tx",((n.clientX-l.left)/l.width*2-1).toFixed(3)),a.style.setProperty("--ty",((n.clientY-l.top)/l.height*2-1).toFixed(3))})}),t.addEventListener("pointerleave",()=>{cancelAnimationFrame(i),a.style.removeProperty("--tx"),a.style.removeProperty("--ty")})}function la(){$("[data-book-launch]").forEach(t=>{let a=t.dataset.bookLaunch,i=Ts[a];t.classList.add("book3d"),t.setAttribute("aria-label",`Abrir ${i.spine.toLowerCase()} 2026`),t.innerHTML=Rs(a,i),t.addEventListener("click",l=>{l.preventDefault(),na(t)});let n=t.closest(".book-stand");n&&(n.insertAdjacentHTML("beforeend",Hs(i.chips())),Ds(n,t),Tt(n,0))}),$("[data-book-trigger]").forEach(t=>t.addEventListener("click",a=>{let i=y(`[data-book-launch="${t.dataset.bookTrigger}"]`);i&&(a.preventDefault(),i.scrollIntoView({behavior:"smooth",block:"center"}),na(i))})),addEventListener("pageshow",()=>{$(".book3d.is-opening").forEach(t=>t.classList.remove("is-opening")),$(".book-stand.is-launching").forEach(t=>t.classList.remove("is-launching")),$(".book-curtain").forEach(t=>t.remove())})}function ca(){let t=y("[data-timeline]");if(!t)return;let a=$("[role=tab]",t),i=$("[data-event-year]",t),n=y("#yearStatus",t),l=y("[data-timeline-progress]",t),r=0;function h(m,b=1){r=Math.max(0,Math.min(i.length-1,m)),a.forEach((v,M)=>{v.setAttribute("aria-selected",String(M===r)),v.tabIndex=M===r?0:-1}),i.forEach((v,M)=>{v.toggleAttribute("data-active",M===r),v.setAttribute("aria-hidden",String(M!==r)),v.style.setProperty("--dir",b)}),n.textContent=`Evento ${r+1} de ${i.length}`,l.style.width=`${r/(i.length-1)*100}%`,y("#yearPrev",t).disabled=r===0,y("#yearNext",t).disabled=r===i.length-1}a.forEach((m,b)=>m.addEventListener("click",()=>h(b,b>=r?1:-1))),y("#yearPrev",t).addEventListener("click",()=>h(r-1,-1)),y("#yearNext",t).addEventListener("click",()=>h(r+1,1)),t.addEventListener("keydown",m=>{m.key==="ArrowRight"&&(h(r+1,1),a[r].focus()),m.key==="ArrowLeft"&&(h(r-1,-1),a[r].focus())}),h(0)}var _s=t=>`
    <section class="page-hero text-center">
        <img ${Z(t.photo,{alt:""})} class="page-hero-photo">
        <div class="page-hero-shade"></div>
        <div data-ambient data-sparks="8" class="absolute inset-0 -z-10"></div>
        <p class="eyebrow-led mx-auto w-fit">Equipos Invictus</p>
        <h1 class="drop-in">Gr\xFAas <span class="neon-word">${f(t.name)}</span></h1>
        <p class="mx-auto mt-4 max-w-xl px-4 text-lg text-ink-300">${t.models.length} modelos: ${f(t.models.map(a=>a.model).join(" \xB7 "))}</p>
    </section>`,Fs=()=>`
    <section class="relative -mt-16 pb-14">
        <div class="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:px-8">
            <div class="viewer-photo photo-slot hud-corners group" data-viewer-photo></div>
            <article class="viewer-card" data-viewer-card aria-live="polite"></article>
        </div>
        <div class="mx-auto mt-5 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div class="flex snap-x gap-3 overflow-x-auto pb-2" role="tablist" aria-label="Modelos" data-viewer-tabs></div>
        </div>
    </section>`,Os=t=>`
    <section class="relative isolate overflow-hidden bg-ink-950 pt-16 text-white">
        <div data-ambient data-sparks="6" class="absolute inset-0 -z-10"></div>
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-reveal>
            <p class="eyebrow-led">Planta Invictus</p>
            <h2 class="section-title is-light mt-4">As\xED armamos la l\xEDnea <span class="neon-text">${f(t.name)}</span></h2>
        </div>
        <div data-scene="assembly" data-line="${t.id}" class="mt-2 h-[clamp(240px,26vw,560px)]"></div>
    </section>`;function zs(t,a){return`
        <img ${Z(t.photo,{alt:`Fotograf\xEDa de gr\xFAa ${a.model}`})} class="size-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105">
        <div class="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-transparent"></div>
        <span class="viewer-scan" aria-hidden="true"></span>
        <span class="line-card-chip absolute left-6 top-6">${f(t.name)}</span>
        <p class="absolute bottom-6 left-6 font-display text-7xl font-bold uppercase text-white/95 drop-shadow-xl sm:text-8xl [text-shadow:0_0_24px_rgb(61_255_180/.45)]">${f(a.model)}</p>`}function Ns(t,a){let i=t.specLabels.map((n,l)=>{let{number:r,unit:h}=_t(a.specs[l]);return`
            <li class="spec-tile" style="--i:${l}">
                <span class="sr-only">${f(n)}: ${f(a.specs[l])}</span>
                <span class="spec-tile-icon" aria-hidden="true">${lt[t.specIcons[l]]}</span>
                <span class="spec-tile-copy" aria-hidden="true">
                    <b class="spec-tile-value">${r?`<span data-spec-count="${f(r)}">${f(r)}</span>`:""}<small>${f(h)}</small></b>
                    <span class="spec-tile-label">${f(n)}</span>
                </span>
            </li>`}).join("");return`
        <p class="eyebrow !text-brand-600">Modelo</p>
        <h2 class="font-display text-5xl font-bold uppercase text-ink-900">${f(a.model)}</h2>
        <p class="mt-2 text-lg text-ink-600">${f(a.description)}</p>
        <ul class="spec-tiles" aria-label="Especificaciones">${i}</ul>
        <div class="mt-7 flex flex-wrap gap-3">
            <a class="btn btn-primary" target="_blank" rel="noopener" href="${Mt(a.model,t.name)}"><span class="size-5">${P.whatsapp}</span> Cotizar por WhatsApp</a>
            <a class="btn btn-ghost-dark" href="${I("catalogo.html")}">Ver en el cat\xE1logo</a>
        </div>`}function Ws(t){if(W())return;let a=(Number(t.dataset.run)||0)+1;t.dataset.run=a,$("[data-spec-count]",t).forEach((i,n)=>{let l=i.dataset.specCount,r=Number(l.replace(/,/g,"")),h=(l.split(".")[1]||"").length,m=E=>E.toLocaleString("es-MX",{minimumFractionDigits:h,maximumFractionDigits:h,useGrouping:l.includes(",")}),b=i.closest(".spec-tile"),v=420+n*140,M=1100;i.textContent=m(0);let O=performance.now()+v,D=E=>{if(t.dataset.run!==String(a))return;let S=Math.max(0,Math.min(1,(E-O)/M));i.textContent=m(r*(1-(1-S)**4)),S<1?requestAnimationFrame(D):(i.textContent=l,b.classList.add("is-lit"))};requestAnimationFrame(D)})}function da(){let t=y("[data-equipment]");if(!t)return;let a=G[t.dataset.equipment];t.innerHTML=_s(a)+Fs()+Os(a);let i=y("[data-viewer-tabs]",t);i.innerHTML=a.models.map((h,m)=>`
        <button type="button" role="tab" class="model-tab drop-in" style="--drop-delay:${300+m*80}ms">
            <span class="photo-slot size-14 shrink-0 rounded-xl"><img ${Z(a.photo,{alt:""})}></span>
            <span class="text-left"><b class="block font-display text-xl uppercase">${f(h.model)}</b><small class="text-ink-500">${f(h.specs[0])}</small></span>
        </button>`).join("");let n=y("[data-viewer-photo]",t),l=y("[data-viewer-card]",t),r=h=>{let m=a.models[h];n.innerHTML=zs(a,m),l.innerHTML=Ns(a,m),Y(n,"drop-in"),Y(l,"drop-in"),$("[role=tab]",i).forEach((b,v)=>b.setAttribute("aria-selected",String(v===h))),Ws(l)};$("[role=tab]",i).forEach((h,m)=>h.addEventListener("click",()=>r(m))),r(0)}var qs={contactForm:t=>`Hola, soy ${t.nombre} (${t.correo}). ${t.mensaje}`,repairForm:t=>["Solicitud de reparaci\xF3n",`Nombre: ${t.nombre} ${t.apellido}`,`Correo: ${t.correo}`,`Mensaje: ${t.mensaje}`].join(`
`)};function ha(){Object.entries(qs).forEach(([t,a])=>{let i=y(`#${t}`);i&&i.addEventListener("submit",n=>{n.preventDefault(),window.open(j(a(Object.fromEntries(new FormData(i)))),"_blank","noopener"),B("Abriendo WhatsApp\u2026",{tone:"success"})})})}var nt={name:"Industrias Invictus Crane",city:"Apizaco, Tlaxcala",country:"M\xE9xico",query:"Apizaco, Tlaxcala, M\xE9xico",zoom:14},Kt=()=>encodeURIComponent(nt.query),pa=()=>`https://maps.google.com/maps?q=${Kt()}&z=${nt.zoom}&hl=es&output=embed`,ga=()=>`https://www.google.com/maps/search/?api=1&query=${Kt()}`,ua=()=>`https://www.google.com/maps/dir/?api=1&destination=${Kt()}`;var Bs=()=>`
    <div class="map-card neon-frame is-soft" data-reveal="zoom">
        <div class="map-card-inner">
        <div class="map-frame">
            <div class="map-placeholder" aria-hidden="true">
                <span class="map-pin"><span class="size-7">${P.pin}</span></span>
                <span class="mt-4 font-display text-sm font-semibold uppercase tracking-[.3em] text-ink-500">Cargando mapa\u2026</span>
            </div>
            <iframe src="${pa()}" title="Mapa de ubicaci\xF3n: ${f(nt.city)}, ${f(nt.country)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
        </div>
        <aside class="map-info">
            <div data-ambient data-dots="6" data-sparks="5" class="absolute inset-0 -z-10"></div>
            <span class="map-info-pin"><span class="size-8">${P.pin}</span></span>
            <p class="eyebrow-led mt-6">Te esperamos</p>
            <h3 class="mt-3 font-display text-3xl font-bold uppercase leading-tight text-white">${f(nt.name)}</h3>
            <p class="mt-2 text-lg text-ink-300">${f(nt.city)}, ${f(nt.country)}</p>
            <div class="mt-auto flex flex-col gap-3 pt-8">
                <a class="btn btn-primary" href="${ua()}" target="_blank" rel="noopener"><span class="size-5">${P.route}</span> C\xF3mo llegar</a>
                <a class="btn btn-neon" href="${ga()}" target="_blank" rel="noopener">Abrir en Google Maps</a>
            </div>
        </aside>
        </div>
    </div>`;function ma(){$("[data-location-map]").forEach(t=>{t.innerHTML=Bs();let a=t.querySelector("iframe");a.addEventListener("load",()=>a.classList.add("is-loaded"))})}var Vs=2020,js={years:()=>new Date().getFullYear()-Vs,models:()=>Object.values(G).reduce((t,a)=>t+a.models.length,0),lines:()=>Object.keys(G).length,accessories:()=>tt.length};function fa(){$("[data-stat]").forEach(t=>{let a=js[t.dataset.stat]?.();a!==void 0&&(t.dataset.countTo=a)})}var xa=new Set;function Us(t){let a=t.href.split("#")[0];if(!a||xa.has(a)||a===location.href.split("#")[0]||t.target==="_blank"||t.origin!==location.origin||!/\.html$/.test(new URL(a).pathname))return;xa.add(a);let i=document.createElement("link");i.rel="prefetch",i.href=a,document.head.append(i)}function ba(){if(location.protocol==="file:"||navigator.connection?.saveData)return;let t=a=>{let i=a.target.closest?.("a[href]");i&&Us(i)};document.addEventListener("pointerover",t,{passive:!0}),document.addEventListener("touchstart",t,{passive:!0})}function ya(){let t=new IntersectionObserver(a=>{a.forEach(i=>i.target.classList.toggle("is-offscreen",!i.isIntersecting))},{rootMargin:"150px 0px"});$("main > *, body > footer").forEach(a=>t.observe(a))}function va(){te(),ue(),me(),ke(),da(),Ge(),ma(),oe(),Ze(),ea(),sa(),la(),ca(),ha(),document.body.dataset.page==="cuenta"&&de(),fa(),Xe(),Ye(),ba(),ya(),requestAnimationFrame(()=>document.body.classList.add("is-ready"))}ie();document.readyState==="loading"?document.addEventListener("DOMContentLoaded",va):va();})();
//# sourceMappingURL=app.js.map
