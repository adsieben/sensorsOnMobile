var ball   = document.querySelector('.ball');
var garden = document.querySelector('.garden');
var output = document.querySelector('.output');
var m1 = document.getElementById('meter_1');
var m2 = document.getElementById('meter_2');
var m3 = document.getElementById('meter_3');
var m4 = document.getElementById('meter_4');

var maxX = garden.clientWidth  - ball.clientWidth;
var maxY = garden.clientHeight - ball.clientHeight;

let vx = 0;
let vy = 0;
let vz = 0;
let lastTimeStamp = Date.now();
let laxa = new Array();      //array for linearAccelerationSensor
let roa  = new Array();      //array for RelativeOrientationSensor
let aoa  = new Array();      //array for AbsoluteOrientationSensor

class cQuaternion {
  constructor ( x, y, z, c ) {
    this.c = c;
    this.x = x;
    this.y = y;
    this.z = z;
}

//a = ab (hamiltonproduct)
static hp( a, b ) {
  return new cQuaternion (
    a.c*b.c - a.x*b.x - a.y*b.y - a.z*b.z,
    a.c*b.x + a.x*b.c + a.y*b.z - a.z*b.y,
    a.c*b.y - a.x*b.z + a.y*b.c + a.z*b.x,
    a.c*b.z + a.x*b.y - a.y*b.x + a.z*b.c
  );
}

hpl( b ) {
//     const ct = this.c*q.c - this.x*q.x - this.y*q.y - this.z*q.z;
//     const xt = this.c*q.x + this.x*q.c + this.y*q.z - this.z*q.y;
//     const yt = this.c*q.y - this.x*q.z + this.y*q.c + this.z*q.x;
//     const zt = this.c*q.z + this.x*q.y - this.y*q.x + this.z*q.c;
  const ct = this.c*b.c - this.x*b.x - this.y*b.y - this.z*b.z;
  const xt = this.c*b.x + this.x*b.c + this.y*b.z - this.z*b.y;
  const yt = this.c*b.y - this.x*b.z + this.y*b.c + this.z*b.x;
  const zt = this.c*b.z + this.x*b.y - this.y*b.x + this.z*b.c;
  this.c  = ct;
  this.xt = xt;
  this.yt = yt;
  this.zt = zt;
}

hpr( b ) {
//     const ct = this.c*q.c - this.x*q.x - this.y*q.y - this.z*q.z;
//     const xt = this.c*q.x + this.x*q.c + this.y*q.z - this.z*q.y;
//     const yt = this.c*q.y - this.x*q.z + this.y*q.c + this.z*q.x;
//     const zt = this.c*q.z + this.x*q.y - this.y*q.x + this.z*q.c;
  const ct = b.c*this.c - b.x*this.x - b.y*this.y - b.z*this.z;
  const xt = b.c*this.x + b.x*this.c + b.y*this.z - b.z*this.y;
  const yt = b.c*this.y - b.x*this.z + b.y*this.c + b.z*this.x;
  const zt = b.c*this.z + b.x*this.y - b.y*this.x + b.z*this.c;
  this.c  = ct;
  this.xt = xt;
  this.yt = yt;
  this.zt = zt;
}

//this' = q^-1 this q (Hamiltonproduct)
rotateQ( q ) {
  this.hpr( cQuaternion.inverse( q ) , this.hpr( q ) );
}

static inverse( q ) {
  return new cQuaternion ( -q.x, -q.y, -q.z, q.c );
}

static inverseA( a ) {
  a[0]=-a[0];
  a[1]=-a[1];
  a[2]=-a[2];
  //  a[3]= a[0];
}

//hamilton product result in a
static hplr( a, b ){
  const ct = a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2];
  const xt = a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1];
  const yt = a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0];
  const zt = a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3];
  a[3] = ct;
  a[0] = xt;
  a[1] = yt;
  a[2] = zt;
}

//hamilton product result in b
static hprr( a, b ){
  const ct = a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2];
  const xt = a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1];
  const yt = a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0];
  const zt = a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3];
  b[3] = ct;
  b[0] = xt;
  b[1] = yt;
  b[2] = zt;
}

static rotate( v, rot ) {
  cQuaternion.hplr( v, rot );
  cQuaternion.inverseA( rot );
  cQuaternion.hprr( rot, v );
  cQuaternion.inverseA( rot );
}

}

function handleOrientation(event) {
var x = event.beta;  // In degree in the range [-180,180)
var y = event.gamma; // In degree in the range [-90,90)

//   output.textContent  = `beta : ${x}\n`;
//   output.textContent += `gamma: ${y}\n`;

// Because we don't want to have the device upside down
// We constrain the x value to the range [-90,90]
if (x >  90) { x =  90};
if (x < -90) { x = -90};

// To make computation easier we shift the range of
// x and y to [0,180]
x += 90;
y += 90;

// 10 is half the size of the ball
// It center the positioning point to the center of the ball
ball.style.top  = (maxY*y/180 - 10) + "px";
ball.style.left = (maxX*x/180 - 10) + "px";
}

// window.addEventListener('deviceorientation', handleOrientation);

const options = { frequency: 60, referenceFrame: 'device' };

let gravitySensor = new GravitySensor(options);//({frequency: 60});

gravitySensor.addEventListener("reading", e => {
 m1.value = gravitySensor.x*10;
 m2.value = gravitySensor.y*10;
 m3.value = gravitySensor.z*10;
 output.textContent  = "Grav.x "+gravitySensor.x.toFixed(3) + "\n";
 output.textContent += "Grav.y "+gravitySensor.y.toFixed(3) + "\n";
 output.textContent += "Grav.z "+gravitySensor.z.toFixed(3) ;
});

// gravitySensor.start();

let aclSensor = new Accelerometer(options);//({frequency: 60});
aclSensor.addEventListener('reading', () => {
 m1.value = aclSensor.x*10;
 m2.value = aclSensor.y*10;
 m3.value = aclSensor.z*10;
 output.textContent  = "Acl.x "+ aclSensor.x.toFixed(3) + "\n";
 output.textContent += "Acl.y "+ aclSensor.y.toFixed(3) + "\n";
 output.textContent += "Acl.z "+ aclSensor.z.toFixed(3);
});

// aclSensor.start();

let laSensor = new LinearAccelerationSensor(options);//({frequency: 60});

laSensor.addEventListener('reading', e => {
//    const sx =
//    const sx =
//    const sx =
 const dt = laSensor.timestamp - lastTimeStamp
 laxa.push( [ (dt).toFixed( 2 ) , laSensor.timestamp.toFixed( 1 ), laSensor.x.toFixed(3), laSensor.y.toFixed(3), laSensor.y.toFixed(3) ] );
 lastTimeStamp = laSensor.timestamp;//Date.now();
// //    output.textContent = "speed  " + ( Date.now() - lastTimeStamp ) + "\n";
// //    output.textContent = "speed  " + ( laSensor.timestamp - lastTimeStamp ) + "\n";
//    vx += laSensor.x * ( dt );
//    vy += laSensor.y * ( dt );
//    vz += laSensor.z * ( dt );
//    m1.value = laSensor.x*10;
//    m2.value = laSensor.y*10;
//    m3.value = laSensor.z*10;
// //    m4.value = lastTimeStamp;
// //    m4.value = Math.sqrt( Math.pow( vx, 2 ) + Math.pow( vy, 2 ) + Math.pow( vz, 2 ) );
//    output.textContent =  "linAcl.x "+ laSensor.x.toFixed(3) + "\n";
//    output.textContent += "linAcl.y "+ laSensor.y.toFixed(3) + "\n";
//    output.textContent += "linAcl.z "+ laSensor.z.toFixed(3) + "\n";
//    output.textContent += "speed  "+ vx.toFixed(3) + "\n";
//    output.textContent += "speed  "+ vy.toFixed(3) + "\n";
//    output.textContent += "speed  "+ vz.toFixed(3) + "\n";
// //    output.textContent += "speed  "+ Math.sqrt( Math.pow( vx, 2 ) + Math.pow( vy, 2 ) + Math.pow( vz, 2 ) ).toFixed(3) ;
//   ball.style.top  = (vy*40/500+42.5) + "vw";
//   ball.style.left = (vx*40/500+42.5) + "vw";

});
// laSensor.start();

let gyroscope = new Gyroscope(options);//({frequency: 60});

gyroscope.addEventListener('reading', e => {
 output.textContent =  "gyr.x "+ gyroscope.x.toFixed(3) + "\n";
 output.textContent += "gyr.y "+ gyroscope.y.toFixed(3) + "\n";
 output.textContent += "gyr.z "+ gyroscope.z.toFixed(3) ;
});
// gyroscope.start();

// const options = { frequency: 60, referenceFrame: 'device' };
const relOrientsensor = new RelativeOrientationSensor({ frequency: 60, referenceFrame: 'screen' });//options);

relOrientsensor.addEventListener('reading', () => {
 const dt = relOrientsensor.timestamp - lastTimeStamp
 roa.push( [ (dt).toFixed( 2 ) , relOrientsensor.timestamp.toFixed( 1 )
   , relOrientsensor.quaternion[0], relOrientsensor.quaternion[1], relOrientsensor.quaternion[2], relOrientsensor.quaternion[3] ] );
 lastTimeStamp = relOrientsensor.timestamp;//Date.now();
// //    output.textContent =  "ros.x "+ relOrientsensor.quaternion[0].toFixed(3) + "\n";
// //    output.textContent += "ros.y "+ relOrientsensor.quaternion[1].toFixed(3) + "\n";
// //    output.textContent += "ros.z "+ relOrientsensor.quaternion[2].toFixed(3) + "\n";
// //    output.textContent += "ros.d "+ relOrientsensor.quaternion[3].toFixed(3) + "\n";
// //    output.textContent += "Abs x"+sensorAbs.quaternion[0].toFixed(3) + "\n";
// //    output.textContent += "Abs y"+sensorAbs.quaternion[1].toFixed(3) + "\n";
// //    output.textContent += "Abs z"+sensorAbs.quaternion[2].toFixed(3) + "\n";
// //    output.textContent += "Abs d"+sensorAbs.quaternion[3].toFixed(3) + "\n";
// // //   // model is a Three.js object instantiated elsewhere.
// // //   model.quaternion.fromArray(sensor.quaternion).inverse();
});
relOrientsensor.addEventListener('error', error => {
if (event.error.name == 'NotReadableError') {
  console.log("Sensor is not available.");
}
});

relOrientsensor.start();

const sensorAbs = new AbsoluteOrientationSensor(options);
sensorAbs.addEventListener('reading', e => {
 const dt = sensorAbs.timestamp - lastTimeStamp
 aoa.push( [ (dt).toFixed( 2 ) , sensorAbs.timestamp.toFixed( 1 )
   , sensorAbs.quaternion[0], sensorAbs.quaternion[1], sensorAbs.quaternion[2], sensorAbs.quaternion[3] ] );
 lastTimeStamp = relOrientsensor.timestamp;//Date.now();
// // //   console.log("Magnetic field along the X-axis " + x);
// // //   console.log("Magnetic field along the Y-axis " + y);
// // //   console.log("Magnetic field along the Z-axis " + z);
// // //   output.textContent  = `x : ${e.x}\n`;
// // //   output.textContent += `y : ${y}\n`;
// // //   output.textContent += `z : ${z}\n`;
// //    output.textContent  = "Abs x"+sensorAbs.quaternion[0].toFixed(3) + "\n";
// //    output.textContent += "Abs y"+sensorAbs.quaternion[1].toFixed(3) + "\n";
// //    output.textContent += "Abs z"+sensorAbs.quaternion[2].toFixed(3) + "\n";
// //    output.textContent += "Abs d"+sensorAbs.quaternion[3].toFixed(3) + "\n";
// // try {
// //    let a = new Float64Array(16);
// // //    for( i = 0; i<16; i++ ) a[i]=0;
// // //    output.textContent += "Abs a"+a[0];
// //    sensorAbs.populateMatrix(a);
// //    output.textContent += "Abs a"+a[0].toFixed(3);
// // } catch (error) {
// //   output.textContent += error;
// //   // expected output: ReferenceError: nonExistentFunction is not defined
// //   // Note - error messages will vary depending on browser
// // }
})

sensorAbs.addEventListener('error', event => {
console.log(event.error.name, event.error.message);
output.textContent  = event.error.name + " " + event.error.message;
})

Promise.all([navigator.permissions.query({ name: "accelerometer" }),
           navigator.permissions.query({ name: "magnetometer" }),
           navigator.permissions.query({ name: "gyroscope" })])
     .then(results => {
       if (results.every(result => result.state === "granted")) {
 output.textContent = "ja";
         sensorAbs.start();
       } else {
 output.textContent = "no";
         console.log("No permissions to use AbsoluteOrientationSensor.");
       }
 });
// sensor.start();

class GravitySensory extends EventTarget {
  #accelerometer = new Accelerometer({frequency: 60});
  #linearAccelerationSensor = new LinearAccelerationSensor({frequency: 60});
//     #linearAccelerationSensor = new LinearAcceleration();
  x = 0;
  y = 0;
  z = 0;
  a = 0;
//     gx = 0;
//     gy = 0;
//     gz = 0;
//     lx = 0;
//     ly = 0;
//     lz = 0;

  handleEvent(ev) {
    this.timestamp = ev.timestamp;
    this.x = this.#accelerometer.x - this.#linearAccelerationSensor.x;
    this.y = this.#accelerometer.y - this.#linearAccelerationSensor.y;
    this.z = this.#accelerometer.z - this.#linearAccelerationSensor.z;
    this.a = Math.sqrt( ( this.x*this.x ) + ( this.y*this.y ) + ( this.z*this.z ) );
//       this.gx = this.#accelerometer.x;
//       this.gy = this.#accelerometer.y;
//       this.gz = this.#accelerometer.z;
//       this.lx = this.#linearAccelerationSensor.x;
//       this.ly = this.#linearAccelerationSensor.y;
//       this.lz = this.#linearAccelerationSensor.z;
    const event = new Event("reading");
    this.dispatchEvent(event);
    this.onreading?.(event);
  }

  start() {
    this.#accelerometer.addEventListener("reading", this);
    this.#accelerometer.start();
  }

  stop() {
    this.#accelerometer.removeEventListener("reading", this);
    this.#accelerometer.stop();
  }
}

g = new GravitySensory();
g.onreading = () => {
   output.textContent  = "Abs x"+g.x.toFixed(3) + "\n";
   output.textContent += "Abs y"+g.y.toFixed(3) + "\n";
   output.textContent += "Abs z"+g.z.toFixed(3) + "\n";
   output.textContent += "Abs a"+g.a.toFixed(3) + "\n";
//     console.log(g.x, g.y, g.z);
}
// g.start();

// // works on firefox but slow
// window.addEventListener('deviceorientation', function(event) {
//      output.textContent  = "Orient a"+event.alpha.toFixed(3) + "\n";
//      output.textContent += "Orient b"+ event.beta.toFixed(3) + "\n";
//      output.textContent += "Orient g"+event.gamma.toFixed(3) + "\n";
// //   console.log(event.alpha + ' : ' + event.beta + ' : ' + event.gamma);
// });

const canvas = document.getElementById("theCanvas");
const ctx = canvas.getContext("2d");
// ctx.fillStyle = "#FF0000";
// ctx.fillStyle = "#000000";
canvas.height = canvas.width;
ctx.transform(1, 0, 0, -1, 0, canvas.height)
const xMax=canvas.width;
const yMax=canvas.height;
ctx.strokeStyle="black";
ctx.beginPath();
ctx.moveTo(0,0);
ctx.lineTo(100,100);
ctx.stroke();
ctx.clearRect(25,25,50,50);


function upDateScreen() {
output.textContent =  "length la: " + laxa.length + "rel: " + roa.length + "abs: " + aoa.length + "\n";
while( laxa.length > 3 ){
//     sleep
//     output.textContent += laxa.shift() + "\n";
  laxa.shift();
}
//   output.textContent = "llenght " + laxa.lenght;
while( roa.length > 3 ){
//     sleep
//     output.textContent += roa.shift() + "\n";
  roa.shift();
}

while( aoa.length > 3 ){
//     sleep
//     output.textContent += aoa.shift() + "\n";
  aoa.shift();
}

output.textContent += "abs " + sensorAbs.quaternion[0].toFixed(3) + " " + sensorAbs.quaternion[1].toFixed(3) + " " + sensorAbs.quaternion[2].toFixed(3) + " " + sensorAbs.quaternion[3].toFixed(3) + "\n";
const aat =[ sensorAbs.quaternion[0], sensorAbs.quaternion[1], sensorAbs.quaternion[2], sensorAbs.quaternion[3] ];
const axv = [ 1, 0, 0, 0 ];
const ayv = [ 0, 1, 0, 0 ];
const azv = [ 0, 0, 1, 0 ];
cQuaternion.rotate( axv, aat );
cQuaternion.rotate( ayv, aat );
cQuaternion.rotate( azv, aat );

output.textContent += axv[0].toFixed(3) + " " + axv[1].toFixed(3) + " " + axv[2].toFixed(3) + "\n";
output.textContent += ayv[0].toFixed(3) + " " + ayv[1].toFixed(3) + " " + ayv[2].toFixed(3) + "\n";
output.textContent += azv[0].toFixed(3) + " " + azv[1].toFixed(3) + " " + azv[2].toFixed(3) + "\n";

ctx.clearRect(0, 0, xMax, yMax );
ctx.beginPath();
ctx.strokeStyle='rgba(128,0,0,0.5)';
ctx.moveTo(0.65*xMax, 0.65*yMax);
ctx.lineTo( (axv[0]*0.4+0.65)*xMax, (axv[1]*0.4+0.65)*yMax );
ctx.stroke();
ctx.beginPath();
ctx.strokeStyle='rgba(0,128,0,0.5)';
ctx.moveTo(0.65*xMax, 0.65*yMax);
ctx.lineTo( (ayv[0]*0.4+0.65)*xMax, (ayv[1]*0.4+0.65)*yMax );
ctx.stroke();
ctx.beginPath();
ctx.moveTo(0.65*xMax, 0.65*yMax);
ctx.strokeStyle='rgba(0,0,128,0.5)';
ctx.lineTo( (azv[0]*0.4+0.65)*xMax, (azv[1]*0.4+0.65)*yMax );
ctx.stroke();

if( relOrientsensor != null ){
  output.textContent += "rel " + relOrientsensor.quaternion[0].toFixed(3) + " " + relOrientsensor.quaternion[1].toFixed(3) + " " + relOrientsensor.quaternion[2].toFixed(3) + " " + relOrientsensor.quaternion[3].toFixed(3) + "\n";
  const at =[ relOrientsensor.quaternion[0], relOrientsensor.quaternion[1], relOrientsensor.quaternion[2], relOrientsensor.quaternion[3] ];

//   output.textContent += at[0].toFixed(3) + "\n";
//   output.textContent += at[1].toFixed(3) + "\n";
//   output.textContent += at[2].toFixed(3) + "\n";
//   output.textContent += at[3].toFixed(3) + "\n";
  const xv = [ 1, 0, 0, 0 ];
  const yv = [ 0, 1, 0, 0 ];
  const zv = [ 0, 0, 1, 0 ];
  cQuaternion.rotate( xv, at );
  cQuaternion.rotate( yv, at );
  cQuaternion.rotate( zv, at );

  output.textContent += xv[0].toFixed(3) + " " + xv[1].toFixed(3) + " " + xv[2].toFixed(3) + "\n";
  output.textContent += yv[0].toFixed(3) + " " + yv[1].toFixed(3) + " " + yv[2].toFixed(3) + "\n";
  output.textContent += zv[0].toFixed(3) + " " + zv[1].toFixed(3) + " " + zv[2].toFixed(3) + "\n";

  ctx.beginPath();
  ctx.moveTo(0.45*xMax, 0.45*yMax);
  ctx.lineTo( (xv[0]*0.4+0.45)*xMax, (xv[1]*0.4+0.45)*yMax );
  ctx.strokeStyle="#900000";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.45*xMax, 0.45*yMax);
  ctx.lineTo( (yv[0]*0.4+0.45)*xMax, (yv[1]*0.4+0.45)*yMax );
  ctx.strokeStyle="#009000";
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0.45*xMax, 0.45*yMax);
  ctx.lineTo( (zv[0]*0.4+0.45)*xMax, (zv[1]*0.4+0.45)*yMax );
  ctx.strokeStyle="#000090";
  ctx.stroke();
}


// // const x
// // ctx.moveTo(0, intercept);
// // ctx.lineTo(xMax, f(xMax, slope, intercept));
// // ctx.strokeStyle = "red";
// // ctx.stroke();
// for( let i = -1; i<2; i+=0.1 ){
//   ctx.moveTo(0, 70);
//   ctx.strokeStyle = "red";
//   ctx.lineTo(xMax, f(xMax, i, 70));
//   ctx.stroke();
//   ctx.moveTo(0, 70);
//   ctx.strokeStyle = "white";
//   ctx.lineTo(xMax, f(xMax, i, 70));
//   ctx.stroke();
// }

}

function canvasClick() {
//   canvas.clear();
ctx.clearRect(0, 0, xMax, yMax );
//   ctx.stroke();
}

const iinterval = setInterval( upDateScreen, 100 );

