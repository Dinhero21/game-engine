export const Camera = {
  integer_approximation: true
}

export const Frame = {
  integer_approximation: {
    frame: false,
    canvas: true
  }
}

// TODO: Make these configurable
export const Debug = {
  camera: {
    movable: false
  },
  entity: {
    tree: false,
    path: false,
    collider: false
  },
  frame: {
    outline_drawImage: false
  }
}

export const globals = {
  camera: Camera,
  frame: Frame,
  debug: Debug
}

export default globals;

(window as any).globals = globals
