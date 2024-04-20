/**
 * Based on: https://gist.github.com/omimo/caefe6c20f4e6e454c6542d1c748c915
 * by @author omimo / https://gist.github.com/omimo
 */

// Variablen
var skeleton;
var positions;
var figureScale = 175;
var h = 420;
var w = 380;
var gap = 0;
var skip = 1;
var traillength = 20;


//******************************************************************//

export function run(file_name) {
    // Load Data from Flask
    d3.json('/motion/draw/connnectivity', function(error, json) {
        if (error) return console.warn(error);
        skeleton = json

        var dataURL = '/motion/draw/get_numpy_data?file_name=' + file_name;
        d3.json(dataURL, function(error, json) {
            if (error) return console.warn(error);
            positions = json;
            positions.splice(0, 2);
            positions.splice(positions.length-2, 190);
            
            var frames = positions.map(function(ff, j) {
              return ff.map(function(d, i) {
              return {
                  x: (d.x + 1) * figureScale,
                  y: -1 * d.y * figureScale + h-120,
                  z: d.z * figureScale
              };
              });
          });
            var svg = draw(frames);
            
            var fr = 1/30;
            var startTimeJ = Date.now();   

            anim0(frames.slice(0,traillength),svg);
            
            window.setInterval(function() {
                var f = traillength + Math.floor((Date.now() - startTimeJ)/1000 / fr);                                        
                
                if (f > frames.length) {
                    startTimeJ=Date.now();
                    f = 0;
                }
                var segment = frames.slice(f-traillength,f);
                anim(segment,svg);                    
                
            }, fr * 1000);
            console.log('-----------------------------Done with every thing ---------------------------------')
        });
    });
}
    
function draw(frames) {
    console.log('Drawing...');
   // Prep the environment 
   var parent = d3.select("body").select("#c1");
   var svg = parent.append("svg")
     .attr("id","svg")
     .attr("width", w)
     .attr("height", h)
     .attr("overflow", "scroll")
     .style("display", "inline-block");
 
   // Scale the data
   
   var index = 30;
 
   // Joints
   var headJoint = 15;
 
   svg.selectAll("g.joints")
     .data(frames.filter(function(d, i) {
       return i % skip == 0;
     }))
     .enter()
     .append("g")
     .attr("transform", function(d, i) {
       return "translate(" + (i * gap) + ",0)";
     })
     .selectAll("circle.f" + index)
     .data(function(d, i) {
       return d
     })
     .enter()
     .append("circle")
     .attr("cx", function(d) {
       return d.x;
     }).attr("cy", function(d) {
       return d.y;
     }).attr("r", function(d, i) {
       if (i == headJoint)
         return .8;
       else
         return .8;
     }).attr("fill",'grey')
     .attr("fill-opacity", function(d, j, k) {
         if ((k * skip) < (frames.length/ 2))
         var coef = (k * skip)/frames.length;
       else
         var coef = (frames.length - (k * skip))/frames.length;
       return coef;
     });
 
     try {    
         if (window.top && window.top.loaded) 
             window.top.loaded();  
     } catch(err) {
         console.log(err);
     }

     console.log('Done with Drawning!')
     return svg;
 }
 
 function anim0(frames, svg) {
    console.log('Starting with anim0')
   // Joints
   var headJoint = 15;
 
   svg.selectAll("g.jointsanim")
     .data(frames)
     .enter()
     .append("g")
     .attr("class","jointsanim")
     .selectAll("circle.anim")
     .data(function(d, i) {
       return d;
     })
     .enter()
     .append("circle")
     .attr("class","anim")
     .attr("cx", function(d) {
       return d.x;
     }).attr("cy", function(d) {
       return d.y;
     }).attr("r", function(d, i) {
       if (i == headJoint)
         return .8;
       else
         return 1.8;
     })
     .attr("fill",'#cc6666')
     .attr("fill-opacity",1);
 
 
   // Bones
 
  svg.selectAll("g.boneanim")
     .data(frames)
     .enter()
     .append("g")
     .attr("class","boneanim")
     .selectAll("line.anim")
     .data(skeleton)
     .enter()
     .append("line")  
     .attr("class","anim")   
     .attr("stroke", "#cc6666")
     .attr("stroke-opacity", .8)
     .attr("stroke-width", 2) 
     .attr("x1", function(d, j, k) {         
       return frames[k][d[0]].x;
     })
     .attr("x2", function(d, j, k) {
       return frames[k][d[1]].x;
     })
     .attr("y1", function(d, j, k) {
       return frames[k][d[0]].y;
     })
     .attr("y2", function(d, j, k) {
       return frames[k][d[1]].y;
     });
    console.log('Done with anim0')
 }
 
 function anim(frames, svg) {
    console.log('Starting with anim')
   // Joints
   var headJoint = 15;
 
  svg.selectAll("g.jointsanim")
     .data(frames)
     .selectAll("circle.anim")
     .data(function(d, i) {
       return d;
     })
     .attr("cx", function(d) {
       return d.x;
     })
     .attr("cy", function(d) {
       return d.y;
     })
     .attr("r", function(d, i, k) {
         return .2 + 1.5 * k/traillength;
     })
     .attr("fill",'#cc6666')
     .attr("fill-opacity", function (d,i, k) {
         return k/traillength;
     });
 
 
   // Bones
 
  svg.selectAll("g.boneanim")
     .data(frames)
     .selectAll("line.anim")
     .data(skeleton)
     .attr("stroke", "#cc6666")
     .attr("stroke-opacity",  function (d,i, k) {
         return .1 + 0.3 * k/traillength;
     })
     .attr("stroke-width", function (d,i, k) {
         return 3 * k/traillength;
     })
     .attr("x1", function(d, j, k) {
       return frames[k][d[0]].x;
     })
     .attr("x2", function(d, j, k) {
       return frames[k][d[1]].x;
     })
     .attr("y1", function(d, j, k) {
       return frames[k][d[0]].y;
     })
     .attr("y2", function(d, j, k) {
       return frames[k][d[1]].y;
     });
     console.log('Done with anim')
 }