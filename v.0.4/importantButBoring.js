const options = { frequency: 60, referenceFrame: 'device' };

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
  
}//end class quaternion




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
    
