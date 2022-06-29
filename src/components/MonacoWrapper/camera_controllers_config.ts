
export interface ICameraTypes {
  kind: "static" | "turntable" | "orbit" | "flight" | "ortho",
  configObject: string
};

export const cameraTypes: ICameraTypes[] = [
  /** Static camera motion controller parameters. */
  {
    kind: "static",
    configObject: `: NovoRender.StaticControllerParams = {  /** Static camera motion controller parameters. */
  
        /** The kind of camera controller. */
        kind: "static",  
  
        /** The world space coordinate of the camera itself (default [0,0,1]). */
        position: [0, 0, 1], // remove to use the default value
  
        /** The world space coordinate to look at (default [0,0,0]). */
        target: [0, 0, 0], // remove to use the default value
  
        /** The world space up vector (default [0,1,0]). */
        up: [0, 1, 0], // remove to use the default value
      }`
  },

  /** Turntable camera motion controller parameters. */
  {
    /** The kind of camera controller. */
    kind: "turntable",
    configObject: `: NovoRender.TurntableControllerParams = {  /** Turntable camera motion controller parameters. */
        
        /** The kind of camera controller. */
        kind: "turntable",
    
        /** The world space coordinate to orbit around. */
        pivotPoint: , // remove to use the default value
    
        /** The camera distance relative to pivot point in meters. */
        distance: , // remove to use the default value
    
        /** The camera elevation relative to pivot point in meters. */
        elevation: , // remove to use the default value
    
        /** The current turntable rotation angle in degrees (+/-180) */
        rotation: , // remove to use the default value
    
        /** The velocity with which the camera rotates in degrees/second. */
        rotationalVelocity:  // remove to use the default value
      }`
  },

  /** Orbit type camera motion controller */
  {
    /** The kind of camera controller. */
    kind: "orbit",
    configObject: `: NovoRender.OrbitControllerParams = {  /** Orbit type camera motion controller */
  
        /** The kind of camera controller. */
        kind: "orbit",
  
        /** The world space coordinate to orbit around. (0,0,0) is default. */
        pivotPoint: , // remove to use the default value
  
        /** The current pitch of camera in degrees (+/-90) */
        pitch: , // remove to use the default value
  
        /** The current yaw of camera in degrees (+/-180) */
        yaw: , // remove to use the default value
  
        /** The camera distance relative to pivot point in meters. */
        distance: , // remove to use the default value
  
        /** The camera distance relative to pivot point in meters. */
        maxDistance: , // remove to use the default value
  
        /** The velocity with which the camera moves through space in meters/second */
        linearVelocity: , // remove to use the default value
  
        /** The velocity with which the camera rotates in degrees/second. */
        rotationalVelocity: , // remove to use the default value
      }`

  },

  /** Flight type camera motion controller */
  {
    /** The kind of camera controller. */
    kind: "flight",
    configObject: `: NovoRender.FlightControllerParams = {  /** Flight type camera motion controller */
  
        /** The kind of camera controller. */
        kind: "flight",
  
        /** The world space coordinate of camera. (0,0,0) is default. */
        position: , // remove to use the default value
  
        /** The world space coordinate to orbit around. (0,0,0) is default. */
        pivotPoint: , // remove to use the default value
  
        /** The current pitch of camera in degrees (+/-90) */
        pitch: , // remove to use the default value
  
        /** The current yaw of camera in degrees (+/-180) */
        yaw: , // remove to use the default value
  
        /** The velocity with which the camera moves through space in meters/second */
        linearVelocity: , // remove to use the default value
  
        /** The allow automatic zoom velocity according last pivot point distance */
        autoZoomSpeed: , // remove to use the default value
  
        /** Near camera clipping distance */
        near: , // remove to use the default value
  
        /** Far camera clipping distance */
        far: , // remove to use the default value
  
        /** Camera flight time in zoomTo*/
        flightTime: , // remove to use the default value
  
        /** Camera Field of View in degrees */
        fieldOfView: , // remove to use the default value
      }`
  },

  /** Ortho type camera motion controller */
  {
    /** The kind of camera controller. */
    kind: "ortho",
    configObject: `: NovoRender.OrthoControllerParams = {  /** Ortho type camera motion controller */
  
        /** The kind of camera controller. */
        kind: "ortho",
  
        /** The world space reference coordinate system to move along. Identity matrix is default. */
        referenceCoordSys: , // remove to use the default value
  
        /** The position in the reference coordinate system. (0,0,0) is default. */
        position: , // remove to use the default value
  
        /** The velocity with which the camera moves through space in meters/second */
        linearVelocity: , // remove to use the default value
  
        /** Near camera clipping distance */
        near: , // remove to use the default value
  
        /** Far camera clipping distance */
        far: , // remove to use the default value
  
        /** Camera (vertical) field of view in meters. */
        fieldOfView: , // remove to use the default value
      }`
  }

];