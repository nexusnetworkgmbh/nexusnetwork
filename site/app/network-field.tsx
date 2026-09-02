'use client';
import { useEffect, useRef } from 'react';
type Point={x:number;y:number;r:number;phase:number};

export function NetworkField(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=canvasRef.current,context=canvas?.getContext('2d',{alpha:true});if(!canvas||!context)return;
    let frame=0,width=0,height=0,visible=true,pointerX=.62,pointerY=.52,targetX=.62,targetY=.52;
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const count=innerWidth<700?38:52;
    const nodes:Point[]=Array.from({length:count},(_,i)=>({x:.12+((i*37)%89)/100,y:.07+((i*61)%86)/100,r:i%13===0?3.8:i%5===0?2.4:1.35,phase:i*.71}));
    const edges:Array<[number,number,number]>=[];
    for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const distance=Math.hypot(nodes[i].x-nodes[j].x,nodes[i].y-nodes[j].y);if(distance<.17)edges.push([i,j,1-distance/.17])}
    const resize=()=>{const density=Math.min(devicePixelRatio||1,1.35);width=Math.max(1,canvas.clientWidth);height=Math.max(1,canvas.clientHeight);canvas.width=Math.round(width*density);canvas.height=Math.round(height*density);context.setTransform(density,0,0,density,0,0);if(motion.matches)draw(0)};
    const setTarget=(clientX:number,clientY:number)=>{const box=canvas.getBoundingClientRect();targetX=Math.max(0,Math.min(1,(clientX-box.left)/box.width));targetY=Math.max(0,Math.min(1,(clientY-box.top)/box.height))};
    const move=(event:PointerEvent)=>{if(motion.matches||event.pointerType==='touch')return;setTarget(event.clientX,event.clientY)};
    const touchMove=(event:TouchEvent)=>{if(motion.matches)return;const touch=event.touches[0];if(touch)setTarget(touch.clientX,touch.clientY)};
    const touchEnd=()=>{targetX=.62;targetY=.52};
    const draw=(time:number)=>{
      if(!visible){frame=0;return}pointerX+=(targetX-pointerX)*.055;pointerY+=(targetY-pointerY)*.055;context.clearRect(0,0,width,height);
      const points=nodes.map(node=>({x:(node.x+(pointerX-.5)*.022*Math.sin(node.phase))*width,y:(node.y+(pointerY-.5)*.025*Math.cos(node.phase))*height,r:node.r,phase:node.phase}));
      context.lineWidth=.55;
      for(const[aIndex,bIndex,strength]of edges){const a=points[aIndex],b=points[bIndex];context.strokeStyle=`rgba(221,176,104,${strength*.28})`;context.beginPath();context.moveTo(a.x,a.y);context.lineTo(b.x,b.y);context.stroke()}
      for(let i=0;i<points.length;i++){const point=points[i],pulse=1+Math.sin(time*.0018+point.phase)*.24;if(i%9===0){const glow=context.createRadialGradient(point.x,point.y,0,point.x,point.y,22*pulse);glow.addColorStop(0,'rgba(255,231,181,.82)');glow.addColorStop(.18,'rgba(218,164,81,.38)');glow.addColorStop(1,'rgba(218,164,81,0)');context.fillStyle=glow;context.beginPath();context.arc(point.x,point.y,22*pulse,0,Math.PI*2);context.fill()}context.save();context.shadowColor='rgba(230,176,93,.75)';context.shadowBlur=i%9===0?9:4;context.fillStyle=i%9===0?'#fff4d5':'#dca85e';context.beginPath();context.arc(point.x,point.y,point.r*pulse,0,Math.PI*2);context.fill();context.restore()}
      frame=motion.matches?0:requestAnimationFrame(draw);
    };
    const resume=()=>{if(visible&&!frame){if(motion.matches)draw(0);else frame=requestAnimationFrame(draw)}};
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting&&!document.hidden;resume()},{threshold:.01});
    const visibility=()=>{const box=canvas.getBoundingClientRect();visible=!document.hidden&&box.bottom>0&&box.top<innerHeight;resume();if(!visible&&frame){cancelAnimationFrame(frame);frame=0}};
    const preference=()=>{if(frame)cancelAnimationFrame(frame);frame=0;pointerX=targetX=.62;pointerY=targetY=.52;if(visible)draw(0)};
    motion.addEventListener('change',preference);
    const hero=canvas.closest<HTMLElement>('.hero');
    resize();observer.observe(canvas);addEventListener('resize',resize,{passive:true});canvas.addEventListener('pointermove',move,{passive:true});hero?.addEventListener('touchstart',touchMove,{passive:true});hero?.addEventListener('touchmove',touchMove,{passive:true});hero?.addEventListener('touchend',touchEnd,{passive:true});hero?.addEventListener('touchcancel',touchEnd,{passive:true});document.addEventListener('visibilitychange',visibility);resume();
    return()=>{if(frame)cancelAnimationFrame(frame);motion.removeEventListener('change',preference);observer.disconnect();removeEventListener('resize',resize);canvas.removeEventListener('pointermove',move);hero?.removeEventListener('touchstart',touchMove);hero?.removeEventListener('touchmove',touchMove);hero?.removeEventListener('touchend',touchEnd);hero?.removeEventListener('touchcancel',touchEnd);document.removeEventListener('visibilitychange',visibility)};
  },[]);
  return <canvas ref={canvasRef} className="network-canvas" aria-hidden="true"/>;
}
