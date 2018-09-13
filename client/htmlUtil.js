var svgNS="http://www.w3.org/2000/svg", DIV='<div>';
var SVGnode= (tag)=> document.createElementNS(svgNS,tag);
var line= (parent,x1,y1,x2,y2,stroke,width,__,aLine)=> {
  aLine=$(SVGnode('line'))
  parent.append(aLine.attr({ x1:x1, y1:y1, x2:x2, y2:y2, stroke:stroke, "stroke-width":width }));
  return aLine;
};
var Tag=(name,s)=> '<'+name+'>'+s+'</'+name+'>';