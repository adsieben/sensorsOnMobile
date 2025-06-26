let vx = 0;
let vy = 0;
let vz = 0;
let lastTimeStamp = Date.now();
let laxa = new Array();      //array for linearAccelerationSensor
let roa  = new Array();      //array for RelativeOrientationSensor
let aoa  = new Array();      //array for AbsoluteOrientationSensor

function canvasClick() {
//   canvas.clear();
ctx.clearRect(0, 0, xMax, yMax );
//   ctx.stroke();
}

function gardenClick() {
  vx = 0;
  vy = 0;
  vz = 0;
}

function sensorListClick() {
  sensorList.textContent = "we start soon ";
  
  const sensorNames = [
    'Accelerometer',
    'Gyroscope',
    'LinearAccelerationSensor',
    'AbsoluteOrientationSensor',
    'RelativeOrientationSensor',
    'GravitySensor',
    'Environmental',
    'AmbientLightSensor',
    'Magnetometer'
    ]
  let s = "";

  for ( let s in sensorNames ) {
      if ( sensorNames[ s ] in window) {
        // The `Accelerometer` interface is supported by the browser.
        // Does the device have an accelerometer, though?
        // It is not to find sensors on the device
        sensorList.textContent += sensorNames[ s ] + " "
      }
  }

  // if ( 'Accelerometer' in window) {
  //   // The `Accelerometer` interface is supported by the browser.
  //   // Does the device have an accelerometer, though?
  //   sensorList.textContent += 'Accelerometer.' + " "
  // }
  const iinterval = setInterval( upDateScreen, 100 );
}

function upDateScreen() {
  output.textContent =  "length la: " + laxa.length + "rel: " + roa.length + "abs: " + aoa.length + "\n";
  if( laxa.length > 0 ){
    //linear acceleration worked
    m4.value = vx.toFixed(3);
    m5.value = vy.toFixed(3);
    m6.value = vz.toFixed(3);
    m7.value = Math.sqrt( Math.pow( vx, 2 ) + Math.pow( vy, 2 ) + Math.pow( vz, 2 ) );
    ball.style.top  = (vy*40/500+42.5) + "vw";
    ball.style.left = (vx*40/500+42.5) + "vw";
    while( laxa.length > 0 ){
      laxa.shift();
    }
    output.textContent += "vx: " + vx + "vy: " + vy + "vz: " + vz;
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

  // if( gyroscope != null ){
  if( gyroscope.activated ){
    let ln = gyroscpopeValues[0].length;
    output.textContent += "gyroscope lenght = " + ln;
    const vh = [m1,m2,m3];
    for ( let el in vh ){
      vh[el].value = 0;
      while( gyroscpopeValues[ el ].length > 0 ){
        vh[el].value += gyroscpopeValues[el].pop() * 10;
      }
      vh[el].value /= ln;
    }
  }else{
    output.textContent += "no gyro";
  }

  ctx.clearRect(0, 0, xMax, yMax );
  // if( sensorAbs != null ){
  if( sensorAbs.activated ){
    output.textContent += "abs " + sensorAbs.quaternion[0].toFixed(3) + " " + sensorAbs.quaternion[1].toFixed(3) 
      + " " + sensorAbs.quaternion[2].toFixed(3) + " " + sensorAbs.quaternion[3].toFixed(3) + "\n";
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
  }
  
  // if( relOrientsensor != null ){
  if( relOrientsensor.activated ){
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
